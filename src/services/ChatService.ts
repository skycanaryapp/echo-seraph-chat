
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface MessageData {
  id: string;
  content: string;
  role: "user" | "assistant";
  created_at: string;
}

// Create a new conversation
export const createConversation = async (title: string) => {
  const { data, error } = await supabase
    .from('conversations')
    .insert([{ title }])
    .select()
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }

  return data;
};

// Get all conversations for the current user
export const getConversations = async (): Promise<Conversation[]> => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  return data || [];
};

// Get messages for a specific conversation
export const getMessages = async (conversationId: string): Promise<MessageData[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data || [];
};

// Add a message to a conversation
export const addMessage = async (conversationId: string, content: string, role: "user" | "assistant") => {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      { 
        conversation_id: conversationId, 
        content, 
        role 
      }
    ]);

  if (error) {
    console.error('Error adding message:', error);
    throw error;
  }

  // Update the conversation's updated_at timestamp
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data;
};

// Delete a conversation and all its messages
export const deleteConversation = async (conversationId: string) => {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId);

  if (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};

// Get a conversation by ID
export const getConversation = async (conversationId: string): Promise<Conversation | null> => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  if (error) {
    console.error('Error fetching conversation:', error);
    return null;
  }

  return data;
};
