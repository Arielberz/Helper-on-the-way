const Location = require('../models/locationModel');

exports.createLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'lat and lng must be numbers'
      });
    }

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'No user in request (missing or invalid token)'
      });
    }

    const location = await Location.create({
      user: req.userId,
      lat,
      lng
    });

    res.status(201).json({
      success: true,
      data: location
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error creating location'
    });
  }
};

exports.getLocations = async (req, res) => {
  try {
    const locations = await Location.find()
      .sort({ createdAt: -1 })
      .limit(200); // שלא יתפוצץ

    res.json({
      success: true,
      data: locations
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching locations'
    });
  }
};