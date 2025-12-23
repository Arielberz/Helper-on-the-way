const Request = require('../models/requestsModel');
const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');
const sendResponse = require('../utils/sendResponse');
const { calculateCommission, getCommissionRatePercentage } = require('../utils/commissionUtils');
const { ilsToAgorot, agorotToIlsString, agorotToIls, isValidAgorotAmount } = require('../utils/currencyConverter');
const { createPayPalOrder, capturePayPalOrder, getPayPalOrderDetails } = require('../services/paypalService');

// Create PayPal order
exports.createOrder = async (req, res) => {
    try {
        const { requestId } = req.body;
        const userId = req.userId;

        console.log('🔵 Creating PayPal order request:', { requestId, userId });

        if (!userId) {
            console.error('No userId found in request');
            return sendResponse(res, 401, false, "unauthorized");
        }

        if (!requestId) {
            console.error('Missing requestId');
            return sendResponse(res, 400, false, "requestId is required");
        }

        // Verify the request exists and user is the requester
        const request = await Request.findById(requestId);
        if (!request) {
            return sendResponse(res, 404, false, "request not found");
        }

        if (request.user.toString() !== userId) {
            return sendResponse(res, 403, false, "not authorized to pay for this request");
        }

        if (!request.helper) {
            return sendResponse(res, 400, false, "no helper assigned to this request");
        }

        // Get amount in agorot from request (already stored as agorot in DB)
        const amountAgorot = request.payment?.offeredAmount || 0;

        if (!isValidAgorotAmount(amountAgorot)) {
            return sendResponse(res, 400, false, "invalid payment amount");
        }

        if (amountAgorot === 0) {
            return sendResponse(res, 400, false, "cannot use PayPal for free help - use 'Confirm Completion' button instead");
        }

        console.log('💰 Payment amount:', {
            agorot: amountAgorot,
            ils: agorotToIls(amountAgorot),
            currency: 'ILS'
        });

        // Create PayPal order with ILS currency
        const returnUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/paypal/success?requestId=${requestId}`;
        const cancelUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/paypal/cancel?requestId=${requestId}`;
        
        const paypalOrder = await createPayPalOrder(
            amountAgorot,
            requestId,
            `Helper Service - ${request.problemType}`,
            returnUrl,
            cancelUrl
        );

        console.log('🔵 PayPal order response:', JSON.stringify(paypalOrder, null, 2));

        // Get approval URL
        if (!paypalOrder || !paypalOrder.links || !Array.isArray(paypalOrder.links)) {
            console.error('❌ Invalid PayPal order response:', paypalOrder);
            return sendResponse(res, 500, false, "invalid PayPal order response - missing links array");
        }

        const approvalUrl = paypalOrder.links.find(link => link.rel === 'approve')?.href;

        if (!approvalUrl) {
            console.error('❌ No approval URL in links:', paypalOrder.links);
            return sendResponse(res, 500, false, "failed to create PayPal order - no approval URL");
        }

        sendResponse(res, 200, true, "order created successfully", {
            orderId: paypalOrder.id,
            approvalUrl,
            amount: {
                agorot: amountAgorot,
                ils: agorotToIls(amountAgorot),
                currency: 'ILS'
            }
        });

    } catch (error) {
        console.error('❌ Error creating PayPal order:', error);
        console.error('❌ Error stack:', error.stack);
        sendResponse(res, 500, false, error.message || "server error creating order");
    }
};

// Capture PayPal order (after user approves)
exports.captureOrder = async (req, res) => {
    try {
        const { orderId, requestId } = req.body;
        const userId = req.userId;

        console.log('🔵 Capturing PayPal order:', { orderId, requestId, userId });

        if (!userId) {
            console.error('No userId in request');
            return sendResponse(res, 401, false, "unauthorized");
        }

        if (!orderId || !requestId) {
            console.error('Missing orderId or requestId:', { orderId, requestId });
            return sendResponse(res, 400, false, "orderId and requestId are required");
        }

        // Verify the request
        const request = await Request.findById(requestId);
        if (!request) {
            return sendResponse(res, 404, false, "request not found");
        }

        if (request.user.toString() !== userId) {
            return sendResponse(res, 403, false, "not authorized");
        }

        // Capture the PayPal payment
        const captureData = await capturePayPalOrder(orderId);

        if (captureData.status !== 'COMPLETED') {
            console.error('❌ PayPal capture not completed:', captureData.status);
            return sendResponse(res, 400, false, "payment capture failed");
        }

        // Extract payment details
        const captureInfo = captureData.purchase_units[0].payments.captures[0];
        const capturedCurrency = captureInfo.amount.currency_code;
        const capturedValueString = captureInfo.amount.value;
        
        console.log('✅ Payment captured:', {
            currency: capturedCurrency,
            value: capturedValueString
        });

        // Verify currency is ILS
        if (capturedCurrency !== 'ILS') {
            console.error('❌ Wrong currency captured:', capturedCurrency);
            return sendResponse(res, 400, false, `Payment captured in wrong currency: ${capturedCurrency}`);
        }

        // Convert captured amount to agorot
        const capturedIls = parseFloat(capturedValueString);
        const capturedAgorot = ilsToAgorot(capturedIls);

        // Verify amount matches what was expected
        const expectedAgorot = request.payment?.offeredAmount || 0;
        if (Math.abs(capturedAgorot - expectedAgorot) > 1) { // Allow 1 agora difference for rounding
            console.error('❌ Amount mismatch:', { captured: capturedAgorot, expected: expectedAgorot });
            return sendResponse(res, 400, false, "payment amount mismatch");
        }

        // Calculate commission and helper payout (working in agorot)
        const { commissionAmount, helperAmount } = calculateCommission(agorotToIls(capturedAgorot));
        const commissionAgorot = ilsToAgorot(commissionAmount);
        const helperAgorot = ilsToAgorot(helperAmount);

        console.log('💰 Payment breakdown:', {
            total_agorot: capturedAgorot,
            total_ils: agorotToIls(capturedAgorot),
            commission_agorot: commissionAgorot,
            commission_ils: agorotToIls(commissionAgorot),
            helper_agorot: helperAgorot,
            helper_ils: agorotToIls(helperAgorot)
        });

        // Update request payment status
        request.payment = request.payment || {};
        request.payment.isPaid = true;
        request.payment.paidAt = Date.now();
        request.payment.paymentMethod = 'paypal';
        request.payment.offeredAmount = capturedAgorot;
        request.payment.helperAmount = helperAgorot;
        request.payment.commissionAmount = commissionAgorot;
        request.payment.currency = 'ILS';
        
        // Mark request as completed if requester has confirmed
        if (request.requesterConfirmedAt) {
            request.status = 'completed';
            request.completedAt = Date.now();
        }
        
        await request.save();

        // Credit helper's wallet (after commission) - using ILS for wallet
        if (request.helper) {
            const helper = await User.findById(request.helper);
            if (helper) {
                const balanceBefore = helper.balance || 0;
                const helperEarningIls = agorotToIls(helperAgorot);
                helper.balance = (helper.balance || 0) + helperEarningIls;
                helper.totalEarnings = (helper.totalEarnings || 0) + helperEarningIls;
                await helper.save();

                // Create transaction record
                await Transaction.create({
                    user: helper._id,
                    type: 'earning',
                    amount: helperEarningIls,
                    balanceBefore,
                    balanceAfter: helper.balance,
                    currency: 'ILS',
                    description: `PayPal payment received for helping with ${request.problemType}`,
                    request: request._id,
                    status: 'completed',
                    commission: {
                        amount: agorotToIls(commissionAgorot),
                        rate: getCommissionRatePercentage()
                    }
                });

                console.log('✅ Helper credited:', {
                    helper_id: helper._id,
                    amount_ils: helperEarningIls,
                    new_balance: helper.balance
                });
            }
        }

        sendResponse(res, 200, true, "payment successful", {
            captureId: captureData.id,
            totalAmount: agorotToIls(capturedAgorot),
            helperAmount: agorotToIls(helperAgorot),
            commissionAmount: agorotToIls(commissionAgorot),
            currency: 'ILS'
        });

    } catch (error) {
        console.error('❌ Error capturing PayPal order:', error);
        sendResponse(res, 500, false, error.message || "server error capturing payment");
    }
};

// Pay with balance
exports.payWithBalance = async (req, res) => {
    let requesterBalanceReverted = false;
    let requester = null;
    let requesterBalanceBefore = 0;

    try {
        const { requestId } = req.body;
        const userId = req.userId;



        if (!userId) {
            return sendResponse(res, 401, false, "unauthorized");
        }

        if (!requestId) {
            return sendResponse(res, 400, false, "requestId is required");
        }

        // Get the request
        const request = await Request.findById(requestId);
        if (!request) {
            return sendResponse(res, 404, false, "request not found");
        }

        if (request.user.toString() !== userId) {
            return sendResponse(res, 403, false, "not authorized to pay for this request");
        }

        if (!request.helper) {
            return sendResponse(res, 400, false, "no helper assigned to this request");
        }

        if (request.payment?.isPaid) {
            return sendResponse(res, 400, false, "payment already completed");
        }

        const amount = request.payment?.offeredAmount || 0;
        if (amount < 0) {
            return sendResponse(res, 400, false, "invalid payment amount");
        }

        // Get requester
        requester = await User.findById(userId);
        if (!requester) {
            return sendResponse(res, 404, false, "user not found");
        }

        // Only process balance transfer if amount > 0
        if (amount > 0) {
            // Check if requester has enough balance
            if ((requester.balance || 0) < amount) {
                return sendResponse(res, 400, false, "insufficient balance");
            }

            // Deduct from requester's balance
            requesterBalanceBefore = requester.balance || 0;
            requester.balance -= amount;
            await requester.save();

        }

        try {
            // Only create transactions and transfer money if amount > 0
            if (amount > 0) {
                // Calculate commission and helper payout
                const { commissionAmount, helperAmount } = calculateCommission(amount);

                // Create deduction transaction for requester
                await Transaction.create({
                    user: requester._id,
                    type: 'payment',
                    amount: -amount,
                    balanceBefore: requesterBalanceBefore,
                    balanceAfter: requester.balance,
                    currency: request.payment?.currency || 'ILS',
                    description: `Payment for help request: ${request.problemType}`,
                    request: request._id,
                    status: 'completed'
                });


                // Credit helper's wallet (after commission)
                const helper = await User.findById(request.helper);
                if (helper) {
                    const helperBalanceBefore = helper.balance || 0;
                    helper.balance = (helper.balance || 0) + helperAmount;
                    helper.totalEarnings = (helper.totalEarnings || 0) + helperAmount;
                    await helper.save();


                    // Create earning transaction for helper
                    await Transaction.create({
                        user: helper._id,
                        type: 'earning',
                        amount: helperAmount,
                        balanceBefore: helperBalanceBefore,
                        balanceAfter: helper.balance,
                        currency: request.payment?.currency || 'ILS',
                        description: `Payment received for helping with ${request.problemType}`,
                        request: request._id,
                        status: 'completed',
                        commission: {
                            amount: commissionAmount,
                            rate: getCommissionRatePercentage()
                        }
                    });



                }
            } else {

            }

            // Update request payment status
            request.payment = request.payment || {};
            request.payment.isPaid = true;
            request.payment.paidAt = Date.now();
            request.payment.paymentMethod = amount > 0 ? 'balance' : 'free';
            
            // Save commission details if amount > 0
            if (amount > 0) {
                const { commissionAmount, helperAmount } = calculateCommission(amount);
                request.payment.helperAmount = helperAmount;
                request.payment.commissionAmount = commissionAmount;
            }
            
            // Mark request as completed if requester has confirmed
            if (request.requesterConfirmedAt) {
                request.status = 'completed';
                request.completedAt = Date.now();

            }
            
            await request.save();


            sendResponse(res, 200, true, amount > 0 ? "payment successful" : "help completion confirmed", {
                amount,
                currency: request.payment?.currency || 'ILS',
                newBalance: requester.balance
            });

        } catch (innerError) {
            console.error('Error during payment processing, reverting requester balance:', innerError);
            // Revert requester balance
            requester.balance = requesterBalanceBefore;
            await requester.save();
            requesterBalanceReverted = true;
            throw innerError;
        }

    } catch (error) {
        console.error('Error processing balance payment:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        sendResponse(res, 500, false, "server error processing payment");
    }
};
