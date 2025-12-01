import { IndexedEntity } from "./core-utils";
import type { User, Chat, ChatMessage, ContentType, ContentEntry, Media, EntryStatus } from "@shared/types";
import { MOCK_CHAT_MESSAGES, MOCK_CHATS, MOCK_USERS, SEED_CONTENT_TYPES, SEED_ENTRIES, SEED_MEDIA } from "@shared/mock-data";
// --- MuseCMS Entities ---
export class ContentTypeEntity extends IndexedEntity<ContentType> {
  static readonly entityName = "content-type";
  static readonly indexName = "content-types";
  static readonly initialState: ContentType = { id: "", slug: "", title: "", fields: [] };
  static seedData = SEED_CONTENT_TYPES;
}
export class ContentEntryEntity extends IndexedEntity<ContentEntry> {
  static readonly entityName = "entry";
  static readonly indexName = "entries";
  static readonly initialState: ContentEntry = {
    id: "",
    contentTypeId: "",
    status: "draft",
    slug: "",
    createdAt: 0,
    updatedAt: 0,
    version: 0,
    data: {},
  };
  static seedData = SEED_ENTRIES;
  async publish(): Promise<ContentEntry> {
    return this.mutate(s => ({ ...s, status: 'published', publishedAt: s.publishedAt ?? Date.now() }));
  }
  async unpublish(): Promise<ContentEntry> {
    return this.mutate(s => ({ ...s, status: 'draft' }));
  }
}
export class MediaEntity extends IndexedEntity<Media> {
  static readonly entityName = "media";
  static readonly indexName = "media-items";
  static readonly initialState: Media = { id: "", url: "", filename: "", mime: "", size: 0, createdAt: 0 };
  static seedData = SEED_MEDIA;
}
// --- Template Entities (kept for compatibility) ---
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "" };
  static seedData = MOCK_USERS;
}
export type ChatBoardState = Chat & { messages: ChatMessage[] };
const SEED_CHAT_BOARDS: ChatBoardState[] = MOCK_CHATS.map(c => ({
  ...c,
  messages: MOCK_CHAT_MESSAGES.filter(m => m.chatId === c.id),
}));
export class ChatBoardEntity extends IndexedEntity<ChatBoardState> {
  static readonly entityName = "chat";
  static readonly indexName = "chats";
  static readonly initialState: ChatBoardState = { id: "", title: "", messages: [] };
  static seedData = SEED_CHAT_BOARDS;
  async listMessages(): Promise<ChatMessage[]> {
    const { messages } = await this.getState();
    return messages;
  }
  async sendMessage(userId: string, text: string): Promise<ChatMessage> {
    const msg: ChatMessage = { id: crypto.randomUUID(), chatId: this.id, userId, text, ts: Date.now() };
    await this.mutate(s => ({ ...s, messages: [...s.messages, msg] }));
    return msg;
  }
}