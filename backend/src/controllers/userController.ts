import { ServerResponse } from "http";
import { readData, writeData } from "../utils/fileUtils";

const usersDB = {
    users: [],
};

export const registerUser = (data: any, res: ServerResponse) => {
    const db = readData();
    const { username, email, password } = data;

    // Verifică dacă utilizatorul există deja
    const userExists = db.users.find((user: any) => user.email === email);
    if (userExists) {
        res.writeHead(409, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Utilizatorul există deja" }));
        return;
    }

    const newUser = { id: Date.now(), username, email, password }; // Fără hashing deocamdată
    db.users.push(newUser);
    writeData(db);

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ id: newUser.id, username: newUser.username, email: newUser.email }));
};

export const loginUser = (data: any, res: ServerResponse) => {
    const db = readData();
    const { email, password } = data;

    const user = db.users.find((u: any) => u.email === email && u.password === password);

    if (user) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Autentificare cu succes", userId: user.id }));
    } else {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Email sau parolă incorectă" }));
    }
};
