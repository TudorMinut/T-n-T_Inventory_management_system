import { IncomingMessage } from "http";

const MAX_BODY_SIZE_BYTES = 1_000_000;

export const getTextRequestBody = (req: IncomingMessage): Promise<string> => {
    return new Promise((resolve, reject) => {
        let body = "";

        req.on("data", (chunk: Buffer) => {
            body += chunk.toString();
            if (body.length > MAX_BODY_SIZE_BYTES) {
                reject(new Error("Request body too large"));
                req.destroy();
            }
        });

        req.on("error", reject);
        req.on("end", () => resolve(body));
    });
};

export const getRequestBody = async <T = Record<string, unknown>>(req: IncomingMessage): Promise<T> => {
    const body = await getTextRequestBody(req);
    return body ? JSON.parse(body) as T : {} as T;
};
