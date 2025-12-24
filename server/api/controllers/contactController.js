const ContactMessage = require('../models/contactMessageModel');
const sendResponse = require('../utils/sendResponse');

// POST /api/contact - Submit new contact message
exports.submitContactMessage = async (req, res) => {
    try {
        const { fullName, email, phone, subject, message } = req.body;

        // Validate required fields
        if (!fullName || !email || !message) {
            return sendResponse(res, 400, false, 'שם מלא, אימייל והודעה הם שדות חובה');
        }

        // Validate email format
        const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!emailRegex.test(email)) {
            return sendResponse(res, 400, false, 'כתובת אימייל לא תקינה');
        }

        // Create new contact message
        const contactMessage = new ContactMessage({
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone ? phone.trim() : undefined,
            subject: subject ? subject.trim() : undefined,
            message: message.trim()
        });

        await contactMessage.save();

        return sendResponse(res, 201, true, 'ההודעה נשלחה בהצלחה, נחזור אליך בהקדם', { id: contactMessage._id });
    } catch (error) {
        console.error('Error submitting contact message:', error);
        return sendResponse(res, 500, false, 'שגיאה בשליחת ההודעה, אנא נסה שוב');
    }
};

// GET /api/admin/contact-messages - Get all contact messages (Admin only)
exports.getAllContactMessages = async (req, res) => {
    try {
        const messages = await ContactMessage.find()
            .sort({ createdAt: -1 })
            .lean();

        return sendResponse(res, 200, true, 'הודעות צור קשר נשלפו בהצלחה', { messages });
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        return sendResponse(res, 500, false, 'שגיאה בשליפת ההודעות');
    }
};

// PATCH /api/admin/contact-messages/:id/read - Mark message as read (Admin only)
exports.markMessageAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const { isRead } = req.body;

        const message = await ContactMessage.findById(id);
        
        if (!message) {
            return sendResponse(res, 404, false, 'הודעה לא נמצאה');
        }

        message.isRead = isRead !== undefined ? isRead : true;
        await message.save();

        return sendResponse(res, 200, true, 'סטטוס ההודעה עודכן בהצלחה', { message });
    } catch (error) {
        console.error('Error updating message status:', error);
        return sendResponse(res, 500, false, 'שגיאה בעדכון סטטוס ההודעה');
    }
};

// DELETE /api/admin/contact-messages/:id - Delete message (Admin only)
exports.deleteContactMessage = async (req, res) => {
    try {
        const { id } = req.params;

        const message = await ContactMessage.findByIdAndDelete(id);
        
        if (!message) {
            return sendResponse(res, 404, false, 'הודעה לא נמצאה');
        }

        return sendResponse(res, 200, true, 'ההודעה נמחקה בהצלחה');
    } catch (error) {
        console.error('Error deleting contact message:', error);
        return sendResponse(res, 500, false, 'שגיאה במחיקת ההודעה');
    }
};
