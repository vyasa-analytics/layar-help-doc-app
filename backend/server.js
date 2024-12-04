const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { OpenAI } = require("openai");
const dotenv = require("dotenv")

const app = express();
app.use(cors());
app.use(bodyParser.json());
dotenv.config();


const openai = new OpenAI({
    apiKey: process.env.openaikey,
});

app.post("/api/chat", async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).send({ error: "Message is required" });
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: message }],
        });

        const reply = response.choices[0].message.content;
        res.send({ reply });
    } catch (error) {
        console.error("Error calling OpenAI API:", error.response?.data || error.message);
        res.status(500).send({ error: "Error generating response" });
    }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

