import { IncomingMessage, ServerResponse } from "http";
import { getAllItems, createItem, updateItem, deleteItem } from "../controllers/itemController";

export const handleItemsRoutes = async (req: IncomingMessage, res: ServerResponse) => {
  const { url, method } = req;
  const regexResult = url?.match(/^\/api\/items\/(\d+)$/);

  if (url === "/api/items" && method === "GET") {
    return getAllItems(res);
  } else if (url === "/api/items" && method === "POST") {
    return createItem(req, res);
  } else if (regexResult && method === "PUT") {
    const id = parseInt(regexResult[1]);
    return updateItem(req, res, id);
  } else if (regexResult && method === "DELETE") {
    const id = parseInt(regexResult[1]);
    return deleteItem(res, id);
  }

  // Dacă nicio rută nu se potrivește
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Rută negăsită pentru articole" }));
};
