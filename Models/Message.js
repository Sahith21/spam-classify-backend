const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  text: String,
  label: String // 'spam' or 'ham'
});

module.exports = mongoose.model('Message', MessageSchema);
