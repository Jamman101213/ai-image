// api/getKey.js
export default function handler(req, res) {
  const FRONTEND_KEY = "81dmwizkcniqlzkf"; // must match frontend
  const CLIENT_KEY = "68c71eb4b9af5c8bf598a7ea";
  const CLIENT_SECRET = "35c3da5bf37443439c06f38f1d846192";

  // Check method
  if (req.method !== "POST") return res.status(405).json({ error: "POST only", status: 405 });

  // Check frontend key header
  const frontendKey = req.headers["x-frontend-key"];
  if (frontendKey !== FRONTEND_KEY) {
    return res.status(401).json({ error: "Unauthorized frontend", status: 401 });
  }

  // Send keys (in real usage, you might only send clientKey, not clientSecret)
  res.status(200).json({
    clientKey: CLIENT_KEY,
    clientSecret: CLIENT_SECRET
  });
}
