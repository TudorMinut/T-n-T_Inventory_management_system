import { ServerResponse } from "http";

export const sendJson = (res: ServerResponse, statusCode: number, payload: unknown) => {
    res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(payload));
};

export const sendError = (res: ServerResponse, statusCode: number, message: string) => {
    sendJson(res, statusCode, { message });
};

export const sendNoContent = (res: ServerResponse) => {
    res.writeHead(204);
    res.end();
};
