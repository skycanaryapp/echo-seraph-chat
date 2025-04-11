
import { useEffect, useState } from "react";
import { PlusCircle, Trash2, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInput,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Conversation, getConversations, deleteConversation } from "@/services/ChatService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ChatSidebarProps {
  onNewChat: () => void;
  onSelectChat: (conversationId: string) => void;
  currentChatId: string | null;
}

const ChatSidebar = ({ onNewChat, onSelectChat, currentChatId }: ChatSidebarProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();

  const fetchConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    } else {
      setConversations([]);
      setLoading(false);
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await deleteConversation(conversationId);
      setConversations((prev) => prev.filter((conv) => conv.id !== conversationId));
      toast.success("Conversation deleted");
      if (currentChatId === conversationId) {
        onNewChat();
      }
    } catch (error) {
      toast.error("Failed to delete conversation");
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          <h2 className="text-xl font-semibold">Chat History</h2>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="p-2">
          <Button 
            className="w-full mb-2 justify-start" 
            onClick={onNewChat}
            variant="outline"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>
        
        <ScrollArea className="h-[calc(100vh-180px)]">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No conversations yet</div>
          ) : (
            <SidebarMenu>
              {conversations.map((conversation) => (
                <SidebarMenuItem key={conversation.id}>
                  <SidebarMenuButton
                    isActive={currentChatId === conversation.id}
                    onClick={() => onSelectChat(conversation.id)}
                    className="justify-between group"
                  >
                    <div className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <div className="truncate">{conversation.title}</div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(conversation.created_at)}
                      </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={(e) => handleDeleteConversation(conversation.id, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}
        </ScrollArea>
      </SidebarContent>
      
      <SidebarFooter>
        {user && (
          <div className="p-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm truncate">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default ChatSidebar;
