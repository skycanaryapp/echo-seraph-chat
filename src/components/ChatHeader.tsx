
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface ChatHeaderProps {
  title?: string;
  onClearChat?: () => void;
}

const ChatHeader = ({ title = "AI Chat Interface", onClearChat }: ChatHeaderProps) => {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-white/10 backdrop-blur-md dark:bg-black/20">
      <div className="flex items-center space-x-2">
        <MessageSquare className="h-6 w-6 text-blue-500" />
        <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          {title}
        </h1>
      </div>
      <div className="flex items-center space-x-2">
        {onClearChat && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearChat}
            className="hover:bg-blue-50 dark:hover:bg-blue-950/20"
          >
            Clear Chat
          </Button>
        )}
      </div>
    </header>
  );
};

export default ChatHeader;
