# MuseCMS — Minimalist Headless CMS

[![Deploy to Cloudflare]([cloudflarebutton])]([cloudflarebutton])

MuseCMS is a lightweight, beautifully designed headless CMS built to run on Cloudflare Workers + Durable Objects. It provides an elegant content modelling system (Content Types), an entry editor (Markdown + structured fields), a media manager, and a fast JSON API for publishing. The product emphasizes visual polish, micro-interactions, and a pristine, minimal UX so content teams can create, iterate, and publish quickly.

## Features

- **Content Types**: Create and manage schema definitions with fields like text, markdown, number, date, and references to other types.
- **Entries**: Create, edit, and publish instances of content types with autosave, draft/published states, slug generation, and revision history.
- **Media Library**: Upload and manage media files with metadata indexing; supports external URL storage for placeholders in initial setup.
- **Visual Dashboard**: Responsive React frontend with shadcn/ui components, featuring a hero dashboard, content library grid, split-view editor, and media browser.
- **Fast JSON API**: RESTful endpoints for content types, entries, and media, powered by Hono and Cloudflare Durable Objects for persistent storage.
- **Optimistic Concurrency**: Built-in CAS (Compare-And-Swap) to prevent edit conflicts.
- **Seed Data**: Pre-configured sample content types and entries for immediate demo experience.
- **Mobile-First Design**: Intuitive navigation, smooth animations, and flawless responsiveness across devices.

MuseCMS follows design principles of minimalism with generous whitespace, subtle gradients, refined typography, and high-contrast interactions, all while maintaining production-ready performance at the edge.

## Tech Stack

- **Frontend**: React 18+, React Router, shadcn/ui (Radix UI primitives), Tailwind CSS v3, Framer Motion (micro-interactions), Lucide React (icons), Sonner (toasts), Zustand (state management).
- **Backend**: Hono (routing), Cloudflare Workers, Durable Objects (persistent storage via IndexedEntity patterns).
- **Utilities**: Zod (validation), Date-fns (dates), Immer (immutable updates), clsx & tailwind-merge (class utilities).
- **Build & Dev**: Vite (bundling), TypeScript, Bun (package manager), Wrangler (Cloudflare deployment).
- **Shared**: Type-safe API contracts via shared types.

The project leverages Cloudflare's edge computing for low-latency API responses and global distribution.

## Quick Start

[cloudflarebutton]

## Installation

This project uses Bun as the package manager for faster performance. Ensure you have Bun installed (version 1.0+).

1. Clone the repository:
   ```
   git clone <repository-url>
   cd muse-cms
   ```

2. Install dependencies:
   ```
   bun install
   ```

3. Generate TypeScript types for Cloudflare bindings (if needed):
   ```
   bun run cf-typegen
   ```

## Usage

### Local Development

Start the development server:

```
bun run dev
```

The app will be available at `http://localhost:3000`. The worker API endpoints are automatically handled via Vite proxying to the local worker.

- **Frontend**: Hot-reloads on changes to `/src` files.
- **Backend**: Edit routes in `worker/user-routes.ts` and entities in `worker/entities.ts`. Restart with `bun run dev` for worker changes.

Test API endpoints using tools like curl or the built-in health check:

```
curl http://localhost:3000/api/health
```

### Key User Flows

1. **Dashboard**: View quick stats (entries, media, types), recent activity, and shortcuts to create content.
2. **Content Library**: Browse entries by type/status, apply filters, and perform bulk actions.
3. **Entry Editor**: Edit structured fields and Markdown; preview in real-time with autosave.
4. **Content Types**: Define schemas with drag-to-reorder fields and preview templates.
5. **Media Library**: Search and select media to insert into entries.

Seed data is automatically populated on first run for a full demo experience.

### API Examples

All API calls return JSON with `{ success: boolean, data?: T, error?: string }`.

- List entries: `GET /api/entries?type=blog-post&limit=10&cursor=abc123`
- Create entry: `POST /api/entries` with body `{ type: "blog-post", title: "My Post", ... }`
- Get content type: `GET /api/content-types/blog-post`
- Upload media (mock): `POST /api/media` with multipart form data.

See `shared/types.ts` for full type definitions.

## Development

### Project Structure

- **`/src`**: React frontend (pages, components, hooks, utils).
- **`/worker`**: Cloudflare Worker backend (routes, entities, core utils – do not modify `core-utils.ts` or `index.ts`).
- **`/shared`**: Shared types and mock data (replace mocks with real seeds).
- **`/src/components/ui`**: shadcn/ui components (pre-installed; extend as needed).

### Adding Features

1. **New Entities**: Extend `IndexedEntity` in `worker/entities.ts` for new models (e.g., `ContentTypeEntity`).
2. **API Routes**: Add endpoints in `worker/user-routes.ts` using `ok()`, `bad()`, and entity methods.
3. **Frontend Pages**: Create routes in `src/main.tsx` and pages in `src/pages/`.
4. **UI Components**: Use shadcn/ui primitives; compose with Tailwind for visual polish.
5. **State Management**: Use Zustand for local state; select primitives only to avoid re-renders.
6. **Linting & Formatting**: Run `bun run lint` for ESLint checks.

Follow the UI non-negotiables: Always wrap content in `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` with inner `py-8 md:py-10 lg:py-12`.

### Testing

- Unit tests: Add to `/src` with Vitest (not pre-configured; extend as needed).
- API testing: Use the dev server and tools like Postman.
- Visual testing: Ensure responsive design across breakpoints (mobile-first).

Avoid modifying forbidden files like `wrangler.jsonc`, `worker/core-utils.ts`, or bindings to prevent deployment issues.

## Deployment

Deploy to Cloudflare Workers for global edge deployment. The project is pre-configured for one-click deployment.

1. Ensure Wrangler is installed: `bun add -g wrangler`.
2. Login: `wrangler login`.
3. Build the frontend: `bun run build`.
4. Deploy: `bun run deploy`.

For production, the static assets (built frontend) are served via Cloudflare's asset handling, while API routes (`/api/*`) route through the Worker.

[cloudflarebutton]

Monitor deployments via the Cloudflare dashboard. The Durable Object binding (`GlobalDurableObject`) handles all persistence.

### Environment Variables

No custom env vars are required; all configuration is in `wrangler.jsonc`. For secrets (e.g., API keys in future phases), use `wrangler secret put <KEY>`.

## Contributing

Contributions are welcome! Please:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

Follow the code style (TypeScript strict mode, Tailwind utilities) and ensure no breaking changes to core utils.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.