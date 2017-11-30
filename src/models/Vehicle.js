const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  licensePlateNumber: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
