const express = require("express");
const app = express();

app.use(express.json());

// API key
const API_KEY = process.env.API_KEY || "honeypot-test-key-123";

// Memory store
const conversations = {};

// Scam keywords
const SCAM_KEYWORDS = [
  "account blocked",
  "urgent",
  "verify",
  "click link",
  "otp",
  "upi",
  "bank"
];

// Safe scam detection
function detectScam(message) {
  if (!message || typeof message !== "string") return false;
  return SCAM_KEYWORDS.some(word =>
    message.toLowerCase().includes(word)
  );
}

// Safe intelligence extraction
function extractIntelligence(text) {
  if (!text || typeof text !== "string") {
    return { upi_ids: [], bank_accounts: [], phishing_urls: [] };
  }
  return {
    upi_ids: text.match(/[\w.-]+@[\w]+/g) || [],
    bank_accounts: text.match(/\b\d{9,18}\b/g) || [],
    phishing_urls: text.match(/https?:\/\/[^\s]+/g) || []
  };
}

// Agent reply
function agentReply() {
  const replies = [
    "I’m confused, can you explain again?",
    "The link is not opening, can you send UPI instead?",
    "Which bank is this? I need account details.",
    "I want to pay directly, please share your UPI ID."
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

// Health check
app.get("/", (req, res) => {
  res.send("Agentic Honey-Pot API running");
});

// Honeypot endpoint
app.post("/honeypot", (req, res) => {
  try {
    const key = req.headers["x-api-key"];
    if (key !== API_KEY) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    const body = req.body || {};
    const conversation_id = body.conversation_id || "default";
    const message = body.message || "";

    if (!conversations[conversation_id]) {
      conversations[conversation_id] = [];
    }
    conversations[conversation_id].push(message);

    const scamDetected = detectScam(message);
    const intelligence = extractIntelligence(message);

    return res.json({
      scam_detected: scamDetected,
      agent_activated: scamDetected,
      conversation_metrics: {
        total_turns: conversations[conversation_id].length
      },
      extracted_intelligence: intelligence,
      agent_response: scamDetected
        ? agentReply()
        : "Hello, how can I help you?"
    });

  } catch (err) {
    console.error("GUVI Error:", err);
    return res.status(200).json({
      scam_detected: false,
      agent_activated: false,
      extracted_intelligence: {},
      agent_response: "Safe fallback response"
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🐝 Honeypot running on port", PORT);
});
