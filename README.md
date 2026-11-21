# AURA Atelier & Goods — Luxury E-Commerce Storefront & Admin

Production-ready, white-label luxury e-commerce platform with live factory inventory synchronization and encrypted checkout.

---

## 📂 Project Architecture & Folder Structure

```
├── public/
│   ├── .htaccess             # Apache SPA rewrite + /api/ routing
│   ├── api/
│   │   ├── index.php         # Hostinger PHP API (handles /api/cj-*)
│   │   ├── test.php          # Live Diagnostic tool (check https://domain.com/api/test.php)
│   │   └── .htaccess         # API subdirectory rewrite
├── src/
│   ├── config/
│   │   ├── constants.js      # Brand details, pricing formulas, passwords
│   │   └── api.js            # API endpoints & environment configurations
│   ├── services/
│   │   ├── api.js            # Dual-layer unified API (Hostinger PHP + Direct Browser)
│   │   ├── cjApi.js          # Direct browser API client (CORS verified)
│   │   └── couponService.js  # LocalStorage coupon engine
│   ├── context/
│   │   ├── CartContext.jsx      # Shopping cart & order storage (No dummy data)
│   │   └── AdminAuthContext.jsx # Admin route protection (Password: admin123)
│   ├── components/
│   │   ├── admin/
│   │   │   └── AdminLayout.jsx  # Admin portal sidebar & header
│   │   ├── Navbar.jsx           # Customer storefront luxury navbar
│   │   ├── Footer.jsx           # Luxury footer (white-label)
│   │   ├── ProductCard.jsx      # Shopify-inspired cards with quick-add
│   │   ├── HeroBanner.jsx       # Editorial hero section
│   │   ├── CategoryPills.jsx    # Category filter pills
│   │   ├── ReviewCard.jsx       # Verified client reviews
│   │   ├── RelatedProducts.jsx  # Dynamic complementary products
│   │   └── WhopCheckoutEmbed.jsx# Encrypted card & wallet checkout
│   ├── pages/
│   │   ├── store/               # Customer Storefront Pages
│   │   │   ├── Home.jsx         # Homepage with dynamic catalog
│   │   │   ├── ProductPage.jsx  # Product detail, live stock, variants
│   │   │   ├── Cart.jsx         # Cart items & coupon validator
│   │   │   ├── Checkout.jsx     # Clean address form & payment gateway
│   │   │   ├── Contact.jsx      # Concierge contact page
│   │   │   └── PrivacyPolicy.jsx# Privacy policy & terms
│   │   └── admin/               # Admin Portal Pages (Password: admin123)
│   │       ├── AdminLogin.jsx   # Admin authentication
│   │       ├── AdminDashboard.jsx# Metrics (orders, revenue, low stock)
│   │       ├── AdminOrders.jsx  # Order table with "Dispatch" button
│   │       ├── AdminProducts.jsx# Live sourcing & catalog search
│   │       └── AdminCoupons.jsx # Coupon manager
│   ├── App.jsx                  # Main router setup
│   ├── main.jsx                 # React root mount with providers
│   └── index.css                # Tailwind CSS styles
├── dist/                        # Production build output (Ready to upload to Hostinger)
├── .env                         # API keys & config
├── package.json
└── vite.config.js
```

---

## 🚀 How to Deploy to Hostinger

### Step 1: Build the Project
Run this command in your project terminal:
```bash
npm run build
```
This generates the optimized `dist/` directory.

### Step 2: Upload to Hostinger File Manager
1. Log in to your **Hostinger hPanel**.
2. Go to **Websites** -> Select your website -> **File Manager**.
3. Open the **`public_html`** directory.
4. Upload all the contents **inside** the `dist/` folder into `public_html/`:
   ```
   public_html/
     ├── .htaccess            <-- MUST BE PRESENT (Controls SPA & API routing)
     ├── index.html
     ├── assets/
     └── api/
         ├── index.php        <-- Handles API calls
         ├── test.php         <-- Diagnostic check
         └── .htaccess
   ```

### Step 3: Test the Live Connection
Open your browser and visit:
```
https://yourdomain.com/api/test.php
```
You should see:
```json
{
  "status": "ONLINE_AND_CONNECTED",
  "cj_authenticated": true,
  "cj_sample_products_retrieved": 5,
  "message": "CJ API is completely active and returning products from Hostinger!"
}
```

---

## 🔐 Admin Panel Access

- **URL**: `https://yourdomain.com/admin` (or `/admin/login`)
- **Default Password**: `admin123`
- From the admin panel you can:
  - Search & source live warehouse products by keyword (e.g., watch, leather, lamp, sunglasses).
  - Dispatch customer orders directly with one click.
  - Create and manage discount coupon codes.
