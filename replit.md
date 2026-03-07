# PROTELS Hotels & Resorts Website

## Overview

This is a luxury hotel website for **PROTELS Hotels & Resorts**, a hospitality brand operating premium beach resorts in Egypt (Marsa Alam, Hurghada) and Zanzibar, Tanzania. The site is a full-stack application with a public-facing marketing website and a CMS/admin backend for content management.

**Key properties featured:**
- Protels Crystal Beach Resort – Marsa Alam, Egypt
- Protels Beach Club & Spa – Marsa Alam, Egypt
- Protels Royal Bay Resort & Spa – Hurghada, Egypt
- Protels La Plage – Zanzibar, Tanzania

The website supports **8 languages** (English, Arabic, French, German, Spanish, Russian, Polish, Czech) with RTL support for Arabic.

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
- 8 languages: EN, AR, FR, DE, ES, RU, PL, CS
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
- `/controlpanal/performance` – Website Performance Analyzer (image + JS analysis, LCP detection, optimize/edit buttons, DB reference auto-update on optimize/edit/replace)
- `/controlpanal/image-optimization` – Image Optimization (scan/compress/convert to WebP)

**SEO:**
- `robots.txt` – Server-side route in `server/routes.ts`, blocks /admin, /controlpanal, /api
- `sitemap.xml` – Dynamic server-side route with all public pages, hotel sub-pages, and blog posts
- `client/src/components/SEOHead.tsx` – Reusable SEO component (title, description, OG, Twitter, JSON-LD, canonical)
- `client/src/components/CMSHead.tsx` – CMS-driven SEO overrides (GTM, favicon, hreflang)
- Schema.org structured data: Organization, Hotel, BreadcrumbList, BlogPosting, WebSite
- Target keywords: "Marsa Alam hotels", "Red Sea resorts", "Protels resorts", "Egypt beach resorts"
- All pages have unique meta titles, descriptions, and keywords
- Blog articles have article-type OG tags and BlogPosting JSON-LD

**Key Frontend Files:**
- `client/src/App.tsx` – Main router and providers
- `client/src/lib/data.ts` – Static hotel data, room details, images
- `client/src/lib/i18n.tsx` – Translation system and language context
- `client/src/lib/cms.ts` – CMS data fetching hooks
- `client/src/components/Navbar.tsx` – Main navigation with language switcher
- `client/src/components/Footer.tsx` – Site footer
- `client/src/components/Hero.tsx` – Hero section with image carousel
- `client/src/components/SEOHead.tsx` – Per-page SEO meta tags and structured data
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
- `chatbot_config` – Key-value chatbot settings (tone, responseLength, language, customInstructions)
- `chatbot_faq` – Q&A pairs the chatbot uses to answer common questions
- `chatbot_offers` – Active offers/promotions the chatbot mentions (general or per-hotel, with date ranges)
- `chatbot_conversations` – Saved conversations with guests, lead detection (name, phone/email)

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
- Hotel management (CRUD with rich details, per-hotel theme colors, hero video, tab config)
- Media library with file uploads
- SEO settings per URL path
- Global settings (GTM, favicon, hero video, header nav config, footer config, social links)
- User management with role-based access (Super Admin, Content Manager, Editor, Viewer)
- Theme customization (global colors, fonts, logo sizing with live preview)
- Live inline editing with floating style toolbar (font, size, color, alignment for text; dimensions for images)
- Header navigation menu reordering and visibility control
- Footer column configuration

The CMS injects dynamic metadata via `CMSHead` component (GTM scripts, SEO tags, favicon).

**Key CMS Files:**
- `client/src/pages/cms/CMSTheme.tsx` – Global theme customization (colors, fonts, logo)
- `client/src/pages/cms/CMSUsers.tsx` – User management with role-based access
- `client/src/pages/cms/CMSHotels.tsx` – Hotel editor with Video, Theme, Tab Config tabs
- `client/src/pages/cms/CMSSettings.tsx` – Global settings, header nav, footer, hero video
- `client/src/components/FloatingEditToolbar.tsx` – Inline style editor for live edit mode
- `client/src/components/ThemeProvider.tsx` – Dynamic CSS custom properties from CMS theme
- `client/src/components/EditableText.tsx` – ContentEditable text with style persistence
- `client/src/components/EditableImage.tsx` – Click-to-upload image replacement
- `client/src/lib/editMode.tsx` – Edit mode context (page content, pending changes, save)

**Hotel-specific Features (DB columns):**
- `heroVideo` (text) – MP4 URL for background video in hotel hero section
- `theme` (JSONB) – Per-hotel color overrides (primaryColor, secondaryColor, accentColor)
- `tabConfig` (JSONB) – Tab ordering and visibility config for hotel detail page tabs

**CMS AI Assistant:**
- Floating bubble chat on all CMS pages + full page at `/controlpanal/ai-assistant`
- Backend: `POST /api/cms-assistant` (auth required, streaming SSE, OpenAI gpt-4o with function calling + vision)
- Capabilities: Content writing, translation (8 languages), direct CMS editing (hotels, pages, blog, settings, SEO), CMS usage guidance
- **Image/Screenshot Support:** Users can attach images (up to 5, max 4MB each) via file picker, drag & drop, or Ctrl+V paste. Images sent as base64 data URLs and processed via GPT-4o Vision.
- Function calling tools: update_hotel, update_setting, update_page_content, update_page, update_blog_post, update_seo, get_hotels, get_pages, get_settings, get_blog_posts, get_seo_settings, get_page_contents, translate_text, create_page, create_blog_post, bulk_translate_hotel
- Component: `client/src/components/CMSAssistant.tsx` (shared between floating and fullpage modes)
- Full page: `client/src/pages/cms/CMSAIAssistant.tsx`

**User Roles:**
- `super_admin` – Full CMS access including user management and settings
- `content_manager` – Content editing (pages, hotels, blog) but no settings/users
- `editor` – Edit existing content but cannot delete
- `viewer` – Read-only access to CMS

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