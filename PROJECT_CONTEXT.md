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

### lib/
Contains:
- supabaseClient.js
- helper functions
- utilities

### context/
Contains React Context providers such as:
- CartContext
- WishlistContext
- RecentlyViewedContext

---

# CURRENT FEATURES

## Store Features
- Responsive homepage
- Shop page with filtering
- Product detail pages
- Search functionality
- Category filtering
- Wishlist system
- Recently viewed products
- Image zoom
- Product gallery support

## Cart & Checkout
- Cart drawer
- Add to cart
- Quantity adjustment
- Cart item count badge
- Toast notifications
- WhatsApp checkout flow
- Checkout autofill from user profile

## Authentication
- Supabase authentication
- Google login integration
- Email/password signup
- Customer dashboard

## Admin Dashboard
- Product upload
- Edit/delete products
- Gallery management
- Inquiry management
- Analytics dashboard

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

Products support:
- multiple images
- galleries
- pricing
- categories

Profiles support:
- delivery address
- customer information

---

# KNOWN ISSUES / WATCHLIST

## Areas to be careful with
- CheckoutForm
- MiniCartDrawer
- WhatsApp checkout flow
- Supabase auth redirects
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
- Delivery fee calculator
- Order tracking
- Saved addresses
- Instagram feed integration
- Customer order history
- Payment gateway integration
- SEO optimization
- Performance optimization

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
