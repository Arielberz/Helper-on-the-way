/*
  קובץ זה אחראי על:
  - טיפול בבקשות HTTP לתשלומים: PayPal, ארנק, משיכות
  - יצירת וביצוע תשלומים בפייפאל
  - ניהול ארנק המשתמש: הפקדה, משיכה, יתרה
  - חישוב עמלות והמרת מטבע
  - קורא לשירות paypalService לאינטגרציית PayPal

  הקובץ משמש את:
  - נתיב התשלומים (paymentRouter)
  - הצד הקליינט לעסקאות כספיות

  הקובץ אינו:
  - מתחבר ישירות ל-PayPal API - זה ב-paypalService
*/

const Request = require('../models/requestsModel');
const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');
const sendResponse = require('../utils/sendResponse');
const { calculateCommission, getCommissionRatePercentage } = require('../utils/commissionUtils');
const { ilsToAgorot, agorotToIlsString, agorotToIls, isValidAgorotAmount } = require('../utils/currencyConverter');
const { createPayPalOrder, capturePayPalOrder, getPayPalOrderDetails } = require('../services/paypalService');

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

        const amountIls = request.payment?.offeredAmount || 0;

        if (typeof amountIls !== 'number' || amountIls < 0) {
            return sendResponse(res, 400, false, "invalid payment amount");
        }

        if (amountIls === 0) {
            return sendResponse(res, 400, false, "cannot use PayPal for free help - use 'Confirm Completion' button instead");
        }

        const amountAgorot = ilsToAgorot(amountIls);

        console.log('💰 Payment amount:', {
            ils: amountIls,
            agorot: amountAgorot,
            currency: 'ILS'
        });

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
                ils: amountIls,
                currency: 'ILS'
            }
        });

    } catch (error) {
        console.error('❌ Error creating PayPal order:', error);
        console.error('❌ Error stack:', error.stack);
        sendResponse(res, 500, false, error.message || "server error creating order");
    }
};

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

        const request = await Request.findById(requestId);
        if (!request) {
            return sendResponse(res, 404, false, "request not found");
        }

        if (request.user.toString() !== userId) {
            return sendResponse(res, 403, false, "not authorized");
        }

        const captureData = await capturePayPalOrder(orderId);

        if (captureData.status !== 'COMPLETED') {
            console.error('❌ PayPal capture not completed:', captureData.status);
            return sendResponse(res, 400, false, "payment capture failed");
        }

        const captureInfo = captureData.purchase_units[0].payments.captures[0];
        const capturedCurrency = captureInfo.amount.currency_code;
        const capturedValueString = captureInfo.amount.value;
        
        console.log('✅ Payment captured:', {
            currency: capturedCurrency,
            value: capturedValueString
        });

        if (capturedCurrency !== 'ILS') {
            console.error('❌ Wrong currency captured:', capturedCurrency);
            return sendResponse(res, 400, false, `Payment captured in wrong currency: ${capturedCurrency}`);
        }

        const capturedIls = parseFloat(capturedValueString);

        const expectedIls = request.payment?.offeredAmount || 0;
        if (Math.abs(capturedIls - expectedIls) > 0.01) {
            console.error('❌ Amount mismatch:', { captured: capturedIls, expected: expectedIls });
            return sendResponse(res, 400, false, "payment amount mismatch");
        }

        const { commissionAmount, helperAmount } = calculateCommission(capturedIls);

        console.log('💰 Payment breakdown:', {
            total_ils: capturedIls,
            commission_ils: commissionAmount,
            helper_ils: helperAmount
        });

        request.payment = request.payment || {};
        request.payment.isPaid = true;
        request.payment.paidAt = Date.now();
        request.payment.paymentMethod = 'paypal';
        request.payment.offeredAmount = capturedIls;
        request.payment.helperAmount = helperAmount;
        request.payment.commissionAmount = commissionAmount;
        request.payment.currency = 'ILS';
        
        if (request.requesterConfirmedAt) {
            request.status = 'completed';
            request.completedAt = Date.now();
        }
        
        await request.save();

        if (request.helper) {
            const helper = await User.findById(request.helper);
            if (helper) {
                const balanceBefore = helper.balance || 0;
                helper.balance = (helper.balance || 0) + helperAmount;
                helper.totalEarnings = (helper.totalEarnings || 0) + helperAmount;
                await helper.save();

                await Transaction.create({
                    user: helper._id,
                    type: 'earning',
                    amount: helperAmount,
                    balanceBefore,
                    balanceAfter: helper.balance,
                    currency: 'ILS',
                    description: `PayPal payment received for helping with ${request.problemType}`,
                    request: request._id,
                    status: 'completed',
                    commission: {
                        amount: commissionAmount,
                        rate: getCommissionRatePercentage()
                    }
                });

                console.log('✅ Helper credited:', {
                    helper_id: helper._id,
                    amount_ils: helperAmount,
                    new_balance: helper.balance
                });
            }
        }

        sendResponse(res, 200, true, "payment successful", {
            captureId: captureData.id,
            totalAmount: capturedIls,
            helperAmount: helperAmount,
            commissionAmount: commissionAmount,
            currency: 'ILS'
        });

    } catch (error) {
        console.error('❌ Error capturing PayPal order:', error);
        sendResponse(res, 500, false, error.message || "server error capturing payment");
    }
};

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

        requester = await User.findById(userId);
        if (!requester) {
            return sendResponse(res, 404, false, "user not found");
        }

        if (amount > 0) {
            if ((requester.balance || 0) < amount) {
                return sendResponse(res, 400, false, "insufficient balance");
            }

            requesterBalanceBefore = requester.balance || 0;
            requester.balance -= amount;
            await requester.save();

        }

        try {
            if (amount > 0) {
                const { commissionAmount, helperAmount } = calculateCommission(amount);

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


                const helper = await User.findById(request.helper);
                if (helper) {
                    const helperBalanceBefore = helper.balance || 0;
                    helper.balance = (helper.balance || 0) + helperAmount;
                    helper.totalEarnings = (helper.totalEarnings || 0) + helperAmount;
                    await helper.save();


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

            request.payment = request.payment || {};
            request.payment.isPaid = true;
            request.payment.paidAt = Date.now();
            request.payment.paymentMethod = amount > 0 ? 'balance' : 'free';
            
            if (amount > 0) {
                const { commissionAmount, helperAmount } = calculateCommission(amount);
                request.payment.helperAmount = helperAmount;
                request.payment.commissionAmount = commissionAmount;
            }
            
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
