# Bolivia Fitness CRM: what the industry offers and what we built

URL: `/crm` (for example https://bolivia-fitness.vercel.app/crm/). Demo PIN for every user: **1234**.

## 1. What leading supplement-retail and gym systems include

Sources reviewed: Lightspeed Retail (supplement-store POS), Square for Retail, Clover, NCR Counterpoint (health-food stores),
Mindbody, ABC Glofox and ABC Fitness (gym chains), plus 2026 comparison guides.

| Area | Typical features in the market |
|---|---|
| Point of sale | Fast checkout, barcode/search, discounts, split payments, receipts, offline mode |
| Multi-location | One central catalog, stock per store, store-to-store transfers, consolidated reporting |
| Inventory | Real-time stock, reorder points, cycle counts, **expiry/batch tracking (perishable supplements)**, purchase orders |
| Customers / CRM | Customer profiles, purchase history, tags, notes, segments, lifetime value |
| Loyalty | Points, tiers, rewards, birthday offers, gift cards |
| Marketing | Segment-based campaigns (SMS/email/WhatsApp), coupons, re-engagement of lapsed customers |
| Sales pipeline | Leads from social/web/chat tracked to a sale |
| Staff | Roles and permissions, schedules/shifts, commissions, sales targets, performance |
| Analytics | Sales by day/hour/store/product/category/staff/channel/payment, period comparison, margin, export |
| Gyms (Mindbody/Glofox) | Memberships, class booking, check-ins, retail add-on: *not core for Bolivia Fitness, which is a supplement retailer* |

## 2. What the Bolivia Fitness CRM has

| Module | Features |
|---|---|
| **Dashboard** | Sales, tickets, average ticket, estimated gross margin, club customers with comparison to the previous period; sales-by-day chart; store ranking; best sellers; categories; sales by hour; payment methods; channels; alerts (low stock, expiring, overdue tasks, leads due, refills due); refill list with WhatsApp; activity feed |
| **Point of sale** | Product grid with live stock per store, search and categories; customer lookup or quick-create; discount; channel; Black Friday gift; points redemption; QR/cash/card/transfer; receipt sent by WhatsApp; stock deducted automatically |
| **Sales** | Filterable, paginated history; detail view; voiding (managers and up) returns stock and points; CSV export |
| **Customers (Club León)** | Segments (VIP, regular, new, at risk, no purchases); tiers (Bronze, Silver, Gold, Lion); points; lifetime value; **refill prediction** (1 serving a day); favorites; notes; tags; WhatsApp consent; CSV export |
| **Leads** | Kanban board (new → contacted → quoted → won/lost) with drag and drop, follow-up dates, owner and source (WhatsApp, LeonIA, Instagram, TikTok…); a won lead becomes a customer automatically |
| **Inventory** | Stock, minimums, status and **expiry of the earliest batch** per store; goods-in, shrinkage and physical counts; cross-store matrix of products with alerts; value at cost; CSV |
| **Transfers** | Move stock between stores with a stock check; confirm receipt at the destination |
| **Stores** | 11 stores (4 in Santa Cruz, 2 in Cochabamba); open/closed now; monthly target vs actual; store page with charts, team and best sellers; edit hours, address and target |
| **Staff** | Roles (owner, admin, store manager, salesperson, coach, warehouse), PIN, commission %, sales and estimated commission, individual page |
| **Shifts** | Weekly schedule per store, editable per cell, coverage per day |
| **Campaigns** | Discounts, coupons, bonus points, gifts with dates and segment; **WhatsApp broadcast** to segments (one-tap chats with a personalized message + CSV for WhatsApp Business) |
| **Tasks** | Overdue, today, upcoming, done; priority; owner; "only mine" |
| **Reports** | By store, product (with margin), salesperson (commission), category, payment and channel; comparison with the previous period; CSV |
| **Settings** | JSON backup and restore, regenerate demo data, editable product costs, loyalty rules, activity log |

Also included: Spanish/English, light/dark mode (shared with the online store), role-based permissions, global search (`/`), responsive layout.

## 3. Important limitation (demo) and next step

Data is stored **only in the browser** (localStorage), and the PIN check runs in the browser, so it is **not real security**.
Everything is fictional demo data. To use it for real with the whole team, the next step is:

1. A cloud database (for example Supabase/Postgres) with tables for stores, staff, customers, sales, inventory, leads, tasks and campaigns.
2. Real sign-in (email or phone) and access rules per role and store, enforced on the server.
3. Load the real catalog, stock and customer list, and connect online-store orders and LeonIA orders to the CRM automatically.
