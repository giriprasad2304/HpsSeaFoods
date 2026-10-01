# HpsSeaFoods

Fish Business Management System — A complete web application for managing purchases, sales, packing costs, inventory, expenses, profit/loss calculations, invoices, and financial reports.

## Features

- **Dashboard**: Overview metrics, revenue trends, inventory levels, and outstanding balances.
- **Purchases & Supplier Management**: Inward fish purchases, transport/ice/labour cost tracking, and invoice uploads.
- **Sales & Customer Management**: Customer orders, pricing, automated balance calculations, and invoice generation.
- **Packing Operations**: Specialized cost tracking per export box/type (ice, oxygen, materials, transport).
- **Inventory & Stock Tracking**: Real-time batch & lot tracking with adjustment capabilities.
- **Expenses Management**: Categorized business expenses with receipt uploads.
- **Financial Reports & Analytics**: Profit & Loss reports, balance sheets, customer ledger, and Excel exports.
- **Role-based Authentication**: Secure authentication powered by Supabase.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database & ORM**: PostgreSQL / Supabase, Prisma ORM
- **Styling**: Tailwind CSS
- **File Storage**: Cloudinary
- **Icons & UI**: Lucide React, Recharts

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup environment variables**:
   Create a `.env` file based on `.env.example` with your Supabase, Prisma, and Cloudinary credentials.

3. **Generate Prisma client**:
   ```bash
   npm run prisma:generate
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.
