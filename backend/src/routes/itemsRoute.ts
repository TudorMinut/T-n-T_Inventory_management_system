import { IncomingMessage, ServerResponse } from "http";
import { getAllItems, createItem } from "../controllers/itemController";

export const handleItemsRoute = async (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === "GET") {
    return getAllItems(res);
  }

  if (req.method === "POST") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      const data = JSON.parse(body);
      return createItem(data, res);
    });
  }
};
