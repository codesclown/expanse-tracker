# 💰 Expense Tracker - Smart Financial Management

A production-grade expense tracking app with AI-powered insights, subscription detection, and intelligent chatbot. Built with Next.js 14, TypeScript, and modern web technologies.

## ✨ Features

### Core Features
- ✅ **Expense Management**: Add, edit, delete expenses with categories, tags, and receipts
- ✅ **Income Tracking**: Track salary and additional income sources
- ✅ **Udhar (Loans)**: Manage money given/taken with settlement tracking
- ✅ **Smart Dashboard**: Real-time stats with Day/Week/Month/Year views
- ✅ **Advanced Filters**: Search by category, bank, payment mode, tags, date range

### AI-Powered Features
- 🤖 **AI Chatbot**: Natural language queries about spending
- 🎯 **Smart Spending Score**: 0-100 score based on savings, subscriptions, volatility
- 🔄 **Auto Subscription Detection**: Identifies recurring payments (Netflix, EMI, etc.)
- 📊 **Predictive Insights**: Spending patterns and recommendations

### Mobile-First Design
- 📱 **Bottom Navigation**: App-like experience with easy thumb access
- 🎨 **Modern UI**: Gradient headers, rounded cards, smooth animations
- 💾 **Local Storage**: Works offline, data persists in browser
- ⚡ **Fast & Responsive**: Optimized for mobile and desktop

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install**
```bash
git clone <your-repo>
cd expense-tracker
npm install
```

2. **Set up environment** (Optional for full features)
```bash
cp .env.example .env
# Edit .env if you want to use PostgreSQL backend
```

3. **Run development server**
```bash
npm run dev
```

4. **Open app**
```
http://localhost:3000
```

### Current Mode: Local Storage
The app currently works with **browser local storage** - no database setup needed! Perfect for:
- Quick testing
- Personal use
- Offline functionality
- No backend required

### Optional: Database Setup
To use the full backend with PostgreSQL:

```bash
# Set DATABASE_URL in .env
npm run db:push
npm run db:generate
```

## 📱 User Flow

### 1. Landing & Auth
- Beautiful gradient landing page
- Login/Register with email & password
- Set monthly salary and currency

### 2. Dashboard
- View total expense, income, savings, Smart Score
- Quick add expense/income buttons
- Recent transactions list
- Category breakdown
- Time-based views (Day/Week/Month/Year)

### 3. Add Expense
- Amount, title, category
- Bank, payment mode
- Tags (comma-separated)
- Notes and receipt upload
- Auto-categorization ready

### 4. Expenses Page
- Full list with search
- Filter by category
- Delete expenses
- View tags and details
- Floating + button

### 5. Subscriptions
- Auto-detect recurring payments
- View monthly total
- Track next due dates
- Manage active subscriptions

### 6. Udhar (Loans)
- Track money given/taken
- View remaining balance
- Settlement tracking
- Total given vs taken summary

### 7. AI Chat Assistant
- Ask natural language questions:
  - "How much did I spend this month?"
  - "Show my spending by category"
  - "What's my Smart Score?"
  - "How much did I save?"
- Get instant insights
- Suggested quick questions

### 8. Settings
- Profile management
- Reminders
- Bank sync (coming soon)
- Security settings
- Help & support

## 🎯 Smart Spending Score

Calculated based on 5 factors:

| Factor | Weight | Description |
|--------|--------|-------------|
| Savings Rate | 35% | Income vs expenses ratio |
| Subscription Ratio | 20% | Recurring costs as % of income |
| Volatility | 15% | Spending consistency |
| Debt Load | 20% | Outstanding loans |
| High-Risk Spending | 10% | Discretionary categories |

**Score Ranges:**
- 70-100: 🟢 Excellent (Green)
- 40-69: 🟡 Good (Yellow)
- 0-39: 🔴 Needs Improvement (Red)

## 🔄 Subscription Detection

Auto-detects recurring expenses by:
1. Grouping similar titles and amounts
2. Analyzing date intervals
3. Identifying ~30-day patterns
4. Creating subscription entries

**Detects:**
- Streaming services (Netflix, Spotify)
- Insurance (LIC, health)
- EMIs and loans
- Utility bills
- SIP investments

## 🤖 AI Chatbot Capabilities

**Supported Queries:**
- Total spending (month/year)
- Category-wise breakdown
- Bank-wise spending
- Smart Score explanation
- Savings analysis
- Income tracking
- Spending advice

**Example Questions:**
```
"How much did I spend on food this month?"
"What's my Smart Score?"
"Show my subscriptions"
"How much did I save?"
"Am I overspending?"
```

## 📂 Project Structure

```
expense-tracker/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Landing page
│   │   ├── login/             # Login page
│   │   ├── register/          # Register page
│   │   ├── dashboard/         # Main dashboard
│   │   ├── expenses/          # Expense management
│   │   ├── subscriptions/     # Subscription tracking
│   │   ├── udhar/             # Loan tracking
│   │   ├── chat/              # AI chatbot
│   │   ├── settings/          # Settings page
│   │   └── api/               # API routes
│   │       ├── auth/          # Authentication
│   │       ├── expenses/      # Expense CRUD
│   │       ├── subscriptions/ # Subscription detection
│   │       ├── smart-score/   # Score calculation
│   │       └── chat/          # Chatbot queries
│   ├── components/            # React components
│   │   ├── BottomNav.tsx     # Mobile navigation
│   │   ├── AddExpenseModal.tsx
│   │   ├── AddIncomeModal.tsx
│   │   └── AddUdharModal.tsx
│   ├── hooks/                 # Custom hooks
│   │   └── useLocalStorage.ts
│   └── lib/                   # Business logic
│       ├── analytics.ts       # Stats & charts
│       ├── smartScore.ts      # Scoring algorithm
│       ├── subscriptionDetector.ts
│       ├── chatbot.ts         # NLP query parser
│       ├── filters.ts         # Query builders
│       ├── auth.ts            # JWT auth
│       └── prisma.ts          # Database client
├── prisma/
│   └── schema.prisma          # Database schema
└── public/                    # Static assets
```

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS
- Local Storage API

**Backend (Optional):**
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- JWT Authentication

**Future Integrations:**
- Cloudflare R2 (receipts)
- Redis (caching)
- Bank APIs (Setu/Anumati)

## 📊 Data Models

### Expense
```typescript
{
  id, userId, date, title, amount,
  category, bank, paymentMode,
  tags[], notes, receiptUrl,
  isRecurring, subscriptionId
}
```

### Income
```typescript
{
  id, userId, date, source,
  amount, notes
}
```

### Udhar
```typescript
{
  id, userId, person, reason,
  total, remaining, direction
}
```

### Subscription
```typescript
{
  id, userId, name, amount,
  interval, nextDueDate,
  lastChargedAt, active,
  source, expenseIds[]
}
```

## 🎨 Design Features

- **Gradient Headers**: Indigo to purple gradients
- **Rounded Cards**: Modern 2xl/3xl border radius
- **Shadow Depth**: Layered shadow system
- **Color Coding**: Green (income), Red (expense), Blue (savings)
- **Empty States**: Friendly illustrations and messages
- **Floating Actions**: Bottom-right + buttons
- **Bottom Nav**: Fixed navigation for mobile
- **Responsive**: Works on all screen sizes

## 🔐 Security (When using backend)

- JWT token authentication
- Password hashing with bcrypt
- Secure HTTP-only cookies
- CORS protection
- Input validation with Zod

## 📈 Future Roadmap

- [ ] Bank sync integration
- [ ] Receipt OCR
- [ ] Budget goals & alerts
- [ ] Multi-currency support
- [ ] Family/shared accounts
- [ ] Export to PDF/Excel
- [ ] PWA with offline mode
- [ ] Dark mode
- [ ] Expense categories customization
- [ ] Recurring expense templates

## 🤝 Contributing

Contributions welcome! Please read contributing guidelines first.

## 📄 License

MIT License - feel free to use for personal or commercial projects

## 🙏 Acknowledgments

Built with modern web technologies and best practices for a production-ready expense tracking experience.

---

**Made with ❤️ for better financial management**
