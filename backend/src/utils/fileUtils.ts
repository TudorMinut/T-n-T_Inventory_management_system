import fs from "fs";
import path from "path";

const dbPath = path.join(__dirname, "../../data/database.json");

export const readData = () => {
    const content = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(content);
};

export const writeData = (data: any) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};
