const os = require("os");
const fs = require('fs');
const path = require("path");

const now = new Date();
const ws = fs.createWriteStream(path.join(__dirname, "..", "data", `student_${now.getFullYear()}-${(now.getMonth() < 10 ? "0" : "") + now.getMonth()}-${(now.getDate() < 10 ? "0" : "") + now.getDate()}.txt`), { flags: 'a' });

// for (let i = 0; i < 1e6; i++) {
for (let i = 0; i < 100; i++) {
  // book
  // ws.write(`${i > 0 ? os.EOL : ""}${randomStr(randomNum(1, 40)).padEnd(40, " ")}${randomStr(randomNum(1, 40)).padEnd(40, " ")}${now.getFullYear()}-${(now.getMonth() < 10 ? "0" : "") + now.getMonth()}-${(now.getDate() < 10 ? "0" : "") + now.getDate()}${randomNum(0, 1)}${randomNum(0, 999).toString().padStart(3, " ")}`);

  // student
  ws.write(`${i > 0 ? os.EOL : ""}${randomStr(randomNum(15, 15)).padEnd(15, " ")}${randomStr(randomNum(1, 40)).padEnd(40, " ")}${now.getFullYear()}-${(now.getMonth() < 10 ? "0" : "") + now.getMonth()}-${(now.getDate() < 10 ? "0" : "") + now.getDate()}${randomNum(0, 1)}`);

  // testformat1
  // ws.write(`${i > 0 ? os.EOL : ""}${randomStr(randomNum(1, 10)).padEnd(10, " ")}${randomNum(0, 1)}${randomNum(-99, 999).toString().padStart(3, " ")}`);
}

ws.end();

function randomNum(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomStr(length) {
  let result = [];
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
  }
  return result.join("");
}