import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import dotenv from 'dotenv';

dotenv.config();
const client = new ModelClient(
  process.env.AZURE_INFERENCE_SDK_ENDPOINT ?? "https://aistudioaiservices101911825731.services.ai.azure.com/models/", 
  new AzureKeyCredential(process.env.AZURE_INFERENCE_SDK_KEY ?? "YOUR_KEY_HERE")
);

var messages = [
  { role: "system", content: "You are a helpful assistant" },
  { role: "user", content: "What are 3 things to see in Seattle?" },
];

var response = await client.path("chat/completions").post({
  body: {
    messages: messages,
    max_tokens: 2048,
    temperature: 0.8,
    top_p: 0.1,
    model: "mistral-medium-2505",
  },
});

// Extract and display only the assistant's message
const assistantMessage = response.body.choices[0].message.content;
console.log("\nAssistant's Response:");
console.log("-------------------");
console.log(assistantMessage);
console.log("-------------------\n");
