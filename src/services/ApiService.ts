
import { v4 as uuidv4 } from 'uuid';

// Store the session ID
let sessionId = '';

// Initialize session ID
const getSessionId = (): string => {
  if (!sessionId) {
    // Check if we have a session ID in localStorage
    const storedSessionId = localStorage.getItem('chatSessionId');
    if (storedSessionId) {
      sessionId = storedSessionId;
    } else {
      // Generate a new session ID
      sessionId = uuidv4();
      localStorage.setItem('chatSessionId', sessionId);
    }
  }
  return sessionId;
};

interface MessageRequest {
  message: string;
  sessionId: string;
}

const WEBHOOK_URL = 'https://skycanary.app.n8n.cloud/webhook-test/4e100dee-41a0-4437-b821-ac75a1882e77';
const TIMEOUT_MS = 15000; // 15 seconds

export const sendMessage = async (message: string): Promise<string> => {
  const payload: MessageRequest = {
    message,
    sessionId: getSessionId(),
  };

  try {
    // Create an AbortController to handle timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response || "I'm sorry, I couldn't process your request.";
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw new Error(`Failed to send message: ${error.message}`);
    }
    throw new Error('An unknown error occurred');
  }
};

// Mock the stream response for the character-by-character effect
export const simulateStreamResponse = (
  response: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void
) => {
  const charsPerSecond = 45; // Characters per second (between 30-60)
  const delayMs = 1000 / charsPerSecond;
  let currentIndex = 0;
  
  const streamInterval = setInterval(() => {
    if (currentIndex < response.length) {
      // Get the next chunk (can be 1-3 chars for more natural effect)
      const chunkSize = Math.floor(Math.random() * 3) + 1;
      const nextChunk = response.substring(
        currentIndex, 
        Math.min(currentIndex + chunkSize, response.length)
      );
      
      onChunk(nextChunk);
      currentIndex += nextChunk.length;
    } else {
      clearInterval(streamInterval);
      onComplete();
    }
  }, delayMs);
  
  return () => clearInterval(streamInterval);
};
