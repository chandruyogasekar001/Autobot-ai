const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post("/api/chat", async (req, res) => {
    try {
        const { message, history } = req.body;

        // Ensure the first message is from the 'user'
        let chatHistory = [];
        if (history.length === 0 || history[0].role !== 'user') {
            chatHistory.push({ role: "user", parts: [{ text: message }] });
        } else {
            chatHistory = history.map(item => ({
                role: item.role,
                parts: [{ text: item.text }],
            }));
            chatHistory.push({ role: "user", parts: [{ text: message }] });
        }

        const chat = model.startChat({
            history: chatHistory,
            generationConfig: { maxOutputTokens: 100 },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = await response.text();

        res.json({ response: text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate response" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
