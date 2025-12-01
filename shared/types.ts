export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// MuseCMS Types
export type FieldType = 'text' | 'slug' | 'markdown' | 'number' | 'date' | 'reference';
export type EntryStatus = 'draft' | 'published';
export interface ContentField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: Record<string, any>; // For future use, e.g., reference constraints
}
export interface ContentType {
  id: string; // will be the slug-like name, e.g., 'blog-post'
  title: string;
  slug: string;
  fields: ContentField[];
}
export interface ContentEntry {
  id: string;
  contentTypeId: string;
  status: EntryStatus;
  slug: string;
  publishedAt?: number;
  createdAt: number;
  updatedAt: number;
  version: number;
  data: Record<string, any>; // The actual content based on ContentType fields
}
export interface Media {
  id: string;
  url: string;
  filename: string;
  mime: string;
  size: number;
  createdAt: number;
}
// Minimal real-world chat example types (shared by frontend and worker) - from template
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number; // epoch millis
}