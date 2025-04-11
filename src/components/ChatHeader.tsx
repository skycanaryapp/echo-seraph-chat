
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface ChatHeaderProps {
  onClearChat: () => void;
}

const ChatHeader = ({ onClearChat }: ChatHeaderProps) => {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-2">
        <MessageSquare className="h-6 w-6 text-indigo" />
        <h1 className="text-xl font-semibold">AI Chat Interface</h1>
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClearChat}
        >
          Clear Chat
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default ChatHeader;
