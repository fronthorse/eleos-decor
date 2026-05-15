# ELEOS DECOR — PROJECT CONTEXT

## Project Overview
Eleos Decor is a premium Nigerian interior decor e-commerce platform focused on affordable luxury decor items such as:
- Frames
- Artificial plants
- Flowers
- Decorative lights
- Mirrors
- Rugs
- Tables
- Figurines
- Diffusers
- Humidifiers
- Wall clocks
- Decorative accessories

The brand tone should feel:
- Warm
- Elegant
- Minimal
- Premium
- Modern
- Welcoming

Target audience:
- Nigerian homeowners
- Apartment owners
- Office spaces
- Interior decor lovers
- Gift buyers

---

# TECH STACK

## Frontend
- Next.js App Router
- React
- Bootstrap
- AOS animations
- React Icons
- React Hot Toast notifications

## Backend / Services
- Supabase
  - Database
  - Authentication
  - Storage

## Deployment
- Vercel

## Version Control
- GitHub

---

# PROJECT STRUCTURE

## Important Folders

### app/
Contains:
- Homepage
- Shop page
- Product pages
- Auth pages
- Dashboard pages
- Admin pages

### components/
Reusable UI components such as:
- Navbar
- Footer
- Hero
- ProductCard
- FeaturedProducts
- MiniCartDrawer
- CheckoutForm
- Testimonials
- SocialMediaSection
- AIDecorAssistant

### lib/
Contains:
- supabase client helpers under lib/supabase/
- productSearch.js
- productImages.js
- orderStatuses.js
- helper functions
- utilities

### hooks/
Contains reusable client hooks such as:
- useAIDecorChatPersistence

### context/
Contains React Context providers such as:
- CartContext
- WishlistContext
- RecentlyViewedContext

---

# CURRENT FEATURES

## Store Features
- Responsive homepage
- Shop page with Supabase-side pagination, filtering, full-text search, and sorting
- Shop URL params support page, category, search/query, and sort
- Product detail pages
- Product search uses Supabase RPC search_products with products.search_vector and GIN full-text index
- Empty shop searches use normal paginated product fetch; non-empty searches use full-text RPC with ilike fallback
- Category filtering
- Wishlist system
- Recently viewed products
- Image zoom
- Product gallery support
- Product detail/gallery images use Next Image optimization with priority main image, responsive sizes, skeleton loading, and fallback image handling
- Product cards use Next Image and smaller Supabase transformed image URLs for thumbnails when available; product detail images remain high quality

## AI Decor Assistant
- Global floating AI assistant rendered from app/layout.js
- Existing WhatsApp floating button remains separate for direct human support
- Frontend-only recommendation logic for now; no OpenAI backend connected yet
- Detects decor spaces such as living room, dining area, TV console, bedroom, office, entryway, hallway, kitchen, apartment, and home
- Detects budget formats such as 500k, 1m, 1,000,000 naira, and ₦250,000
- Detects style preferences such as luxury, modern, minimal, cozy, classy, warm, simple, and elegant
- Generates decor category recommendations and budget allocation guidance
- Supports product availability questions by searching Supabase products
- Product search uses title, category, and description through products.search_vector/full-text RPC with fallback search logic
- Product result messages render each product with title, price, and an immediate View Product button before global Shop/WhatsApp CTAs
- Includes quick actions, typed messages, loading state, and Clear chat
- Chat history persists during navigation and browser refresh
- Guest persistence uses localStorage scoped to guest
- Logged-in persistence uses user-scoped localStorage plus Supabase table ai_chat_sessions
- AI chat persistence must never share history between users; localStorage keys are scoped by guest/user id and old shared keys are removed

## Cart & Checkout
- Cart drawer
- Add to cart
- Quantity adjustment
- Cart item count badge
- Toast notifications
- WhatsApp checkout flow
- Checkout autofill from user profile
- Checkout inquiries store canonical lowercase status values such as new, payment_pending, paid, processing, delivered, and cancelled

## Authentication
- Supabase authentication
- Google login integration
- Email/password signup
- Customer dashboard
- Admin emails are detected with lib/adminAuth.js and should not be treated as customer sessions in Navbar/customer dashboard
- Admin sessions visiting shop pages should see Admin Dashboard navigation, not customer dashboard navigation

## Admin Dashboard
- Product upload
- Edit/delete products
- Gallery management
- Inquiry management
- Analytics dashboard
- Product upload/edit disables submit controls while saving and shows toast confirmation to prevent duplicate submissions
- Products and orders tabs use pagination instead of loading all records
- Analytics uses get_admin_analytics RPC when available, with fallback count queries

---

# DESIGN RULES

## General UI Style
The website should always feel:
- Clean
- Spacious
- Luxurious
- Minimal
- Modern

Avoid:
- Overcrowded layouts
- Harsh colors
- Excessive animations
- Cheap-looking gradients

Preferred style:
- Soft shadows
- Rounded corners
- Elegant hover effects
- Balanced whitespace

---

# COLOR DIRECTION

Primary feeling:
- Neutral luxury
- Warm tones
- Soft elegant backgrounds

Avoid overly bright colors unless used as accents.

---

# CODING RULES

## Before Making Changes
Always:
1. Check existing components before creating new ones
2. Reuse existing styling patterns
3. Avoid duplicate logic
4. Preserve responsiveness
5. Ensure mobile-first compatibility

## Important
- Do not break existing layouts
- Do not remove current features unless requested
- Ensure builds compile successfully
- Keep components reusable

---

# DATABASE NOTES

## Supabase Tables
Known tables include:
- products
- profiles
- reviews
- wishlist
- inquiries
- ai_chat_sessions

Products support:
- multiple images
- galleries
- pricing
- categories
- generated search_vector for title, category, and description
- full-text product search through public.search_products RPC
- shop pagination with range() and exact count
- shop filtering by category
- shop sorting by created_at and price
- performance indexes for category, created_at, price, and trigram search on title/category/description
- GIN full-text index on search_vector
- products use title as the product name field; there is no products.name usage in the app
- product cards are structured to support a future thumbnail_url/thumbnailImage field

Profiles support:
- delivery address
- customer information
- current profiles table does not have an email column; do not write email to profiles unless the schema is changed first

Checkout inquiries support:
- order_number
- customer_name
- customer_phone
- customer_email
- delivery_address
- items
- total_amount
- order_note
- user_id
- canonical status values only: new, contacted, payment_pending, paid, processing, delivered, cancelled
- display labels should be generated in app code using lib/orderStatuses.js
- existing old statuses can be migrated with supabase/order-status-normalization.sql

AI chat sessions support:
- one active chat session per authenticated user
- messages jsonb
- preferences jsonb
- RLS policies so users can only access their own chat session
- migration SQL exists at supabase/ai-chat-sessions.sql
- performance index on updated_at; user_id is already indexed by the unique one-session-per-user constraint

Performance index SQL:
- supabase/performance-indexes.sql adds safe IF NOT EXISTS indexes for products, reviews, wishlist_items, checkout_inquiries, and ai_chat_sessions
- pg_trgm is enabled for faster ILIKE product searches on title, category, and description
- supabase/product-full-text-search.sql adds products.search_vector, products_search_vector_idx, and search_products RPC
- supabase/admin-analytics.sql adds get_admin_analytics RPC
- supabase/order-status-normalization.sql safely converts legacy status labels to canonical lowercase status values

---

# KNOWN ISSUES / WATCHLIST

## Areas to be careful with
- CheckoutForm
- MiniCartDrawer
- WhatsApp checkout flow
- WhatsApp floating button must not be removed or overlapped by AI assistant
- AIDecorAssistant persistence and smart recommendation logic
- ai_chat_sessions RLS, user-scoped persistence, and auth-change handling
- Product search helper should continue using actual products table fields
- Shop page should not fetch all products; keep filtering/search/sort/pagination in Supabase queries
- Full-text search RPC must preserve RLS/security invoker behavior and must not use service role keys on the client
- Product detail main image should stay priority optimized; gallery thumbnails should remain lazy loaded
- Supabase storage image URLs are configured in next.config.mjs remotePatterns
- next.config.mjs also allows Supabase transformed image URLs under /storage/v1/render/image/public/**
- Supabase auth redirects
- Admin/customer session distinction in Navbar and customer dashboard
- Image optimization
- SSR/client hydration

---

# UX DECISIONS

## Homepage
Homepage should focus on:
- Visual trust
- Premium presentation
- Easy navigation
- Social proof
- Warm branding

## Social Media
Social media links should appear:
- On contact page
- On homepage near footer

Purpose:
- Build trust
- Improve engagement
- Increase social discovery

---

# FUTURE FEATURES

Potential future additions:
- OpenAI-powered chatbot backend at app/api/chatbot/route.js
- AI assistant product-aware recommendations with deeper inventory context
- Real thumbnail uploads with thumbnail_url column instead of relying only on Supabase runtime transforms
- Delivery fee calculator
- Order tracking
- Saved addresses
- Instagram feed integration
- Customer order history
- Payment gateway integration
- SEO optimization
- Performance optimization
- Clean remaining React hook dependency lint warnings
- Replace remaining plain img tags with next/image where practical

---

# IMPORTANT DEVELOPMENT NOTES

When generating code:
- Preserve current project architecture
- Keep components modular
- Maintain premium UI consistency
- Ensure responsive behavior
- Avoid unnecessary dependencies

Before finishing tasks:
- Check imports
- Check responsiveness
- Check for build errors
- Check mobile layout
- Summarize changed files
