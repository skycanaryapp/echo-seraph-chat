import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatMessage, { Message } from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import { sendMessage, simulateStreamResponse } from "@/services/ApiService";
import { 
  createConversation, 
  getMessages, 
  createMessage,
  getConversation
} from "@/services/ChatService";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [currentTitle, setCurrentTitle] = useState("New Chat");
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId) {
        setMessages([]);
        setCurrentTitle("New Chat");
        return;
      }

      try {
        const conversation = await getConversation(conversationId);
        if (conversation) {
          setCurrentTitle(conversation.title);
        }

        const chatMessages = await getMessages(conversationId);
        
        const formattedMessages: Message[] = chatMessages.map(msg => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          timestamp: new Date(msg.created_at),
        }));
        
        setMessages(formattedMessages);
      } catch (error) {
        console.error("Error loading conversation:", error);
        toast.error("Failed to load conversation");
      }
    };

    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
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
      let chatId = conversationId;

      if (!chatId) {
        const title = content.split(' ').slice(0, 5).join(' ');
        const conversationData = await createConversation(
          title.length > 30 ? title.substring(0, 30) + '...' : title
        );
        chatId = conversationData.id;
        navigate(`/chat/${chatId}`);
      }

      if (chatId) {
        await createMessage(chatId, content, "user");
      }

      const responseText = await sendMessage(content);
      
      let cleanup = simulateStreamResponse(
        responseText,
        (chunk) => {
          setStreamingText((prev) => prev + chunk);
        },
        async () => {
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

          if (chatId) {
            await createMessage(chatId, responseText, "assistant");
          }
        }
      );
      
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
    navigate('/chat');
    setMessages([]);
    setCurrentTitle("New Chat");
    toast.success("Started a new chat");
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <ChatHeader title={currentTitle} onClearChat={handleClearChat} />
      
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
                {user ? "Your conversations will be saved to your account" : "Sign in to save your conversations"}
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
