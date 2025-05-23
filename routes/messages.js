const express = require('express');
const router = express.Router();
const Message = require('../Models/Message');
const brain = require('brain.js');
const { net, loadModel, saveModel } = require('../model');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'sahith';

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

router.get('/', async (req, res) => {
  const messages = await Message.find();
  res.json(messages);
});

router.post('/', async (req, res) => {
  const { text, label } = req.body;
  const msg = new Message({ text, label });
  await msg.save();
  res.json(msg);
});

router.get('/cleanup', async (req, res) => {
  try {
    const result = await Message.deleteMany({
      $or: [
        { text: { $exists: false } },
        { text: "" },
        { label: { $exists: false } }
      ]
    });
    res.json({ message: "Cleanup complete", deletedCount: result.deletedCount });
  } catch (err) {
    console.error("Cleanup error:", err);
    res.status(500).json({ error: "Cleanup failed" });
  }
});

router.delete('/cleanup', async (req, res) => {
  await Message.deleteMany({ $or: [ { text: { $exists: false } }, { text: "" }, { label: { $exists: false } } ] });
  res.send("Cleanup complete");
});

router.post('/predict', verifyToken,async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'No text provided' });

        const input = {};
        text.toLowerCase().split(' ').forEach(word => {
            input[word] = 1;
        });

        const output = net.run(input);
        const prediction = output.spam > output.ham ? 'spam' : 'ham';

        res.json({ prediction });
    } catch (err) {
        console.error('Prediction error:', err);
        res.status(500).json({ error: 'Server error during prediction' });
    }
});

router.get('/train', async (req, res) => {
    try {
        const messages = await Message.find({ text: { $exists: true }, label: { $exists: true } });

        const trainingData = messages.map(msg => {
            const input = {};
            msg.text.toLowerCase().split(' ').forEach(word => input[word] = 1);
            const output = msg.label === 'spam' ? { spam: 1 } : { ham: 1 };
            return { input, output };
        });

        net.train(trainingData, {
            iterations: 200,
            log: true,
            logPeriod: 10,
        });

        saveModel(); // Save the trained model to file
        res.json({ message: "Model trained and saved successfully!" });
    } catch (err) {
        console.error('Training error:', err);
        res.status(500).json({ error: 'Training failed' });
    }
});

module.exports = router;
