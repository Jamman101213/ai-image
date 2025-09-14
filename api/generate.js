// api/generate.js
import axios from "axios";

const CLIENT_KEY = "68c71eb4b9af5c8bf598a7ea";
const CLIENT_SECRET = "35c3da5bf37443439c06f38f1d846192";

export default async function handler(req, res) {
  // Allow your frontend domain
  res.setHeader("Access-Control-Allow-Origin", "*"); // or replace "*" with your frontend URL
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Handle preflight
  }

  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { prompt } = req.body;

  try {
    // Get access token
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

    const token = tokenRes.data.access_token;

    // Generate image
    const pixlrRes = await axios.post(
      "https://api.pixlr.com/v1/ai/generate",
      { prompt },
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );

    res.status(200).json(pixlrRes.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate image" });
  }
}
