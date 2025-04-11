
import { useEffect, useState } from "react";
import { PlusCircle, Trash2, MessageSquare, LogOut, Search } from "lucide-react";
import { format } from "date-fns";
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarRail
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
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
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Sidebar className="z-20">
      <SidebarRail className="after:bg-primary/10 hover:after:bg-primary/20" />
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Chats</h2>
          </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <div className="mb-2">
          <Button 
            className="w-full justify-start bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:opacity-90 transition-opacity"
            onClick={onNewChat}
            variant="default"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>
        
        <div className="mb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-9 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100vh-180px)] pr-1">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Loading...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {searchTerm ? "No matches found" : "No conversations yet"}
            </div>
          ) : (
            <SidebarMenu>
              {filteredConversations.map((conversation) => (
                <SidebarMenuItem key={conversation.id}>
                  <SidebarMenuButton
                    isActive={currentChatId === conversation.id}
                    onClick={() => onSelectChat(conversation.id)}
                    className="justify-between group rounded-lg transition-all hover:bg-primary/5"
                  >
                    <div className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4 text-primary" />
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
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
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
          <div className="p-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm truncate font-medium">{user.email}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="flex items-center gap-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 dark:hover:text-red-400"
              >
                <LogOut className="h-3.5 w-3.5" />
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
