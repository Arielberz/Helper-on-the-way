/*
  קובץ זה אחראי על:
  - טיפול בבקשות HTTP מטופס צור הקשר
  - שמירת הודעות צור קשר במסד הנתונים
  - ולידציה של שדות הטופס
  - שליחת אימייל למנהלי המערכת

  הקובץ משמש את:
  - נתיב צור הקשר (contactRouter)
  - דף צור קשר בצד הקליינט

  הקובץ אינו:
  - מטפל בפניות מיידיות - זה נעשה בפאנל המנהל
*/

const ContactMessage = require('../models/contactMessageModel');
const sendResponse = require('../utils/sendResponse');

exports.submitContactMessage = async (req, res) => {
    try {
        const { fullName, email, phone, subject, message } = req.body;

        if (!fullName || !email || !message) {
            return sendResponse(res, 400, false, 'שם מלא, אימייל והודעה הם שדות חובה');
        }

        const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!emailRegex.test(email)) {
            return sendResponse(res, 400, false, 'כתובת אימייל לא תקינה');
        }

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
