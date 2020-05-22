const path = require("path");
const fs = require("fs");
const readline = require("readline");
const stream = require("stream");

const specsPath = path.join(__dirname, "..", "specs");
const dataPath = path.join(__dirname, "..", "data");

console.log(fs.readdirSync(specsPath));
console.log(fs.readdirSync(dataPath));