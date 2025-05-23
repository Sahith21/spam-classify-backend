const brain = require('brain.js');
const Message = require('../Models/Message');

const trainSpamModel = async () => {
  const messages = await Message.find();

  const net = new brain.NeuralNetwork();

  const trainingData = messages.map(msg => ({
    input: msg.text.toLowerCase(),
    output: msg.label === 'spam' ? { spam: 1 } : { ham: 1 }
  }));

  net.train(trainingData, {
    iterations: 2000,
    log: true,
    errorThresh: 0.005,
  });

  return net;
};

module.exports = trainSpamModel;
