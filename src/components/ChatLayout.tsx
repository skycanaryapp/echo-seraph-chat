
import { ReactNode, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import ChatSidebar from "@/components/ChatSidebar";
import { useAuth } from "@/contexts/AuthContext";
import AuthUI from "./auth/AuthUI";
import ThemeToggle from "./ThemeToggle";

interface ChatLayoutProps {
  children: ReactNode;
}

const ChatLayout = ({ children }: ChatLayoutProps) => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const handleNewChat = () => {
    navigate('/chat');
  };
  
  const handleSelectChat = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full">
        {!authLoading && (
          <ChatSidebar 
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            currentChatId={conversationId || null}
          />
        )}
        
        <div className="flex-1 flex flex-col">
          <div className="absolute top-4 right-4 z-10">
            <ThemeToggle />
          </div>
          
          {!authLoading && !user ? (
            <div className="flex items-center justify-center h-full p-4">
              <AuthUI />
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ChatLayout;
