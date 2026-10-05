# 🐟 Seafood & Fish Business Management System — User Manual

Welcome to your **Seafood & Fish Business Management System**. This easy-to-follow guide will walk you through everything you need to know to manage your daily fish purchases, sales, packing, stock inventory, expenses, customer/supplier ledgers, and profit & loss reports.

---

## 📑 Table of Contents

1. [Quick Overview & Key Features](#1-quick-overview--key-features)
2. [How to Log In](#2-how-to-log-in)
3. [A Typical Day's Workflow (Recommended Routine)](#3-a-typical-days-workflow-recommended-routine)
4. [Step-by-Step Module Guides](#4-step-by-step-module-guides)
   - [4.1 Dashboard](#41-dashboard)
   - [4.2 Purchases (Harbor / Supplier Inward)](#42-purchases-harbor--supplier-inward)
   - [4.3 Sales & Invoicing (Customer Outward)](#43-sales--invoicing-customer-outward)
   - [4.4 Live Inventory & Stock](#44-live-inventory--stock)
   - [4.5 Packing & Box Processing](#45-packing--box-processing)
   - [4.6 Daily Business Expenses](#46-daily-business-expenses)
   - [4.7 Customers & Credit Management](#47-customers--credit-management)
   - [4.8 Suppliers & Harbor Accounts](#48-suppliers--harbor-accounts)
   - [4.9 Profit & Loss and Reports](#49-profit--loss-and-reports)
   - [4.10 Settings](#410-settings)
5. [Frequently Asked Questions & How-To Guides](#5-frequently-asked-questions--how-to-guides)
6. [Best Practices & Pro Tips](#6-best-practices--pro-tips)

---

## 1. Quick Overview & Key Features

This system is tailor-made for wholesale, export, and retail fish operations. It handles every aspect of your daily business:

- 🚢 **Harbor Purchases**: Record boat landings, weight in KG, ice/transport costs, and supplier bills.
- 📦 **Live Inventory**: Automatically adds purchased fish to stock and deducts sold fish.
- 🧾 **Fast Invoicing & Sales**: Bill wholesale or retail buyers in seconds with automatic tax & discount calculation.
- ❄️ **Thermocol Box & Packing Costs**: Track box counts, ice, oxygen, and labour costs per box or per KG.
- 💵 **Cash, UPI & Credit Tracking**: Know exactly who owes you money and how much you owe suppliers.
- 📈 **Real-Time Profit & Loss**: See your true net profit after deducting fish cost, packing, transport, and daily expenses.

---

## 2. How to Log In

1. Open your web browser (Google Chrome, Safari, or Microsoft Edge).
2. Go to your system URL: `https://your-domain.vercel.app` (or `http://localhost:3000` if running locally).
3. Enter your **Email Address** and **Password**.
4. Click **Sign In**.
5. Once signed in, you will be taken directly to your **Dashboard**.

> 💡 **Tip:** Bookmark the login page on your computer or mobile browser for quick access every morning.

---

## 3. A Typical Day's Workflow (Recommended Routine)

Follow this 5-step daily routine for smooth and error-free record keeping:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. MORNING: Record Purchases (Harbor / Boats / Suppliers)   │
│    ➜ Enter fish varieties, weights, rates, ice & transport  │
│    ➜ Stock updates automatically                            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. PROCESSING: Log Packing Costs (If exporting / boxing)    │
│    ➜ Record Thermocol boxes, ice, oxygen, labour            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. DAYTIME: Generate Sales & Invoices                       │
│    ➜ Select customer, pick fish, enter weight and rate      │
│    ➜ Collect cash/UPI or add to credit balance              │
│    ➜ Print or share PDF invoice                             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. THROUGHOUT THE DAY: Log Expenses                         │
│    ➜ Record diesel, tea/food, driver wages, vehicle rent    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. EVENING: Review Daily Profit & Loss                      │
│    ➜ Check Net Sales vs Purchases vs Expenses               │
│    ➜ Check pending customer collections                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Step-by-Step Module Guides

---

### 4.1 Dashboard

The **Dashboard** is your business command center. When you log in, you immediately see:

- **Today's Revenue**: Total money made from sales today.
- **Today's Purchases**: Total fish bought today (both weight in KG and value in ₹).
- **Today's Net Profit**: Real-time estimated earnings for the day.
- **Stock Alert**: Shows fish varieties running low in inventory.
- **Recent Transactions**: Quick table of the latest purchase bills and sales invoices.

---

### 4.2 Purchases (Harbor / Supplier Inward)

Use this module whenever fish arrives from the harbor, a boat, or a supplier.

#### How to Add a New Purchase Bill:
1. Click **Purchases** in the left sidebar ➜ Click **+ New Purchase** (or **Add Purchase**).
2. **Select Supplier**: Choose the boat/supplier name from the dropdown (or click *Add Supplier* if new).
3. **Purchase Details**:
   - **Date**: Defaults to today (can be changed if entering yesterday's bill).
   - **Harbor / Landing Location**: e.g., *Kasimedu*, *Cochin Harbor*, *Mangalore Port*.
   - **Boat Name / Truck Number**: Optional reference for delivery vehicles.
4. **Add Fish Items**:
   - Select the **Fish Variety** (e.g., *Kingfish / Seer Fish*, *Vanjaram*, *Prawns Grade A*).
   - Enter **Weight (KG)**.
   - Enter **Unit Rate / Price per KG**.
   - *(Optional)* Enter **Spoiled / Rejected Weight (KG)** if any fish was spoiled at dock — the system deducts this from payable amount.
   - Click **+ Add Item** to add more fish varieties in the same bill.
5. **Additional Direct Costs**:
   - Enter **Ice Charges**, **Transport / Freight Charges**, or **Labour Charges** incurred for this batch.
6. **Payment & Receipt**:
   - Enter **Paid Amount** (if paid immediately) or leave `0` if bought on credit.
   - Select **Payment Mode** (*Cash*, *UPI*, *Bank Transfer*, *Cheque*).
   - *(Optional)* Attach a photo of the handwritten harbor slip/invoice using the file uploader.
7. Click **Save Purchase**.
   - ✅ **Result**: Inventory stock automatically increases, and the supplier's balance is updated.

---

### 4.3 Sales & Invoicing (Customer Outward)

Use this module to create invoices and record sales to wholesale buyers, restaurants, exporters, or retail customers.

#### How to Create a Sale / Invoice:
1. Click **Sales** in the left sidebar ➜ Click **+ New Sale**.
2. **Select Customer**: Choose the customer from the list.
   - You can see their current outstanding credit balance right under their name.
3. **Add Fish Items**:
   - Select the **Fish Variety**. The system will show you the available stock in KG.
   - Enter the **Weight (KG)** to sell.
   - Enter the **Selling Price per KG**.
   - The system automatically calculates `Total = Weight × Rate`.
4. **Discounts & Taxes**:
   - Enter any Discount amount or Tax/GST percentage if applicable.
5. **Payment Collection**:
   - **Paid Amount**: Enter the amount collected today.
   - If Paid Amount = Total Amount ➜ Status becomes **PAID**.
   - If Paid Amount = 0 ➜ Status becomes **UNPAID** and the full amount is added to the customer's outstanding balance.
   - If Paid Amount < Total Amount ➜ Status becomes **PARTIAL**.
6. Click **Generate Invoice / Complete Sale**.
7. **Print / Share**:
   - Click **View / Print Invoice** to download a clean, branded PDF receipt to print or WhatsApp to the customer.
   - ✅ **Result**: Fish stock is automatically deducted from inventory.

---

### 4.4 Live Inventory & Stock

The **Inventory** tab gives you a real-time count of every kilogram of fish in your cold storage or display.

- **Current Stock Level**: Shows available KG for each fish type with color codes (Green = Good Stock, Yellow = Low Stock, Red = Out of Stock).
- **Stock Inward History**: Shows all incoming batches with date and lot numbers.
- **Manual Stock Adjustments / Wastage**:
  - If fish was spoiled in storage, ice melted, or an inventory discrepancy occurred:
  - Click **Adjust Stock / Record Wastage**.
  - Select Fish Variety, enter KG lost, and provide a reason (e.g., *Cold storage breakdown*, *Weight loss during defrosting*).
  - This ensures your books match the physical stock on your floor.

---

### 4.5 Packing & Box Processing

If you box fish for transport, domestic air shipments, or exports using thermocol boxes:

1. Go to **Packing Costs**.
2. Click **+ Record Packing**.
3. Link it to a specific **Sale** or log it as a standalone batch.
4. Enter:
   - **Packing Type**: e.g., *10 KG Thermocol Export Box*, *25 KG Poly Box*, *Air Cargo Box*.
   - **Number of Thermocol Boxes** and **Cost per Box**.
   - **Ice Cost**, **Oxygen packing charges**, **Taping & Material cost**, and **Labour charges**.
   - **Total Quantity (KG) Packed**.
5. The system automatically computes the **Packing Cost per KG** and includes this cost in your final Profit & Loss calculations.

---

### 4.6 Daily Business Expenses

Track every single expense outside of purchasing fish to know your true net business profit.

#### How to Add an Expense:
1. Click **Expenses** in the sidebar ➜ Click **+ Add Expense**.
2. **Category**: Choose a category (e.g., *Ice Purchases*, *Diesel & Fuel*, *Vehicle Rent*, *Shop Rent*, *Staff Wages*, *Electricity & Generator*, *Harbor Porter Fees*, *Miscellaneous*).
3. **Amount (₹)**: Enter the cost.
4. **Paid To / Beneficiary**: Name of the vendor/driver/worker.
5. **Payment Mode**: Cash / UPI / Bank Transfer.
6. **Date & Notes**: Enter any notes and attach a photo of the receipt/slip if available.
7. Click **Save Expense**.

---

### 4.7 Customers & Credit Management

Keep track of wholesale clients, hotel contracts, and retail customers.

- **Add Customer**: Store Name, Phone Number, WhatsApp Number, Delivery Address, and Credit Limit.
- **Customer Ledger / Statement**:
  - Click on any customer name to view their complete history.
  - See all sales made to them, all payments received, and the **Outstanding Due Balance**.
- **Record a Payment Received Later**:
  - When a customer sends a cheque/UPI or hands over cash for past bills:
  - Open the customer's page ➜ Click **Record Payment**.
  - Enter amount received, date, and payment mode. The customer's balance will decrease immediately.

---

### 4.8 Suppliers & Harbor Accounts

Manage your relationships with boat owners, auctioneers, and landing agents.

- **Supplier Directory**: Name, Harbor location, Boat Name, Phone number, and Bank Details.
- **Payable Ledger**:
  - Check how much you owe each boat owner or supplier at any time.
- **Pay Supplier**:
  - When you settle weekly or daily payments to a supplier:
  - Click **Record Supplier Payment**, enter the amount, and choose bank transfer/cash.
  - The supplier balance will update automatically.

---

### 4.9 Profit & Loss and Reports

Get complete clarity on how profitable your seafood business is.

- **Profit & Loss Statement**:
  - **Gross Revenue**: Total sales.
  - **Cost of Goods Sold (COGS)**: Purchase price of fish + harbor freight + ice.
  - **Direct Costs**: Packing boxes, oxygen, processing labour.
  - **Operating Expenses**: Shop rent, driver wages, diesel, electricity.
  - **= Net Profit (₹)** and **Profit Margin (%)**.
- **Date Filters**: View P&L for **Today**, **This Week**, **This Month**, or any custom date range.
- **Exporting Reports**:
  - Click **Export to Excel (CSV)** or **Download PDF** to share with your accountant or business partners.

---

### 4.10 Settings

- **Business Profile**: Update your company name, GST/Tax number, address, phone number, and company logo for invoices.
- **Fish Types**: Add new fish species (e.g., *Pomfret*, *Salmon*, *Squid*, *Crab*, *Tuna*) with their standard grades and categories.
- **Expense Categories**: Create custom categories specific to your harbor or shop operations.
- **User Management**: Add managers or billing staff with appropriate access permissions.

---

## 5. Frequently Asked Questions & How-To Guides

### Q1: What should I do if fish gets spoiled or rejected during delivery?
> When creating a Sale or editing a Sale Item, enter the rejected weight in the **Spoiled / Rejected Weight (KG)** field and select the reason (e.g., *Transit heat damage*). The system will automatically discount that quantity from the customer's bill while accurately reflecting the wastage in your stock records.

### Q2: A customer paid only half of their bill. How do I record it?
> When creating the sale, simply enter the amount they paid right now in the **Paid Amount** field. The remaining balance automatically moves to the customer's unpaid credit ledger. When they pay the remaining balance later, go to **Customers** ➜ select the customer ➜ click **Record Payment**.

### Q3: Can I attach photos of paper receipts?
> Yes! Both the **Purchases** and **Expenses** modules include a receipt upload button. You can snap a photo with your phone or upload an image file so you never lose paper harbor slips.

### Q4: How do I correct a mistake in a purchase or sale?
> Navigate to **Purchases** or **Sales**, click on the specific entry, and click **Edit**. Update the weights, rates, or payment details and click **Save Changes**. All stock quantities and ledger balances will automatically re-calculate.

### Q5: Can I use this system on a mobile phone or tablet at the harbor?
> Yes. The system is fully responsive. You can open your site URL on any smartphone or tablet at the fish harbor to enter incoming boats and weights immediately.

---

## 6. Best Practices & Pro Tips

1. ⚡ **Enter purchases immediately at landing**: Entering purchases as soon as crates are weighed ensures your inventory is always 100% accurate for the sales team.
2. 🧊 **Don't skip ice and transport costs**: Adding transport and ice charges to purchase bills ensures your purchase cost per KG reflects the true landing cost.
3. 📱 **Save Customer WhatsApp Numbers**: Having active phone numbers stored lets you quickly share invoices and payment reminders.
4. 🔒 **Log out after your shift**: If using a shared computer at the shop counter, remember to log out from the top right profile menu at the end of the day.

---

*Need technical assistance or system updates? Contact your software administrator.*
