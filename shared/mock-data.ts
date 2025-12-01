import type { User, Chat, ChatMessage, ContentType, ContentEntry, Media } from './types';
// --- MuseCMS Seed Data ---
export const SEED_CONTENT_TYPES: ContentType[] = [
  {
    id: 'blog-post',
    slug: 'blog-post',
    title: 'Blog Post',
    fields: [
      { id: 'title', name: 'title', label: 'Title', type: 'text', required: true },
      { id: 'slug', name: 'slug', label: 'Slug', type: 'slug', required: true },
      { id: 'body', name: 'body', label: 'Body', type: 'markdown', required: true },
      { id: 'excerpt', name: 'excerpt', label: 'Excerpt', type: 'text' },
      { id: 'coverImage', name: 'coverImage', label: 'Cover Image', type: 'reference' },
      { id: 'publishedAt', name: 'publishedAt', label: 'Publish Date', type: 'date' },
    ],
  },
];
export const SEED_ENTRIES: ContentEntry[] = [
  {
    id: 'welcome-to-musecms',
    contentTypeId: 'blog-post',
    status: 'published',
    slug: 'welcome-to-musecms',
    publishedAt: Date.now() - 86400000, // 1 day ago
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000,
    version: 1,
    data: {
      title: 'Welcome to MuseCMS',
      slug: 'welcome-to-musecms',
      body: '## Hello World!\n\nThis is your first post in your new **beautifully simple** headless CMS. You can edit this entry, create new ones, or define new content types.',
      excerpt: 'Learn how to get started with MuseCMS.',
      coverImage: 'media-1',
    },
  },
  {
    id: 'getting-started',
    contentTypeId: 'blog-post',
    status: 'draft',
    slug: 'getting-started',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
    data: {
      title: 'Getting Started Guide',
      slug: 'getting-started',
      body: '### 1. Define Content Types\n\nGo to the "Content Types" section to model your data.\n\n### 2. Create Entries\n\nStart creating content from the "Content Library".\n\n### 3. Publish!\n\nUse the API to fetch your published content.',
      excerpt: 'A quick guide to get you up and running.',
    },
  },
];
export const SEED_MEDIA: Media[] = [
  {
    id: 'media-1',
    url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2874&auto=format&fit=crop',
    filename: 'abstract-gradient.jpg',
    mime: 'image/jpeg',
    size: 1200000,
    createdAt: Date.now(),
  },
  {
    id: 'media-2',
    url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2929&auto=format&fit=crop',
    filename: 'purple-blue-blur.jpg',
    mime: 'image/jpeg',
    size: 980000,
    createdAt: Date.now(),
  },
  {
    id: 'media-3',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2940&auto=format&fit=crop',
    filename: 'colorful-blur.jpg',
    mime: 'image/jpeg',
    size: 1500000,
    createdAt: Date.now(),
  },
];
// --- Template Mock Data (kept for compatibility) ---
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Admin' },
  { id: 'u2', name: 'Editor' }
];
export const MOCK_CHATS: Chat[] = [
  { id: 'c1', title: 'General' },
];
export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  { id: 'm1', chatId: 'c1', userId: 'u1', text: 'Hello', ts: Date.now() },
];