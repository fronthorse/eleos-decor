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
- Final production domain: https://eleosdecor.com
- Domain was purchased from WhoGoHost
- Domain is connected to Vercel
- DNS is configured for Vercel
- Primary domain: eleosdecor.com
- Canonical production URL: https://eleosdecor.com
- NEXT_PUBLIC_SITE_URL is set to https://eleosdecor.com
- Google OAuth works on the production domain

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
- seo.js for production domain constants, shared SEO descriptions, OG image fallback, product image/price helpers, and schema availability helpers
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

## Production Domain
- Final production domain is https://eleosdecor.com
- Domain was purchased from WhoGoHost and connected to Vercel
- DNS is configured for Vercel production hosting
- Google OAuth works on the production domain
- NEXT_PUBLIC_SITE_URL is set to https://eleosdecor.com
- Treat https://eleosdecor.com as the canonical public URL for metadata, sitemap, robots, auth redirects, and future integrations

## Branding
- Eleos Decor logo has been cleaned/rebuilt for future brand use
- Logo assets are intended for Google OAuth branding, favicon, Open Graph image, social profiles, email branding, and general brand presentation
- Default social sharing fallback image is public/eleos-og-image.png, with SVG source at public/eleos-og-image.svg
- Navbar uses the dedicated transparent logo asset public/eleos-logo-nav.svg so the header stays visually clean
- Website branding should remain premium, warm, elegant, minimal, and welcoming

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
- Public Return & Exchange Policy page exists at /return-policy and is linked from the footer

## Production SEO
- SEO is implemented for the live domain https://eleosdecor.com using Next.js App Router metadata APIs
- app/layout.js defines global metadataBase set to https://eleosdecor.com, title template, default description, keyword defaults, Open Graph defaults, Twitter/X card defaults, and index/follow defaults
- Public page metadata/canonicals exist for homepage, shop, about, contact, and return-policy
- Return & Exchange Policy page is public and indexable at https://eleosdecor.com/return-policy for customer trust and future Google Merchant structured data references
- Product detail pages generate dynamic metadata from Supabase products using products.title, description, image_url/gallery fallback, price, and availability
- Product detail pages include product canonical URLs and product Open Graph images
- Product detail pages include Product JSON-LD with name, description, image, brand Eleos Decor, offer priceCurrency NGN, price when available, availability, canonical URL, and merchant offer details
- Product offer JSON-LD includes shippingDetails for Nigeria with realistic broad delivery estimates: 1-3 day handling time and 2-7 day transit time; do not promise same-day delivery in schema unless operations change
- Product offer JSON-LD includes hasMerchantReturnPolicy for Nigeria with a 7-day finite return window, ReturnByMail method, ReturnFeesCustomerResponsibility, and merchantReturnLink pointing to https://eleosdecor.com/return-policy
- Product detail JSON-LD conditionally includes aggregateRating and review only when real Supabase review data exists for that product
- Product aggregateRating is calculated from real reviews.rating values; reviewCount is the count of valid real ratings
- Product review schema uses real reviews.customer_name, reviews.rating, reviews.comment, and reviews.created_at, limits embedded reviews to avoid bloated JSON-LD, and never fabricates fake ratings or placeholder reviews
- Products without reviews must omit aggregateRating and review entirely
- Product prices may be stored as formatted strings such as "500,000"; SEO helpers normalize them for metadata/schema without changing UI display
- app/sitemap.js generates sitemap.xml with homepage, shop, about, contact, return-policy, category query URLs from product categories, and product detail URLs from Supabase
- Sitemap generation uses public Supabase anon access and products fields id, category, and created_at; products.updated_at is not currently part of the table
- app/robots.js generates a simplified robots.txt with Allow: /, private-route Disallow rules, and Sitemap: https://eleosdecor.com/sitemap.xml
- robots.txt intentionally does not include a Host directive because Google does not use it
- Admin, auth, customer, and cart route layouts set robots noindex/nofollow to keep private or account-specific pages out of search results
- Default social sharing fallback image is public/eleos-og-image.png, with SVG source at public/eleos-og-image.svg
- Navbar uses the dedicated transparent logo asset public/eleos-logo-nav.svg so the header stays visually clean
- SEO infrastructure is complete; Google indexing is in progress

## SEO Files
- lib/seo.js stores production SEO constants and shared helpers, including Product review/aggregateRating JSON-LD helpers and merchant offer schema helpers for shipping and returns
- app/layout.js defines global metadata and social preview defaults
- app/return-policy/page.js defines the public Return & Exchange Policy page with SEO metadata and canonical URL
- app/product/[id]/page.js defines dynamic product metadata and Product JSON-LD
- app/sitemap.js generates sitemap.xml with static, category, and product routes
- app/robots.js generates production robots.txt
- public/eleos-og-image.png is the default Open Graph/Twitter image fallback
- public/eleos-og-image.svg is the editable source for the default social sharing image

## robots.txt Current State
Production robots.txt should stay clean and minimal:

```txt
User-agent: *
Allow: /

Disallow: /admin/
Disallow: /auth/
Disallow: /customer/
Disallow: /cart/
Disallow: /api/

Sitemap: https://eleosdecor.com/sitemap.xml
```

- Host directive was removed because it is unnecessary for Google
- Redundant Allow directives were removed because Allow: / already covers public routes such as /shop, /about, /contact, and /product/

## Sitemap / Google Search Console
- Google Search Console property has been set up for eleosdecor.com
- Sitemap was submitted successfully
- Google discovered 48 URLs from the sitemap at the time of setup
- Sitemap includes homepage, shop, about, contact, return-policy, category URLs, and product detail URLs
- Homepage and key pages may initially show "URL is not on Google" because indexing can take time for a new domain
- Request Indexing should be used for homepage, shop, and important product pages

## Current SEO Status
- SEO infrastructure is complete
- Google indexing is now in progress
- Next steps are monitoring Search Console, requesting indexing for key pages, and improving product SEO content over time

## Performance / Scaling
- Shop page has been optimized for Supabase-side pagination, filtering, full-text search, and sorting
- Database performance indexes are in place for product/category/date/price/search workflows
- Product full-text search RPC/search_vector is in place
- Product thumbnails and Supabase image transformations are improved for product cards and previews
- Product detail/gallery images use Next Image optimization and lazy-loaded thumbnails
- Admin analytics RPC exists through get_admin_analytics, with app-level fallback count queries
- robots/sitemap build passes with Next.js App Router

## AI Decor Assistant
- Floating support widgets are rendered from app/layout.js through app/components/FloatingSupportWidgets.js
- AI Decor Assistant and the floating WhatsApp button are visible only on public shopping/informational routes: /, /shop, /product/*, /about, and /contact
- AI Decor Assistant and the floating WhatsApp button are hidden on admin, auth, customer, cart, checkout-sensitive, and other non-public routes through the route allowlist
- Existing WhatsApp floating button remains separate for direct human support
- WhatsApp floating button must remain separate and fixed; do not remove it
- AI Decor Assistant floating button is draggable, minimizable/collapsible, and uses a subtle first-visit tooltip
- AI Decor Assistant draggable position is stored in localStorage under eleos_ai_assistant_position and should remain stable across open/close, refresh, and navigation
- The draggable position should only be clamped when it exceeds viewport boundaries; opening or closing the chat should not recalculate/reset the saved button position
- The expanded chat panel is positioned relative to the minimized button so closing the panel returns the button to the same dragged position
- Frontend-only recommendation logic for now; no OpenAI backend connected yet
- AI Decor Assistant is product-aware and searches Supabase products
- Detects decor spaces such as living room, dining area, TV console, bedroom, office, entryway, hallway, kitchen, apartment, and home
- Detects budget formats such as 500k, 1m, 1,000,000 naira, and ₦250,000
- Detects style preferences such as luxury, modern, minimal, cozy, classy, warm, simple, and elegant
- Tracks richer guided-consultation preferences such as color palette, room size, and apartment/home/office context
- Generates decor category recommendations and budget allocation guidance
- Has guided decor consultation flow
- Reuses conversation context and handles customer preference changes mid-chat
- Supports product availability questions by searching Supabase products
- Product search uses title, category, and description through products.search_vector/full-text RPC with fallback search logic
- Category-specific product requests must pass a hard relevance gate before rendering product cards
- Hard category filtering is implemented in lib/productSearch.js through filterProductsByDetectedCategory/filterProductsByCategoryRelevance
- Strict category filters currently apply to dining sets, rugs, mirrors, frames, wall clocks, flowers, lamps/decorative lights, diffusers, and humidifiers
- Dining set queries must never render unrelated products such as blankets, pillows, rugs, frames, flowers, mirrors, wall clocks, diffusers, humidifiers, ornaments, or general decor accessories
- Dining set matching allows dining/dinning typo variants and dining set/table/chair/room language
- Do not fill category result lists with generic fallback products; show only relevant products, even if the result count is low
- If no exact dining set products remain after filtering, the assistant should say: "We don’t seem to have dining sets available right now, but I can help you explore dining-area decor or connect you on WhatsApp."
- Product result messages render each product with title, price, and an immediate View Product button before global Shop/WhatsApp CTAs
- Product result buttons appear directly under each product
- Includes quick actions, typed messages, loading state, and Clear chat
- Current quick action chips should remain: Browse products, Help me choose decor, Delivery information, How to order, Chat on WhatsApp
- Assistant tone should stay confident, premium, concise, and helpful; avoid weak/apologetic language such as "I'm still learning"
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
- Checkout is WhatsApp-assisted commerce, not an automatic payment-complete flow
- After a checkout inquiry is saved and WhatsApp is triggered, customers see an Order Request Sent confirmation explaining that Eleos Decor will confirm availability, delivery, and final order details on WhatsApp
- Checkout now has an Order Request Sent assisted-commerce experience
- Order Request Sent includes Continue on WhatsApp, Return to Shop, and View My Orders for logged-in customers
- Duplicate checkout submissions are prevented after a successful order request
- Customer dashboard includes order tracking

## Authentication
- Supabase authentication
- Google login integration
- Email/password signup
- Customer dashboard
- Customer dashboard includes My Orders tracking for the signed-in user's checkout inquiries
- My Orders displays order ID, created date, status, order summary, total amount, status badge, status description, and lightweight progress tracking
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
- Orders remain canonical in the database while the admin UI shows readable WhatsApp-assisted workflow labels and descriptions
- Admins manually move order requests through new, contacted, payment_pending, paid, processing, delivered, and cancelled as the WhatsApp conversation/payment/delivery progresses
- Admin can update canonical statuses: new, contacted, payment_pending, paid, processing, delivered, and cancelled

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

Reviews support:
- reviews are linked to products through product_id
- reviews include customer_name, rating, comment, and created_at
- product page UI loads reviews client-side, while product JSON-LD fetches reviews server-side for structured data
- only real reviews should be used for visible reviews, aggregateRating, and review schema; never add fake SEO review data

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
- AI assistant draggable position must not jump after open/close; preserve the saved minimized-button coordinates and clamp only for viewport boundaries
- AIDecorAssistant persistence and smart recommendation logic
- ai_chat_sessions RLS, user-scoped persistence, and auth-change handling
- Product search helper should continue using actual products table fields
- Category-specific assistant product cards must use the hard relevance gate in lib/productSearch.js before rendering; never pad strict category requests with unrelated fallback products
- Dining set queries are especially sensitive: never show blankets, pillows, rugs, frames, flowers, mirrors, wall clocks, diffusers, humidifiers, ornaments, or generic accessories as dining set results
- Shop page should not fetch all products; keep filtering/search/sort/pagination in Supabase queries
- Full-text search RPC must preserve RLS/security invoker behavior and must not use service role keys on the client
- Product detail main image should stay priority optimized; gallery thumbnails should remain lazy loaded
- Supabase storage image URLs are configured in next.config.mjs remotePatterns
- next.config.mjs also allows Supabase transformed image URLs under /storage/v1/render/image/public/**
- SEO sitemap queries should avoid products.updated_at unless that column is added to Supabase
- Keep robots.txt minimal: Allow: /, private route disallows with trailing slashes, and the production sitemap URL
- Keep public canonicals pointed at https://eleosdecor.com paths through metadataBase
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
- Delivery fee/location system
- Security/stability audit
- Email notifications
- Homepage trust/brand sections
- Future OpenAI integration only after cost/planning decision
- OpenAI-powered chatbot backend at app/api/chatbot/route.js if approved later
- AI assistant product-aware recommendations with deeper inventory context if backend AI is approved later
- Real thumbnail uploads with thumbnail_url column instead of relying only on Supabase runtime transforms
- Saved addresses
- Instagram feed integration
- Payment gateway integration
- Advanced SEO enhancements such as richer category pages and dynamic OG images
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
