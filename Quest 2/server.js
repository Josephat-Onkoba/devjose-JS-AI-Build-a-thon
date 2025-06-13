import express from 'express';
import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Initialize Azure AI client
const client = new ModelClient(
    process.env.AZURE_INFERENCE_SDK_ENDPOINT,
    new AzureKeyCredential(process.env.AZURE_INFERENCE_SDK_KEY)
);

app.post('/api/chat', async (req, res) => {
    try {
        const message = req.body.message || '';

        // Prepare the messages array
        let messages = [
            { role: "system", content: "You are a helpful assistant that can help users with their questions." },
            { role: "user", content: message }
        ];

        // Call the AI model
        const response = await client.path("chat/completions").post({
            body: {
                messages: messages,
                max_tokens: 2048,
                temperature: 0.7,
                top_p: 0.95,
                model: "mistral-medium-2505",
            },
        });

        // Check if response and choices exist
        if (!response.body?.choices?.[0]?.message?.content) {
            throw new Error('Invalid response from AI model');
        }

        // Extract the assistant's message
        const assistantMessage = response.body.choices[0].message.content;
        
        res.json({ response: assistantMessage });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'An error occurred while processing your request.',
            details: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
