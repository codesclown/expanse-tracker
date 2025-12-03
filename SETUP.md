# Setup Guide - Expense Tracker

## Quick Start (Local Storage Mode)

The app works out of the box with browser local storage - no database needed!

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and start using the app immediately.

## Full Backend Setup (Optional)

To use the complete backend with PostgreSQL and API authentication:

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up PostgreSQL Database

Install PostgreSQL and create a database:

```bash
createdb expense_tracker
```

### 3. Configure Environment Variables

Copy the example file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your database URL:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/expense_tracker"
JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long"
```

### 4. Initialize Database

```bash
npm run db:push
npm run db:generate
```

### 5. Run Development Server

```bash
npm run dev
```

## Features

### Current Mode: Hybrid

The app currently works in **hybrid mode**:
- ✅ Local storage for quick testing (default)
- ✅ API backend ready (when database is configured)
- ✅ Automatic fallback to local storage if API fails

### Switching Modes

The app automatically detects if you have a database configured:
- **No DATABASE_URL**: Uses local storage
- **With DATABASE_URL**: Uses API backend

## User Flow

### 1. Register/Login
- Create account at `/register`
- Login at `/login`
- JWT token stored in localStorage

### 2. Dashboard
- View stats: expense, income, savings, Smart Score
- Add expenses and income
- View recent transactions
- Category breakdown

### 3. Expenses
- Full CRUD operations
- Search and filter
- Category-based filtering
- Delete expenses

### 4. Subscriptions
- Auto-detect recurring payments
- View monthly total
- Manage subscriptions

### 5. Udhar (Loans)
- Track money given/taken
- View totals
- Delete loans

### 6. AI Chat
- Ask questions about spending
- Get instant insights
- Natural language queries

### 7. Settings
- View profile
- Logout

## API Endpoints

All endpoints require `Authorization: Bearer <token>` header (except auth endpoints).

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Expenses
- `GET /api/expenses` - List expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/[id]` - Update expense
- `DELETE /api/expenses/[id]` - Delete expense

### Incomes
- `GET /api/incomes` - List incomes
- `POST /api/incomes` - Create income

### Subscriptions
- `GET /api/subscriptions` - List subscriptions
- `POST /api/subscriptions/detect` - Auto-detect subscriptions

### Udhar
- `GET /api/udhar` - List loans
- `POST /api/udhar` - Create loan
- `DELETE /api/udhar/[id]` - Delete loan

### Smart Score
- `GET /api/smart-score/monthly?year=2024&month=12` - Get monthly score
- `POST /api/smart-score/recalculate` - Recalculate score

### Chat
- `POST /api/chat/query` - Send chat query

## Database Schema

See `prisma/schema.prisma` for complete schema.

Key models:
- User
- Expense
- Income
- Udhar
- Subscription
- SmartScore
- BankAccount (future)
- BankTransaction (future)

## Troubleshooting

### Database Connection Issues

If you see database errors:
1. Check DATABASE_URL in `.env.local`
2. Ensure PostgreSQL is running
3. Run `npm run db:push` again

The app will automatically fall back to local storage if database connection fails.

### JWT Token Issues

If authentication fails:
1. Check JWT_SECRET is set in `.env.local`
2. Clear browser localStorage
3. Register a new account

### Port Already in Use

If port 3000 is busy:
```bash
npm run dev -- -p 3001
```

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXTAUTH_SECRET`
4. Deploy

### Other Platforms

The app works on any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## Development

### Project Structure

```
src/
├── app/              # Next.js pages & API routes
├── components/       # React components
├── contexts/         # React contexts (Auth)
├── hooks/            # Custom hooks
└── lib/              # Business logic & utilities
```

### Adding New Features

1. Create API route in `src/app/api/`
2. Add method to `src/lib/api.ts`
3. Create custom hook in `src/hooks/`
4. Use hook in component

## Support

For issues or questions, check:
- README.md for feature documentation
- prisma/schema.prisma for database schema
- src/lib/api.ts for API client methods
