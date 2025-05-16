"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createItem = exports.getAllItems = void 0;
const fileUtils_1 = require("../utils/fileUtils");
const getAllItems = (res) => {
    const db = (0, fileUtils_1.readData)();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(db.items));
};
exports.getAllItems = getAllItems;
const createItem = (data, res) => {
    const db = (0, fileUtils_1.readData)();
    const newItem = Object.assign({ id: Date.now() }, data);
    db.items.push(newItem);
    (0, fileUtils_1.writeData)(db);
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify(newItem));
};
exports.createItem = createItem;
