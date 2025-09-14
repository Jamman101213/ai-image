import axios from "axios";

// Your Pixlr credentials
const CLIENT_KEY = "68c71eb4b9af5c8bf598a7ea";
const CLIENT_SECRET = "35c3da5bf37443439c06f38f1d846192";

// Optional extra security: require a frontend API key
const FRONTEND_KEY = "my-secure-frontend-key"; // Change this and require it in headers

export default async function handler(req, res) {
  // 1️⃣ CORS headers
  res.setHeader("Access-Control-Allow-Origin", "https://ai-image-pink-nu.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Frontend-Key");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only", status: 405 });

  // 2️⃣ Optional frontend key check
  const frontendKey = req.headers["x-frontend-key"];
  if (frontendKey !== FRONTEND_KEY) {
    return res.status(401).json({ error: "Unauthorized frontend", status: 401 });
  }

  // 3️⃣ Validate prompt
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
    return res.status(400).json({ error: "Prompt is required", status: 400 });
  }

  try {
    // 4️⃣ Get Pixlr access token
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

    if (!tokenRes.data || !tokenRes.data.access_token) {
      throw new Error("Failed to retrieve Pixlr access token");
    }

    const token = tokenRes.data.access_token;

    // 5️⃣ Call Pixlr AI generate endpoint
    const pixlrRes = await axios.post(
      "https://api.pixlr.com/v1/ai/generate",
      { prompt, width: 512, height: 512 }, // Add width/height for stability
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // 6️⃣ Return successful response
    return res.status(200).json(pixlrRes.data);

  } catch (err) {
    // 7️⃣ Handle errors and provide status codes
    const status = err.response?.status || 500;
    const message = err.response?.data || err.message || "Unknown error";

    console.error("Pixlr API error:", status, message);

    return res.status(status).json({
      error: message,
      status,
    });
  }
}
