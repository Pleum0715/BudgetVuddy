require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post('/openai-proxy', async (req, res) => {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: req.body.messages,
            temperature: req.body.temperature || 0.7,
            max_tokens: req.body.max_tokens || 500
        });

        res.json(completion);
    } catch (error) {
        console.error('OpenAI Error:', error);
        res.status(500).json({ error: 'Error processing your request' });
    }
});

app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});