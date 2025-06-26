import { IncomingMessage, ServerResponse } from "http";
import { getAllItems, createItem, updateItem, deleteItem } from "../controllers/itemController";

export const handleItemsRoute = async (req: IncomingMessage, res: ServerResponse) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const id = parseInt(url.pathname.split('/')[2]);

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

  if (req.method === "PUT" && id) {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      const data = JSON.parse(body);
      return updateItem(id, data, res);
    });
  }

  if (req.method === "DELETE" && id) {
    return deleteItem(id, res);
  }
};
