# PROTELS Hotels & Resorts Website

## Overview

This project is a full-stack website for **PROTELS Hotels & Resorts**, a luxury hospitality brand. It features premium beach resorts in Egypt and Zanzibar. The website includes an 8-language public marketing site with RTL support for Arabic, and a comprehensive CMS/admin backend for content management. Its main purpose is to showcase hotel properties, manage content efficiently across multiple languages, and provide advanced SEO capabilities to attract a global audience. The project aims to establish a strong online presence for PROTELS, driving bookings and brand recognition.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework:** React with TypeScript (Vite)
- **Styling:** Tailwind CSS v4 with CSS custom properties for theming
- **UI Components:** shadcn/ui (new-york style) built on Radix UI
- **Routing:** Wouter
- **State Management:** TanStack React Query
- **Animations:** Framer Motion
- **Internationalization:** Custom i18n implementation supporting 8 languages (EN, AR, FR, DE, ES, RU, PL, CS), with RTL support for Arabic. Translations are centrally stored.
- **Brand Design:** Dark navy (`hsl(215 45% 15%)`) and gold/sand (`hsl(38 45% 75%)`) theme, using Cormorant Garamond for headings and Montserrat for body text, conveying a luxury tone.
- **Key Pages:** Home, Hotels, About, Careers, Contact, Gallery, Blog, and CMS (`/controlpanal`).
- **SEO:** Dynamic `sitemap.xml`, server-side `robots.txt`, reusable `SEOHead` component for meta tags and structured data (Organization, Hotel, BlogPosting, etc.). Supports hreflang tags for internationalization and includes security headers.
- **CMS:** Built-in admin panel at `/controlpanal` for managing pages, hotels, media, SEO, and global settings. Features include multilingual content editing, inline editing, theme customization, and role-based access control (Super Admin, Content Manager, Editor, Viewer).
- **CMS AI Assistant:** Integrated AI assistant (floating bubble/full-page) on all CMS pages, powered by GPT-4o with vision and function calling for content writing, translation, direct CMS editing (hotels, pages, blog, settings, SEO), and usage guidance. Supports image uploads for vision capabilities.
- **Booking Assistant Chatbot:** Public-facing floating chat widget on all public pages, powered by GPT-4o-mini for luxury concierge service, supporting English/Arabic with RTL, lead detection, and guidance towards booking.

### Backend
- **Runtime:** Node.js with Express and TypeScript
- **API Pattern:** RESTful JSON API (`/api/`)
- **Session Management:** `express-session` with `connect-pg-simple` (PostgreSQL-backed)
- **Authentication:** Custom session-based authentication with `bcryptjs` for password hashing.
- **File Uploads:** Multer for disk storage (`uploads/`), with a 10MB limit.
- **Build System:** `tsx` for development, `esbuild` for production.

### Database
- **Type:** PostgreSQL (`DATABASE_URL` environment variable)
- **ORM:** Drizzle ORM with `drizzle-zod` for validation.
- **Schema:** Defined in `shared/schema.ts`.
- **Tables:** `users`, `pages`, `hotels` (with JSONB for multilingual content, themes, tab configs), `media`, `blogPosts`, `globalSettings`, `seoSettings`, `chatbot_config`, `chatbot_faq`, `chatbot_offers`, `chatbot_conversations`, `contact_submissions`.

### Shared Code
- `shared/schema.ts` for database schema and Zod validation.
- Path aliases: `@/`, `@shared/`, `@assets/`.

## External Dependencies

### Database
- **PostgreSQL**: Primary database.
- **connect-pg-simple**: For PostgreSQL-backed session storage.

### Email Services
- **EmailJS (`@emailjs/browser`)**: Used for client-side email sending for the careers application form.

### Key NPM Packages
- **drizzle-orm**, **drizzle-kit**: ORM and schema management.
- **express**, **express-session**: HTTP server and session management.
- **bcryptjs**: Password hashing.
- **multer**: File upload handling.
- **sharp**: Auto image optimization (WebP conversion, resizing on upload).
- **express-rate-limit**: API rate limiting (100/min global, 10/min chatbot, 5/15min auth).
- **framer-motion**: Page animations.
- **wouter**: Client-side routing.
- **@tanstack/react-query**: Data fetching and caching.
- **zod**: Runtime validation.
- **date-fns**: Date formatting.

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string.
- `VITE_EMAILJS_PUBLIC_KEY`: EmailJS public key.
- `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`: For OpenAI integrations (auto-configured by Replit).

### Replit-Specific
- `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`: Development tooling.
- Custom `vite-plugin-meta-images.ts`: For updating OG image meta tags with Replit deployment URLs.