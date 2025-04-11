
import { AnimatePresence, motion } from "framer-motion";
import { formatRelative } from "date-fns";
import { Copy, Check, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatMessageProps {
  message: Message;
  streamingText?: string;
}

const ChatMessage = ({ message, streamingText }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const displayContent = message.isStreaming ? streamingText : message.content;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(displayContent || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Message copied to clipboard");
  };

  const shareMessage = () => {
    // For future implementation - could use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: "AI Chat Message",
        text: displayContent || "",
      }).catch(() => {
        toast.error("Failed to share message");
      });
    } else {
      copyToClipboard();
      toast.success("Message copied for sharing");
    }
  };

  return (
    <motion.div
      className={`flex flex-col ${isUser ? "items-end" : "items-start"} mb-6`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className={isUser ? "user-message" : "ai-message"}>
        {displayContent}
      </div>
      
      <div className="flex items-center mt-1 text-xs text-muted-foreground space-x-2">
        <span>{formatRelative(message.timestamp, new Date())}</span>
        
        {!isUser && (
          <div className="flex space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={copyToClipboard}
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? "Copied!" : "Copy message"}</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={shareMessage}
                >
                  <Share2 className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share message</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
