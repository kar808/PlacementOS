import app from "../server.js";

export default function handler(req: any, res: any) {
  if (req.originalUrl && req.originalUrl !== req.url) {
    req.url = req.originalUrl;
  }
  return app(req, res);
}

