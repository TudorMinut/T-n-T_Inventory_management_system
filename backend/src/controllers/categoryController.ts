import { ServerResponse } from "http";
import { readData, writeData } from "../utils/fileUtils";

export const getAllCategories = (res: ServerResponse) => {
    const db = readData();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(db.categories));
};

export const createCategory = (data: any, res: ServerResponse) => {
    const db = readData();
    const newCategory = { id: Date.now(), ...data };
    db.categories.push(newCategory);
    writeData(db);
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify(newCategory));
};
