import { ServerResponse } from "http";
import { readData, writeData } from "../utils/fileUtils";

export const getAllItems = (res: ServerResponse) => {
    const db = readData();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(db.items));
};

export const createItem = (data: any, res: ServerResponse) => {
    const db = readData();
    const newItem = { id: Date.now(), ...data };
    db.items.push(newItem);
    writeData(db);
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify(newItem));
};