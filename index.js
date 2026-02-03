const express = require("express");
const app = express();

app.use(express.json());

// ✅ Read API key from environment variable
const API_KEY = process.env.API_KEY;

// Store conversation memory
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

// Detect scam intent
function detectScam(message) {
  return SCAM_KEYWORDS.some(word =>
    message.toLowerCase().includes(word)
  );
}

// Extract intelligence
function extractIntelligence(text) {
  return {
    upi_ids: text.match(/[\w.-]+@[\w]+/g) || [],
    bank_accounts: text.match(/\b\d{9,18}\b/g) || [],
    phishing_urls: text.match(/https?:\/\/[^\s]+/g) || []
  };
}

// AI Agent response
function agentReply() {
  const replies = [
    "I’m confused, can you explain again?",
    "The link is not opening, can you send UPI instead?",
    "Which bank is this? I need account details.",
    "I want to pay directly, please share your UPI ID."
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

// ✅ Test endpoint
app.get("/honeypot", (req, res) => {
  res.json({
    message: "Honeypot API is running. Use POST for full functionality."
  });
});

// 🐝 Honeypot API
app.post("/honeypot", (req, res) => {
  try {
    // ✅ Check API key
    const key = req.headers["x-api-key"];
    if (key !== API_KEY) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    // ✅ Default values if GUVI tester sends missing fields
    const conversation_id = req.body.conversation_id || "default_conv";
    const message = req.body.message || "";

    if (!conversations[conversation_id]) {
      conversations[conversation_id] = [];
    }

    conversations[conversation_id].push(message);

    // ✅ Detect scam and extract intelligence
    const scamDetected = detectScam(message);
    const intelligence = extractIntelligence(message);

    // ✅ Construct response
    const response = {
      scam_detected: scamDetected,
      agent_activated: scamDetected,
      conversation_metrics: {
        total_turns: conversations[conversation_id].length
      },
      extracted_intelligence: intelligence,
      agent_response: scamDetected ? agentReply() : "Hello, how can I help you?"
    };

    res.json(response);

  } catch (error) {
    // ✅ Catch-all error handler
    console.error("Error in /honeypot:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🐝 Honeypot running on port ${PORT}`);
});
