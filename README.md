# AURA Atelier & Goods

React storefront with a portable PHP API. The deployed site uses same-origin `/api/*` routes; CJ credentials stay on the PHP host and are never placed in the browser bundle. No Netlify or Node server is required to deploy.

## Requirements

- PHP 8.0 or newer
- PHP cURL enabled
- Apache/LiteSpeed with `mod_rewrite` / compatible rewrite support
- PHP process can write one JSON settings file in the site root

## Deploy to Hostinger or another PHP host

1. Set `VITE_WHOP_PLAN_ID` in `.env` to the Whop checkout URL, then run `npm install` and `npm run build`.
2. Upload the **contents of `dist/`** into the hosting document root, such as `public_html/`. Keep both `.htaccess` files and the `api/` directory.
3. Copy `api/config.example.php` to `api/config.php`. Put your CJ API key and a new, unique admin password in `config.php`. Set `cj_start_country_code` to the CJ warehouse origin for your products (the sample is `CN`). The file is ignored by Git and is not included in the build. The same credentials can be supplied as `CJ_API_KEY` and `ADMIN_PASSWORD` PHP environment variables.
4. Confirm PHP can create and update `.aura-store-data.json` in the document root. The root `.htaccess` blocks public requests to this private data file.
5. Open `/api/test.php` to check the CJ connection, then sign in at `/admin/login` with the password configured in step 3.

The same output can be hosted on any PHP 8+ Apache/LiteSpeed provider with cURL, rewrite rules, and writable site-root storage. The store uses plain PHP and JSON storage, so it needs no Composer packages or platform-specific function runtime.

## Local development

Copy `public/api/config.example.php` to `public/api/config.php` and fill in local credentials. Start PHP and Vite in separate terminals:

```bash
php -S 127.0.0.1:8000 -t public public/router.php
npm run dev
```

Vite forwards `/api/*` requests to the local PHP server. To produce the deployable site, run `npm run build` and upload the resulting `dist/` contents.

## API routes

- `GET /api/cj-products` — live CJ product search (`pageNum`, `pageSize`, `search`, `category`)
- `GET /api/cj-products?id=...` — live CJ product detail and variants
- `POST /api/cj-order` — admin-only: quote CJ freight and create a CJ order after payment verification
- `POST /api/admin-auth` — verify the server-side admin password
- `GET /api/store-settings` — read public store settings
- `POST /api/store-settings` — update storewide shipping fee (requires `X-Admin-Password`)
- `/api/coupons` — shared coupon management (admin password required)
- `POST /api/coupon-validate` — validate customer coupon against product subtotal
- `/api/orders` — save customer orders and manage payment/fulfillment status
- `GET /api/test.php` — CJ connectivity diagnostic

Shipping fees, coupons, and customer orders are stored server-side in a private JSON file. Cart contents stay in the customer's browser.
