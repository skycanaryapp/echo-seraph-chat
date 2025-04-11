
import { Button } from "@/components/ui/button";
import { MessageSquare, Trash2 } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface ChatHeaderProps {
  title?: string;
  onClearChat?: () => void;
}

const ChatHeader = ({ title = "AI Chat Interface", onClearChat }: ChatHeaderProps) => {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between p-3 border-b bg-white/70 backdrop-blur-md dark:bg-black/50">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {onClearChat && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearChat}
            className="flex items-center gap-1 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear</span>
          </Button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
};

export default ChatHeader;
