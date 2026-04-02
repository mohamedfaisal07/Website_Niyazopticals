# Niyaz Opticals – Setup Guide

## 1. Supabase Setup

### Create Account
1. Go to https://supabase.com → Sign Up (free)
2. Create a new project

### Get Your Keys
- Go to **Settings → API**
- Copy `Project URL` → paste as `SUPABASE_URL` in index.html
- Copy `anon/public` key → paste as `SUPABASE_ANON_KEY` in index.html

### Create Tables (run in SQL Editor)

```sql
-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT,
  amount INTEGER,
  customer_name TEXT,
  customer_phone TEXT,
  delivery_address TEXT,
  status TEXT DEFAULT 'pending_payment',
  razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts table
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  phone TEXT,
  interest TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anon (frontend)
CREATE POLICY "Allow insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert contacts" ON contacts FOR INSERT WITH CHECK (true);
```

---

## 2. Razorpay Setup

1. Go to https://razorpay.com → Sign Up (free test mode)
2. Dashboard → **Settings → API Keys**
3. Copy `Key ID` → paste as `RAZORPAY_KEY_ID` in index.html
4. For production, activate your account and verify KYC

---

## 3. Replace Keys in index.html

Find these 3 lines near the top of the `<script>` tag:

```js
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const RAZORPAY_KEY_ID = 'YOUR_RAZORPAY_KEY_ID';
```

Replace with your actual keys.

---

## 4. Deploy (Free Hosting Options)

### Netlify (Recommended, Free)
1. Go to https://netlify.com
2. Drag & drop the `index.html` file
3. Your site goes live instantly with a URL

### Vercel
1. Go to https://vercel.com
2. Deploy as static HTML

---

## 5. Custom Domain (Optional)
- Buy domain at GoDaddy / Namecheap (e.g., niyazopticals.in)
- Connect to Netlify: Site Settings → Domain Management

---

## 6. View Orders (Supabase Dashboard)
- Login to Supabase → Table Editor → `orders`
- All orders and contact form submissions appear here

---

## Contact Numbers Configured
- Primary: 9443617786
- Secondary: 9443537786
- WhatsApp: +91 9443617786
