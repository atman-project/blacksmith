import Anthropic from "@anthropic-ai/sdk";
import type { Message, ModelId } from "../types";

const SYSTEM_PROMPT = `You are Blacksmith, an AI assistant that helps users shape their documents. You receive the user's current document and their request, then respond with the updated document and a brief explanation.

Your response MUST be in this exact format:

<doc>
(the full updated document content here)
</doc>

<reply>
(your brief, friendly explanation of what you changed)
</reply>

Rules:
- Always include both <doc> and <reply> tags
- The <doc> tag must contain the COMPLETE document, not just the changes
- If the user asks a question or makes a request that doesn't require changing the document, return the document unchanged in <doc> and answer in <reply>
- Keep replies concise and conversational
- The document is in Markdown format
- Be helpful and creative when shaping the document`;

function buildMessages(messages: Message[], currentDoc: string) {
  const apiMessages: { role: "user" | "assistant"; content: string }[] = [];

  for (const msg of messages) {
    if (msg.role === "user") {
      apiMessages.push({
        role: "user",
        content: `Current document:\n\`\`\`\n${currentDoc}\n\`\`\`\n\nUser request: ${msg.content}`,
      });
    } else {
      apiMessages.push({ role: "assistant", content: msg.content });
    }
  }

  return apiMessages;
}

function parseResponse(text: string): { newDoc: string; reply: string } | null {
  const docMatch = text.match(/<doc>([\s\S]*?)<\/doc>/);
  const replyMatch = text.match(/<reply>([\s\S]*?)<\/reply>/);

  if (!docMatch || !replyMatch) return null;

  return {
    newDoc: docMatch[1].trim(),
    reply: replyMatch[1].trim(),
  };
}

let anthropicClient: Anthropic | null = null;

function getClient(apiKey: string): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }
  return anthropicClient;
}

export function resetClient() {
  anthropicClient = null;
}

export async function sendMessage(
  modelId: ModelId,
  apiKey: string,
  messages: Message[],
  currentDoc: string
): Promise<{ reply: string; newDoc: string }> {
  if (modelId === "llama-3.2-8b") {
    throw new Error("Local models are coming soon.");
  }

  const client = getClient(apiKey);
  const apiMessages = buildMessages(messages, currentDoc);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: apiMessages,
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const parsed = parseResponse(text);

  if (!parsed) {
    return { reply: text, newDoc: currentDoc };
  }

  return parsed;
}
