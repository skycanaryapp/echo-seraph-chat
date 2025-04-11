
import { supabase } from "@/integrations/supabase/client";

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export interface MessageData {
  id: string;
  content: string;
  role: "user" | "assistant";
  created_at: string;
  conversation_id: string;
}

export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};

export const getConversation = async (id: string): Promise<Conversation | null> => {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error fetching conversation with id ${id}:`, error);
    throw error;
  }
};

export const createConversation = async (title: string): Promise<Conversation> => {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .insert([{ title }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};

export const getMessages = async (conversationId: string): Promise<MessageData[]> => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    // Explicitly cast the role to "user" | "assistant"
    return (data || []).map(message => ({
      ...message,
      role: message.role as "user" | "assistant"
    })) as MessageData[];
  } catch (error) {
    console.error(`Error fetching messages for conversation ${conversationId}:`, error);
    throw error;
  }
};

// Add the missing createMessage function that Chat.tsx is importing as addMessage
export const createMessage = async (
  conversationId: string,
  content: string,
  role: "user" | "assistant"
): Promise<MessageData> => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .insert([{ conversation_id: conversationId, content, role }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as MessageData;
  } catch (error) {
    console.error("Error creating message:", error);
    throw error;
  }
};

export const updateConversationTitle = async (
  conversationId: string,
  title: string
): Promise<Conversation> => {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", conversationId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error updating conversation ${conversationId}:`, error);
    throw error;
  }
};

export const deleteConversation = async (conversationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error(`Error deleting conversation ${conversationId}:`, error);
    throw error;
  }
};

export const deleteAllConversations = async (): Promise<void> => {
  try {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .neq("id", "placeholder"); // Delete all

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting all conversations:", error);
    throw error;
  }
};

// Add the missing addMessage function that's being imported in Chat.tsx
export const addMessage = async (
  conversationId: string,
  content: string,
  role: "user" | "assistant"
): Promise<MessageData> => {
  return createMessage(conversationId, content, role);
};
