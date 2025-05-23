const brain = require('brain.js');
const fs = require('fs');
const path = require('path');

const modelFilePath = path.join(__dirname, 'trainedModel.json');
const net = new brain.NeuralNetwork();

function loadModel() {
    if (fs.existsSync(modelFilePath)) {
        const rawData = fs.readFileSync(modelFilePath);
        const json = JSON.parse(rawData);
        net.fromJSON(json);
        console.log("✅ Model loaded from file.");
    } else {
        console.log("⚠️ Model file not found. Starting fresh.");
    }
}

function saveModel() {
    const json = net.toJSON();
    fs.writeFileSync(modelFilePath, JSON.stringify(json));
    console.log("💾 Model saved to file.");
}

module.exports = { net, loadModel, saveModel };
