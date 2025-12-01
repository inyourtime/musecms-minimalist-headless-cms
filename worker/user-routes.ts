import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ChatBoardEntity, ContentTypeEntity, ContentEntryEntity, MediaEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { ContentEntry, ContentType, Media } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // --- MuseCMS API Routes ---
  // Ensure all entities are seeded on first request
  app.use('/api/*', async (c, next) => {
    await Promise.all([
      ContentTypeEntity.ensureSeed(c.env),
      ContentEntryEntity.ensureSeed(c.env),
      MediaEntity.ensureSeed(c.env),
      UserEntity.ensureSeed(c.env),
      ChatBoardEntity.ensureSeed(c.env),
    ]);
    await next();
  });
  // Simple mock auth middleware
  app.use('/api/protected/*', async (c, next) => {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    if (token !== 'mock-admin-token' && token !== 'mock-editor-token') {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    await next();
  });
  // CONTENT TYPES
  app.get('/api/content-types', async (c) => ok(c, await ContentTypeEntity.list(c.env)));
  app.get('/api/content-types/:id', async (c) => {
    const entity = new ContentTypeEntity(c.env, c.req.param('id'));
    if (!await entity.exists()) return notFound(c);
    return ok(c, await entity.getState());
  });
  app.post('/api/content-types', async (c) => {
    const body = await c.req.json<Partial<ContentType>>();
    if (!body.id || !body.title || !body.fields) return bad(c, 'id, title, and fields are required');
    const newType: ContentType = { id: body.id, slug: body.id, title: body.title, fields: body.fields };
    return ok(c, await ContentTypeEntity.create(c.env, newType));
  });
  app.put('/api/content-types/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<Partial<ContentType>>();
    const entity = new ContentTypeEntity(c.env, id);
    if (!await entity.exists()) return notFound(c);
    const updated = await entity.mutate(s => ({ ...s, ...body }));
    return ok(c, updated);
  });
  app.delete('/api/content-types/:id', async (c) => {
    const deleted = await ContentTypeEntity.delete(c.env, c.req.param('id'));
    return ok(c, { deleted });
  });
  // ENTRIES
  app.get('/api/entries', async (c) => {
    const { cursor, limit, contentTypeId, status } = c.req.query();
    let { items, next } = await ContentEntryEntity.list(c.env, cursor, limit ? parseInt(limit) : undefined);
    if (contentTypeId) items = items.filter(it => it.contentTypeId === contentTypeId);
    if (status) items = items.filter(it => it.status === status);
    return ok(c, { items, next });
  });
  app.get('/api/entries/:id', async (c) => {
    const entity = new ContentEntryEntity(c.env, c.req.param('id'));
    if (!await entity.exists()) return notFound(c);
    const state = await entity.getState();
    return ok(c, { ...state, version: (entity as any)._version });
  });
  app.post('/api/entries', async (c) => {
    const body = await c.req.json<Partial<ContentEntry>>();
    if (!body.contentTypeId || !body.data) return bad(c, 'contentTypeId and data are required');
    const id = crypto.randomUUID();
    const now = Date.now();
    const newEntry: ContentEntry = {
      id,
      contentTypeId: body.contentTypeId,
      status: 'draft',
      slug: body.slug || id,
      createdAt: now,
      updatedAt: now,
      version: 1,
      data: body.data,
    };
    return ok(c, await ContentEntryEntity.create(c.env, newEntry));
  });
  app.put('/api/entries/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<{ data: Record<string, any>, status: 'draft' | 'published', slug: string, version: number }>();
    const entity = new ContentEntryEntity(c.env, id);
    if (!await entity.exists()) return notFound(c);
    const currentState = await entity.getState();
    if (body.version !== currentState.version) {
      return c.json({ success: false, error: 'Conflict: Stale data. Please refresh.' }, 409);
    }
    const updated = await entity.mutate(s => ({
      ...s,
      data: body.data,
      status: body.status,
      slug: body.slug,
      updatedAt: Date.now(),
      publishedAt: s.status === 'draft' && body.status === 'published' ? Date.now() : s.publishedAt,
      version: s.version + 1,
    }));
    return ok(c, updated);
  });
  app.post('/api/entries/:id/publish', async (c) => {
    const entity = new ContentEntryEntity(c.env, c.req.param('id'));
    if (!await entity.exists()) return notFound(c);
    return ok(c, await entity.publish());
  });
  app.post('/api/entries/:id/unpublish', async (c) => {
    const entity = new ContentEntryEntity(c.env, c.req.param('id'));
    if (!await entity.exists()) return notFound(c);
    return ok(c, await entity.unpublish());
  });
  app.delete('/api/entries/:id', async (c) => ok(c, { deleted: await ContentEntryEntity.delete(c.env, c.req.param('id')) }));
  app.post('/api/entries/deleteMany', async (c) => {
    const { ids } = await c.req.json<{ ids: string[] }>();
    if (!ids || !Array.isArray(ids)) return bad(c, 'ids array is required');
    const deletedCount = await ContentEntryEntity.deleteMany(c.env, ids);
    return ok(c, { deletedCount });
  });
  // MEDIA
  app.get('/api/media', async (c) => ok(c, await MediaEntity.list(c.env)));
  app.post('/api/media', async (c) => {
    const body = await c.req.json<Partial<Media>>();
    if (!body.url || !body.filename) return bad(c, 'url and filename are required');
    const newMedia: Media = {
      id: crypto.randomUUID(),
      url: body.url,
      filename: body.filename,
      mime: body.mime || 'image/jpeg',
      size: body.size || 0,
      createdAt: Date.now(),
    };
    return ok(c, await MediaEntity.create(c.env, newMedia));
  });
  app.delete('/api/media/:id', async (c) => ok(c, { deleted: await MediaEntity.delete(c.env, c.req.param('id')) }));
  // DATA MANAGEMENT & WEBHOOKS
  app.get('/api/export', async (c) => {
    const [contentTypes, entries, media] = await Promise.all([
      ContentTypeEntity.list(c.env),
      ContentEntryEntity.list(c.env),
      MediaEntity.list(c.env),
    ]);
    return ok(c, { contentTypes: contentTypes.items, entries: entries.items, media: media.items });
  });
  app.post('/api/import', async (c) => {
    const { contentTypes, entries, media } = await c.req.json<{ contentTypes?: ContentType[], entries?: ContentEntry[], media?: Media[] }>();
    try {
      if (contentTypes) await Promise.all(contentTypes.map(item => ContentTypeEntity.create(c.env, item)));
      if (entries) await Promise.all(entries.map(item => ContentEntryEntity.create(c.env, item)));
      if (media) await Promise.all(media.map(item => MediaEntity.create(c.env, item)));
      return ok(c, { success: true, message: 'Import completed.' });
    } catch (error) {
      return bad(c, `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  app.post('/api/webhooks', async (c) => {
    const payload = await c.req.json();
    console.log('Webhook received:', JSON.stringify(payload, null, 2));
    return ok(c, { received: true });
  });
  // SETTINGS (Mock)
  app.get('/api/settings', (c) => ok(c, { siteTitle: 'MuseCMS', apiKeys: [{ key: 'mock-key-xxxx', label: 'Default Key' }] }));
  app.post('/api/settings', (c) => ok(c, { message: 'Settings updated (mock)' }));
  // --- Template API Routes (kept for compatibility) ---
  app.get('/api/test', (c) => c.json({ success: true, data: { name: 'CF Workers Demo' }}));
  app.get('/api/users', async (c) => ok(c, await UserEntity.list(c.env)));
  app.post('/api/users', async (c) => {
    const { name } = (await c.req.json()) as { name?: string };
    if (!name?.trim()) return bad(c, 'name required');
    return ok(c, await UserEntity.create(c.env, { id: crypto.randomUUID(), name: name.trim() }));
  });
  app.get('/api/chats', async (c) => ok(c, await ChatBoardEntity.list(c.env)));
  app.post('/api/chats', async (c) => {
    const { title } = (await c.req.json()) as { title?: string };
    if (!title?.trim()) return bad(c, 'title required');
    const created = await ChatBoardEntity.create(c.env, { id: crypto.randomUUID(), title: title.trim(), messages: [] });
    return ok(c, { id: created.id, title: created.title });
  });
  app.get('/api/chats/:chatId/messages', async (c) => {
    const chat = new ChatBoardEntity(c.env, c.req.param('chatId'));
    if (!await chat.exists()) return notFound(c, 'chat not found');
    return ok(c, await chat.listMessages());
  });
  app.post('/api/chats/:chatId/messages', async (c) => {
    const chatId = c.req.param('chatId');
    const { userId, text } = (await c.req.json()) as { userId?: string; text?: string };
    if (!isStr(userId) || !text?.trim()) return bad(c, 'userId and text required');
    const chat = new ChatBoardEntity(c.env, chatId);
    if (!await chat.exists()) return notFound(c, 'chat not found');
    return ok(c, await chat.sendMessage(userId, text.trim()));
  });
  app.delete('/api/users/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await UserEntity.delete(c.env, c.req.param('id')) }));
  app.delete('/api/chats/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await ChatBoardEntity.delete(c.env, c.req.param('id')) }));
}