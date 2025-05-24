const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  text: String,
  label: String
});

module.exports = mongoose.model('Message', MessageSchema);
