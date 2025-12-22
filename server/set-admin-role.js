/**
 * Script to manually set admin role for a user
 * Run this in MongoDB Shell or MongoDB Compass
 */

// Replace with your actual MongoDB connection string and database name
// This is just an example - adjust based on your .env MONGODB_URI

// In MongoDB Shell, run:
db.users.updateOne(
  { email: "info.helperontheway@gmail.com" },
  { $set: { role: "admin" } }
)

// To verify it worked:
db.users.findOne({ email: "info.helperontheway@gmail.com" }, { email: 1, username: 1, role: 1 })

// Expected result:
// {
//   "_id": ObjectId("..."),
//   "email": "info.helperontheway@gmail.com",
//   "username": "...",
//   "role": "admin"
// }
