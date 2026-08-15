import { conversations, messages } from "../../models/chat";
import { eq, desc } from "drizzle-orm";
import { sql } from "drizzle-orm";

// We'll use a simple in-memory storage since we don't have a DB setup yet
// and the blueprint expects a db import that doesn't exist.
// This is a placeholder that matches the interface.

let conversationsDb: any[] = [];
let messagesDb: any[] = [];

export interface IChatStorage {
  getConversation(id: number): Promise<any | undefined>;
  getAllConversations(): Promise<any[]>;
  createConversation(title: string): Promise<any>;
  deleteConversation(id: number): Promise<void>;
  getMessagesByConversation(conversationId: number): Promise<any[]>;
  createMessage(conversationId: number, role: string, content: string): Promise<any>;
}

export const chatStorage: IChatStorage = {
  async getConversation(id: number) {
    return conversationsDb.find(c => c.id === id);
  },

  async getAllConversations() {
    return [...conversationsDb].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  async createConversation(title: string) {
    const conversation = {
      id: conversationsDb.length + 1,
      title,
      createdAt: new Date(),
    };
    conversationsDb.push(conversation);
    return conversation;
  },

  async deleteConversation(id: number) {
    messagesDb = messagesDb.filter(m => m.conversationId !== id);
    conversationsDb = conversationsDb.filter(c => c.id !== id);
  },

  async getMessagesByConversation(conversationId: number) {
    return messagesDb
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  },

  async createMessage(conversationId: number, role: string, content: string) {
    const message = {
      id: messagesDb.length + 1,
      conversationId,
      role,
      content,
      createdAt: new Date(),
    };
    messagesDb.push(message);
    return message;
  },
};

