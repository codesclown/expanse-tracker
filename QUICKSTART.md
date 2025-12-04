# 🚀 Quick Start Guide - FinanceTracker

Get your FinanceTracker up and running with **real database integration** and **email notifications** in 5 minutes!

## ⚡ Super Quick Setup

### 1. **Clone & Install** (1 minute)
```bash
git clone <repository-url>
cd financetracker
npm install
```

### 2. **Configure Environment** (2 minutes)
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your settings
nano .env.local  # or use your favorite editor
```

**Required Configuration:**
```env
# Database (use your PostgreSQL connection)
DATABASE_URL="postgresql://username:password@localhost:5432/financetracker"

# JWT Secret (generate random 32+ character string)
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"

# Gmail for notifications
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-16-char-app-password"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. **Setup Database** (1 minute)
```bash
# Run automated setup
npm run setup
```

### 4. **Start Application** (30 seconds)
```bash
npm run dev
```

### 5. **Test Integration** (30 seconds)
```bash
# Verify everything is working
npm run verify
```

## 📧 Gmail Setup (If needed)

### Quick Gmail App Password:
1. **Enable 2FA**: [Google Account Security](https://myaccount.google.com/security) → 2-Step Verification
2. **Generate App Password**: Security → App passwords → Mail → Generate
3. **Copy 16-character password** to `.env.local`

## ✅ Success Checklist

After setup, you should have:

- ✅ **Database**: Prisma Studio opens at `http://localhost:5555`
- ✅ **App**: FinanceTracker runs at `http://localhost:3000`
- ✅ **Email**: Welcome email received on registration
- ✅ **Real Data**: All forms save to PostgreSQL database
- ✅ **No Mock Data**: Everything uses real API endpoints

## 🎯 Test Your Setup

### 1. **Database Test**
```bash
npm run db:studio
# Should open Prisma Studio showing your database tables
```

### 2. **Email Test**
1. Register a new account at `http://localhost:3000/register`
2. Check your email for welcome message
3. Add an expense - check for expense alert email

### 3. **API Test**
1. Open browser Network tab
2. Add an expense
3. Should see successful POST to `/api/expenses`
4. Data should persist after page refresh

## 🔧 Common Issues

### Database Connection Failed
```bash
# Make sure PostgreSQL is running
brew services start postgresql  # macOS
sudo service postgresql start   # Linux

# Test connection
npm run db:push
```

### Email Not Working
- Verify 2FA is enabled on Gmail
- Check app password is exactly 16 characters
- No spaces in app password

### Environment Variables Not Loading
- File must be named `.env.local` (not `.env`)
- Must be in project root directory
- Restart development server after changes

## 🚀 Production Deployment

### Vercel (Recommended)
1. **Connect GitHub** repository to Vercel
2. **Add Environment Variables** in Vercel dashboard:
   - `DATABASE_URL` (your production PostgreSQL)
   - `JWT_SECRET` (same as development)
   - `GMAIL_USER` (your Gmail)
   - `GMAIL_APP_PASSWORD` (your app password)
   - `NEXT_PUBLIC_APP_URL` (your domain)
3. **Deploy** - automatic on push to main branch

### Other Platforms
1. **Build**: `npm run build`
2. **Set Environment Variables** on your platform
3. **Start**: `npm start`

## 📊 What You Get

### **Real Database Integration**
- PostgreSQL with Prisma ORM
- All data persists (no localStorage)
- Real-time synchronization
- Proper CRUD operations

### **Email Notifications**
- Welcome emails for new users
- Expense alerts on transactions
- Budget warnings when limits exceeded
- Monthly financial reports

### **Complete API**
- JWT authentication
- Protected routes
- Real data validation
- Error handling

### **Modern UI**
- Mobile-first design
- Dark/light theme
- Real-time updates
- Professional interface

## 🆘 Need Help?

### Quick Commands
```bash
npm run verify     # Check integration status
npm run setup      # Re-run setup if needed
npm run db:studio  # View database
npm run db:reset   # Reset database if corrupted
```

### Documentation
- **Full Setup**: `README.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`
- **Features**: `FEATURES.md`

### Test Everything Works
1. **Register** → Should receive welcome email
2. **Add Expense** → Should save to database + email alert
3. **View Dashboard** → Should show real data from database
4. **Refresh Page** → Data should persist (proves database storage)

---

**🎉 You now have a fully integrated FinanceTracker with real database and email notifications!**

**No mock data, no localStorage - everything is production-ready.**