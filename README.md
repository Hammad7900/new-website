# AURA | Luxury Dropshipping Store with CJ Dropshipping & Whop Checkout

A production-ready, Shopify-inspired e-commerce dropshipping application engineered with React (Vite), Tailwind CSS, Whop Checkout, and Netlify Serverless Functions connecting directly to the **CJ Dropshipping API 2.0**.

---

## 🌟 Highlights & Architecture

- **Shopify-Inspired Luxury Design**: Editorial typography (Playfair Display + Plus Jakarta Sans), sleek dark hero with ambient gradients, horizontal category filters, and curated product showcases.
- **Direct CJ Dropshipping API Integration**:
  - `netlify/functions/cj-auth.js`: Automated access token retrieval and in-memory caching from `https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken`.
  - `netlify/functions/cj-products.js`: Live product listing (`/product/listV2`) and real-time inventory query (`/product/stock/queryByPid`) with response normalization. Includes a curated luxury catalog fallback for offline preview.
  - `netlify/functions/cj-order.js`: Direct CJ order creation (`/shopping/order/createOrderV2`) triggered on-demand with `payType=2` (balance payment) or `payType=3` (create only).
- **Payment Gateway**: Whop Checkout (`WhopCheckoutEmbed` using `VITE_WHOP_PLAN_ID`), featuring credit/debit card authorization and biometric Apple Pay/Google Pay wallet support.
- **Admin Management Panel (`/admin`)**:
  - Password protected with **`admin123`**.
  - **Overview Dashboard**: Real-time metrics for Total Orders, Revenue, Pending Dispatches, and Low Stock.
  - **Orders Management**: Order history with details inspection and direct **"Place on CJ"** execution.
  - **Products Management**: Table showing live CJ products with **"Sync/Refresh Products"** button.
  - **Discount Coupons (Koia SDK engine)**: Create percentage or fixed discount promo codes (e.g., `SAVE10`, `WELCOME20`) validated in client cart.

---

## 📂 Project Structure

```
├── netlify/
│   └── functions/
│       ├── cj-auth.js         # Token retrieval & memory cache
│       ├── cj-products.js     # Live CJ catalog & real-time inventory
│       └── cj-order.js        # Dispatches orders to CJ Dropshipping
├── src/
│   ├── components/
│   │   ├── Navbar.jsx             # Luxury announcement bar & responsive navigation
│   │   ├── Footer.jsx             # Trust badges, newsletter, client concierge
│   │   ├── ProductCard.jsx        # Shopify-style cards with quick-add & badges
│   │   ├── HeroBanner.jsx         # Editorial high-converting hero
│   │   ├── CategoryPills.jsx      # Horizontal category filter pills
│   │   ├── ReviewCard.jsx         # Verified customer reviews
│   │   ├── RelatedProducts.jsx    # Category-based related recommendations
│   │   ├── WhopCheckoutEmbed.jsx  # Whop Checkout integration
│   │   └── AdminLayout.jsx        # Admin sidebar layout & status indicators
│   ├── context/
│   │   ├── CartContext.jsx        # Cart state, discount calculations, order storage
│   │   └── AdminAuthContext.jsx   # Admin protection (password: admin123)
│   ├── pages/
│   │   ├── Home.jsx               # Hero, category pills, products grid, reviews
│   │   ├── ProductPage.jsx        # Gallery, variants, live CJ stock, Add to Cart
│   │   ├── Cart.jsx               # Quantities, coupon code discount validator
│   │   ├── Checkout.jsx           # Customer dispatch details & Whop payment
│   │   ├── AdminLogin.jsx         # Password entry
│   │   ├── AdminDashboard.jsx     # Summary cards & metrics
│   │   ├── AdminOrders.jsx        # Order list with "Place on CJ" button
│   │   ├── AdminProducts.jsx      # Products table with "Sync/Refresh" button
│   │   ├── AdminCoupons.jsx       # Coupon creation & management
│   │   ├── Contact.jsx            # Concierge inquiry form & office addresses
│   │   └── PrivacyPolicy.jsx      # E-commerce, CJ Dropshipping & Whop privacy terms
│   ├── services/
│   │   ├── api.js                 # API abstraction for Netlify functions
│   │   └── couponService.js       # Koia SDK inspired coupon calculation engine
│   ├── App.jsx                    # Route mapping
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Tailwind styles & luxury gradients
├── netlify.toml                   # Netlify build, publish, functions & redirects
├── vite.config.js                 # Vite bundler configuration
└── tailwind.config.js             # Luxury color palette & typography
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
# CJ Dropshipping API Key (From https://cjdropshipping.com -> API Settings)
CJ_API_KEY=your_cj_api_key_here

# Whop Checkout Plan ID (From https://whop.com -> Products -> Plan)
VITE_WHOP_PLAN_ID=plan_sample_whop_id
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🔐 Admin Panel Access

- **URL**: `/admin` (or `/admin/login`)
- **Default Password**: `admin123`

### Key Admin Actions:
1. **Place on CJ**: Navigate to `/admin/orders`, locate any order in "Paid (Pending CJ)" state, and click **"Place on CJ"**. This invokes `netlify/functions/cj-order.js` to dispatch order details, address, and SKUs to CJ Dropshipping and stores the returned CJ Order ID.
2. **Sync / Refresh Products**: Navigate to `/admin/products` and click **"Sync / Refresh Products"** to re-query the CJ API and update live stock counts.
3. **Manage Coupons**: Navigate to `/admin/coupons` to add custom codes (e.g., `SUMMER20`) with custom discount percentages or fixed amounts.

---

## 🌐 Netlify Deployment

The project includes `netlify.toml` preconfigured for Netlify Functions and SPA redirects:

1. Connect your repository to Netlify.
2. In **Site Settings > Environment Variables**, add:
   - `CJ_API_KEY`: Your CJ Dropshipping API key.
   - `VITE_WHOP_PLAN_ID`: Your Whop Checkout Plan ID.
3. Deploy! Netlify will automatically build the React app and deploy the serverless functions in `netlify/functions/`.
