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

export const updateItem = (id: number, data: any, res: ServerResponse) => {
    const db = readData();
    const index = db.items.findIndex((item: any) => item.id === id);

    if (index !== -1) {
        db.items[index] = { ...db.items[index], ...data };
        writeData(db);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(db.items[index]));
    } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Articolul nu a fost găsit" }));
    }
};

export const deleteItem = (id: number, res: ServerResponse) => {
    const db = readData();
    const initialLength = db.items.length;
    db.items = db.items.filter((item: any) => item.id !== id);

    if (db.items.length < initialLength) {
        writeData(db);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Articol șters cu succes" }));
    } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Articolul nu a fost găsit" }));
    }
};