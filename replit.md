# PROTELS Hotels & Resorts Website

## Overview

This is a luxury hotel website for **PROTELS Hotels & Resorts**, a hospitality brand operating premium beach resorts in Egypt (Marsa Alam, Hurghada) and Zanzibar, Tanzania. The site is a full-stack application with a public-facing marketing website and a CMS/admin backend for content management.

**Key properties featured:**
- Protels Crystal Beach Resort – Marsa Alam, Egypt
- Protels Beach Club & Spa – Marsa Alam, Egypt
- Protels Royal Bay Resort & Spa – Hurghada, Egypt
- Protels La Plage – Zanzibar, Tanzania

The website supports **6 languages** (English, Arabic, French, German, Spanish, Russian) with RTL support for Arabic.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework:** React with TypeScript, built using Vite
- **Styling:** Tailwind CSS v4 (using `@import "tailwindcss"` syntax) with CSS custom properties for brand theming
- **UI Components:** shadcn/ui (new-york style) built on Radix UI primitives
- **Routing:** Wouter (lightweight client-side router)
- **State Management:** TanStack React Query for server state
- **Animations:** Framer Motion
- **Icons:** Lucide React

**Brand Design System:**
- Dark navy blue (`hsl(215 45% 15%)`) as primary
- Gold/sand (`hsl(38 45% 75%)`) as secondary/accent
- Cormorant Garamond for headings (luxury serif)
- Montserrat for body text (clean sans-serif)
- Elegant, luxury hospitality tone throughout

**Internationalization (i18n):**
- Custom i18n implementation in `client/src/lib/i18n.tsx`
- 6 languages: EN, AR, FR, DE, ES, RU
- Arabic uses RTL layout; all others LTR
- Translations stored as a centralized object, not in separate files
- Language switcher in the navbar header

**Page Structure:**
- `/` – Home page
- `/hotels` – Hotels listing
- `/about` – About Us page
- `/careers` – Careers/job application page
- `/contact` – Contact page
- `/gallery` – Photo gallery
- `/blog` – Blog articles listing
- `/blog/:slug` – Individual blog article page
- `/admin` – Legacy admin login
- `/controlpanal` – CMS login and management routes (pages, hotels, blog, media, SEO, settings)

**Key Frontend Files:**
- `client/src/App.tsx` – Main router and providers
- `client/src/lib/data.ts` – Static hotel data, room details, images
- `client/src/lib/i18n.tsx` – Translation system and language context
- `client/src/lib/cms.ts` – CMS data fetching hooks
- `client/src/components/Navbar.tsx` – Main navigation with language switcher
- `client/src/components/Footer.tsx` – Site footer
- `client/src/components/Hero.tsx` – Hero section with image carousel
- `client/src/index.css` – Tailwind config and CSS custom properties

### Backend Architecture
- **Runtime:** Node.js with Express
- **Language:** TypeScript (compiled with tsx in dev, esbuild for production)
- **API Pattern:** RESTful JSON API under `/api/` prefix
- **Session Management:** express-session with connect-pg-simple (PostgreSQL-backed sessions)
- **Authentication:** Custom session-based auth with bcryptjs password hashing
- **File Uploads:** Multer (disk storage in `uploads/` directory, 10MB limit)

**Key Backend Files:**
- `server/index.ts` – Express app setup, middleware, HTTP server creation
- `server/routes.ts` – All API route definitions, session config, auth middleware
- `server/storage.ts` – Data access layer (repository pattern) wrapping Drizzle ORM
- `server/auth.ts` – Password hashing, verification, admin seeding
- `server/db.ts` – PostgreSQL connection pool and Drizzle ORM instance
- `server/vite.ts` – Vite dev server middleware for development
- `server/static.ts` – Static file serving for production builds

### Database
- **Database:** PostgreSQL (required, via `DATABASE_URL` environment variable)
- **ORM:** Drizzle ORM with drizzle-zod for validation
- **Schema:** Defined in `shared/schema.ts`
- **Migrations:** Via `drizzle-kit push` (push-based, not migration files)

**Database Tables:**
- `users` – Admin/CMS users (id, username, password, role)
- `pages` – CMS-managed pages with multilingual content (title/content stored as JSONB `Record<string, string>`)
- `hotels` – Hotel entries with descriptions (JSONB), features, rooms, gallery, dining details, map links
- `media` – Uploaded media file metadata
- `blogPosts` – Blog articles with multilingual title/content/excerpt (JSONB), SEO fields, hotel linking, featured image
- `globalSettings` – Key-value settings store
- `seoSettings` – Per-path SEO metadata (meta titles, descriptions, OG tags, robots, canonical URLs)

### Build System
- **Development:** `tsx server/index.ts` runs the Express server with Vite middleware for HMR
- **Production Build:** Custom `script/build.ts` that runs Vite build (client) and esbuild (server) → outputs to `dist/`
- **Production Start:** `node dist/index.cjs`
- **Client dev server** runs on port 5000

### Shared Code
- `shared/schema.ts` – Database schema and Zod validation schemas shared between client and server
- Path aliases: `@/` → `client/src/`, `@shared/` → `shared/`, `@assets/` → `attached_assets/`

### CMS Architecture
The CMS is a built-in admin panel accessible at `/controlpanal/*` routes. It provides:
- Page management with multilingual content editing
- Hotel management (CRUD with rich details)
- Media library with file uploads
- SEO settings per URL path
- Global settings (GTM, favicon, etc.)
- User management with role-based access

The CMS injects dynamic metadata via `CMSHead` component (GTM scripts, SEO tags, favicon).

## External Dependencies

### Database
- **PostgreSQL** – Primary database, connection via `DATABASE_URL` environment variable
- **connect-pg-simple** – Session storage in PostgreSQL

### Email Services
- **EmailJS** (`@emailjs/browser`) – Client-side email sending for the careers application form
- Requires `VITE_EMAILJS_PUBLIC_KEY` environment variable

### Key NPM Packages
- `drizzle-orm` + `drizzle-kit` – Database ORM and schema management
- `express` + `express-session` – HTTP server and session management
- `bcryptjs` – Password hashing
- `multer` – File upload handling
- `framer-motion` – Page animations
- `wouter` – Client-side routing
- `@tanstack/react-query` – Data fetching and caching
- `zod` – Runtime validation
- `date-fns` – Date formatting

### Environment Variables Required
- `DATABASE_URL` – PostgreSQL connection string (required)
- `VITE_EMAILJS_PUBLIC_KEY` – EmailJS public key for careers form (optional)

### Replit-Specific
- `@replit/vite-plugin-runtime-error-modal` – Error overlay in development
- `@replit/vite-plugin-cartographer` – Dev tooling (dev only)
- `@replit/vite-plugin-dev-banner` – Dev banner (dev only)
- Custom `vite-plugin-meta-images.ts` – Updates OG image meta tags with Replit deployment URL

## CMS Admin Guide

### Access
- **CMS URL:** `/controlpanal`
- **Default Admin:** Username: `Fezzat`, Password: `Fezzat246810`, Role: Super Admin

### CMS Sections
1. **Dashboard** – Overview of content stats (pages, hotels, media, users)
2. **Pages** – Create/edit/delete pages with multilingual content (EN/AR), set draft/published status
3. **Hotels** – Manage hotel/resort entries with descriptions, features, rooms, dining, gallery, map links
4. **Media Library** – Upload and manage images/files, get URLs for use in content
5. **SEO** – Configure meta titles, descriptions, OG tags, canonical URLs, robots per page path
6. **Settings** – Global settings including GTM Container ID, Favicon URL, Site Name, Contact Info, Social Links

### How Content Updates Work
- All published content is served via `/api/public/*` endpoints
- The website dynamically pulls GTM, SEO, and favicon settings from the CMS
- No manual redeploy needed – changes reflect immediately after publishing
- Draft content is only visible in the CMS admin panel

### API Endpoints (Public)
- `GET /api/public/pages/:slug` – Get published page by slug
- `GET /api/public/hotels` – Get all published hotels
- `GET /api/public/hotels/:slug` – Get published hotel by slug
- `GET /api/public/settings/:key` – Get global setting value
- `GET /api/public/seo/:path` – Get SEO settings for a page path
- `POST /api/booking-assistant` – Streaming chatbot endpoint (SSE)

### Booking Assistant Chatbot
- **Component:** `client/src/components/BookingAssistant.tsx` – Floating chat widget on all public pages
- **Backend:** `POST /api/booking-assistant` in `server/routes.ts` – Streaming SSE endpoint using OpenAI (via Replit AI Integrations)
- **Model:** gpt-4o-mini with luxury concierge system prompt
- **Features:** Auto-detects English/Arabic from user's first message, RTL support, bilingual greeting, guides visitors to Book Now
- **Rate limiting:** 10 requests/minute per IP, max 20 messages per conversation, 500 char max per message
- **Hidden on:** Admin (`/admin/*`) and CMS (`/controlpanal/*`) routes via `ChatbotWrapper` in App.tsx
- **OpenAI credentials:** `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` (auto-configured by Replit AI Integrations)