// api/getKey.js
export default async function handler(req, res) {
  const FRONTEND_KEY = "81dmwizkcniqlzkf";
  const CLIENT_KEY = "68c71eb4b9af5c8bf598a7ea";
  const CLIENT_SECRET = "35c3da5bf37443439c06f38f1d846192";

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "https://ai-image-pink-nu.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Frontend-Key");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only", status: 405 });

  // Frontend key check
  const frontendKey = req.headers["x-frontend-key"];
  if (frontendKey !== FRONTEND_KEY) {
    return res.status(401).json({ error: "Unauthorized frontend", status: 401 });
  }

  // Return the Pixlr credentials
  return res.status(200).json({ clientKey: CLIENT_KEY, clientSecret: CLIENT_SECRET });
}
