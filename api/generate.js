import axios from "axios";

// Your Pixlr credentials
const CLIENT_KEY = "68c71eb4b9af5c8bf598a7ea";
const CLIENT_SECRET = "35c3da5bf37443439c06f38f1d846192";

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "https://ai-image-pink-nu.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only", status: 405 });

  const { prompt, width = 512, height = 512, style = "realistic" } = req.body;

  if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
    return res.status(400).json({ error: "Prompt is required", status: 400 });
  }

  try {
    // 1️⃣ Get Pixlr access token
    const tokenRes = await axios.post(
      "https://api.pixlr.com/oauth/token",
      null,
      {
        params: {
          grant_type: "client_credentials",
          client_id: CLIENT_KEY,
          client_secret: CLIENT_SECRET,
        },
      }
    );

    const token = tokenRes.data?.access_token;
    if (!token) throw new Error("Failed to retrieve Pixlr access token");

    // 2️⃣ Call Pixlr AI generate endpoint
    const pixlrRes = await axios.post(
      "https://api.pixlr.com/v1/ai/generate",
      { prompt, width, height, style },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // 3️⃣ Return result to frontend
    return res.status(200).json(pixlrRes.data);

  } catch (err) {
    console.error("Pixlr API error:", err.response?.status, err.response?.data || err.message);
    const status = err.response?.status || 500;
    const message = err.response?.data || err.message || "Unknown error";
    return res.status(status).json({ error: message, status });
  }
}
