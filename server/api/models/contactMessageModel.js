/*
  קובץ זה אחראי על:
  - הגדרת סכימת הודעות צור קשר במסד הנתונים
  - שדות: שם, אימייל, נושא, הודעה, סטטוס
  - מעקב פניות מאתר האינטרנט
  - אינדקסים לחיפוש לפי סטטוס ותאריך

  הקובץ משמש את:
  - קונטרולר צור הקשר
  - נתיב צור הקשר באפליקציה
  - מנהלים לטיפול בפניות

  הקובץ אינו:
  - שולח אימיילים - זה נעשה בשירות האימייל
*/

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactMessageSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    subject: {
        type: String,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

contactMessageSchema.index({ createdAt: -1 });
contactMessageSchema.index({ isRead: 1 });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
