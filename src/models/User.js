const mongoose = require('mongoose');

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // eslint-disable-line no-useless-escape

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    match: [EMAIL_REGEX, '{PATH} \'{VALUE} is invalid\'']
  },
  phoneNumber: {
    type: String,
    required: true
  },
  vehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }]
});

module.exports = mongoose.model('User', UserSchema);
