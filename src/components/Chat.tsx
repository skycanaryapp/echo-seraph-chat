
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatMessage, { Message } from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import { sendMessage, simulateStreamResponse } from "@/services/ApiService";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      try {
        // Parse the saved messages and convert string timestamps back to Date objects
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(parsedMessages);
      } catch (error) {
        console.error("Failed to parse saved messages:", error);
        // If there's an error parsing, just start with an empty chat
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    // Create a placeholder for AI response
    const aiMessageId = uuidv4();
    const aiMessage: Message = {
      id: aiMessageId,
      content: "",
      role: "assistant",
      timestamp: new Date(),
      isStreaming: true,
    };
    
    setMessages((prev) => [...prev, aiMessage]);
    setLoading(true);
    setStreamingText("");

    try {
      // Send the message to the API
      const responseText = await sendMessage(content);
      
      // Simulate streaming the response
      let cleanup = simulateStreamResponse(
        responseText,
        (chunk) => {
          setStreamingText((prev) => prev + chunk);
        },
        () => {
          // Update the AI message with the complete response
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? {
                    ...msg,
                    content: responseText,
                    isStreaming: false,
                  }
                : msg
            )
          );
          setLoading(false);
          setStreamingText("");
        }
      );
      
      // Cleanup function for component unmount
      return () => cleanup();
    } catch (error) {
      let errorMessage = "Failed to get response";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        description: "Please try again or check your connection",
        duration: 5000,
      });
      
      // Update the AI message to show the error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: `Error: ${errorMessage}. Please try again.`,
                isStreaming: false,
              }
            : msg
        )
      );
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem("chatMessages");
    toast.success("Chat history cleared");
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <ChatHeader onClearChat={handleClearChat} />
      
      <div className="flex-1 overflow-y-auto p-message">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-2">Welcome to AI Chat</h2>
              <p className="text-muted-foreground mb-6">
                Start a conversation with the AI assistant
              </p>
              <div className="w-full h-1 chat-gradient rounded-full mb-6"></div>
              <p className="text-sm text-muted-foreground">
                Your conversation will be saved in this browser
              </p>
            </div>
          )}
          
          {messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              streamingText={message.isStreaming ? streamingText : undefined}
            />
          ))}
          
          {loading && !messages[messages.length - 1]?.isStreaming && (
            <div className="flex justify-start mb-6">
              <div className="ai-message">
                <TypingIndicator />
              </div>
            </div>
          )}
          
          {/* Invisible div to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="p-4 bg-muted/20">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSubmit={handleSendMessage} disabled={loading} />
        </div>
      </div>
    </div>
  );
};

export default Chat;
