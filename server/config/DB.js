/*
  קובץ זה אחראי על:
  - יצירת חיבור למסד הנתונים MongoDB
  - ניהול הגדרות החיבור ופרמטרי הזמן
  - טיפול בשגיאות חיבור

  הקובץ משמש את:
  - app.js (הקובץ הראשי) בעת אתחול השרת

  הקובץ אינו:
  - מגדיר מבנים או סכימות של מסד הנתונים - זה נעשה בקבצי המודלים
*/

const mongoose = require('mongoose');

async function connectDB() {
	const uri = process.env.MONGO_URI;
	if (!uri) {
		console.error('MONGO_URI is not set in environment variables');
		process.exit(1);
	}
	try {
		await mongoose.connect(uri, {
			dbName: process.env.MONGO_DB || undefined,
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45000,
		});
		console.info('MongoDB connected successfully');
	} catch (err) {
		console.error('MongoDB connection error:', err.message);
		console.error('Full error:', err);
		process.exit(1);
	}
}

module.exports = connectDB;