import axios from "axios";

// Your Pixlr credentials
const CLIENT_KEY = "68c71eb4b9af5c8bf598a7ea";
const CLIENT_SECRET = "35c3da5bf37443439c06f38f1d846192";
const FRONTEND_KEY = "81dmwizkcniqlzkf"; // Frontend must send this header

// Maximum retry attempts for Pixlr API
const MAX_RETRIES = 2;

export default async function handler(req, res) {
  // CORS headers
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

  // Validate prompt
  const { prompt, width = 512, height = 512, style = "realistic" } = req.body;
  if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
    return res.status(400).json({ error: "Prompt is required", status: 400 });
  }

  // Helper function to request Pixlr AI
  const callPixlrAI = async (attempt = 1) => {
    try {
      // Get access token
      const tokenRes = await axios.post(
        "https://api.pixlr.com/oauth/token",
        null,
        { params: { grant_type: "client_credentials", client_id: CLIENT_KEY, client_secret: CLIENT_SECRET } }
      );

      const token = tokenRes.data?.access_token;
      if (!token) throw new Error("Failed to retrieve Pixlr access token");

      // Generate image
      const pixlrRes = await axios.post(
        "https://api.pixlr.com/v1/ai/generate",
        { prompt, width, height, style },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      // If response is not JSON, throw
      if (!pixlrRes.data || typeof pixlrRes.data !== "object") {
        throw new Error("Pixlr returned invalid JSON");
      }

      return pixlrRes.data;

    } catch (err) {
      console.error(`Attempt ${attempt} - Pixlr API error:`, err.response?.status, err.response?.data || err.message);

      // Retry if attempts left
      if (attempt < MAX_RETRIES) {
        console.log("Retrying Pixlr API...");
        return callPixlrAI(attempt + 1);
      }

      // Return error info
      const status = err.response?.status || 500;
      const message = err.response?.data || err.message || "Unknown error";
      throw { status, message };
    }
  };

  try {
    const result = await callPixlrAI();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || "Unknown error", status: err.status || 500 });
  }
}
