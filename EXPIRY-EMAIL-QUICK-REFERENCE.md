# Category Expiry Email - Quick Reference

## ✅ Status: FULLY AUTOMATED

## 🎯 What It Does

Automatically sends email with PDF when category expires.

## 🚀 How It Works

```
App Starts → Checker Initializes → Runs Every 5 Minutes → 
Finds Expired Categories → Sends Email + PDF → Marks as Sent (ONE TIME ONLY)
```

## 📦 Files Added

1. `src/lib/expiryChecker.ts` - Background checker logic
2. `src/app/api/init-expiry-checker/route.ts` - API to start checker
3. `src/components/ExpiryCheckerInitializer.tsx` - Auto-start component
4. `src/app/layout.tsx` - Modified to include initializer

## 🧪 Quick Test

```bash
# 1. Start server
npm run dev

# 2. Create category with expiry = now + 1 minute

# 3. Wait 6 minutes (expiry + 5 min check interval)

# 4. Check email at info.corpow@gmail.com
```

## 🔍 Verify It's Running

```bash
curl http://localhost:3000/api/init-expiry-checker
```

Expected response:
```json
{
  "message": "Expiry checker already running",
  "status": "running",
  "interval": "5 minutes"
}
```

## 📧 Email Details

- **To**: User's email (from database)
- **Subject**: ⏰ Category Expired: [Name] - Final Report
- **Content**: Budget summary, expense list, variance
- **Attachment**: Professional PDF statement

## ✅ One-Time Email Guarantee

**Email sent ONLY ONCE per category** because:

1. Query filters: `expiryEmailSent = false`
2. After sending: `expiryEmailSent = true`
3. Category marked: `isActive = false`
4. Next check: Category not found (already sent)

## 🔧 Configuration

### Check Interval
Default: **5 minutes**

Change in `src/lib/expiryChecker.ts`:
```typescript
}, 5 * 60 * 1000) // 5 minutes
```

### SMTP Settings
Already configured in `.env.local`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info.corpow@gmail.com
SMTP_PASS=jyqslfywqoelezji
```

## 📊 Database Fields

### PlanningCategory Table
- `expiryDate` (DateTime) - When category expires
- `expiryEmailSent` (Boolean) - Email sent flag
- `expiryEmailSentAt` (DateTime) - When email was sent
- `isActive` (Boolean) - Category active status

## 🎯 Key Features

- ✅ Automatic initialization
- ✅ Runs every 5 minutes
- ✅ One-time email per category
- ✅ Professional PDF attachment
- ✅ Auto-deactivates category
- ✅ No cron jobs needed
- ✅ Works on all platforms
- ✅ Logs all activities

## 🚨 Troubleshooting

### Checker not running?
```bash
# Restart dev server
npm run dev

# Check status
curl http://localhost:3000/api/init-expiry-checker
```

### Email not sending?
```bash
# Test SMTP
node test-smtp.js

# Check logs in terminal
```

### Want to test immediately?
```bash
# Manually trigger check
curl -X POST http://localhost:3000/api/category-expiry-check
```

## 📝 Console Logs

Look for these messages:
```
🚀 Starting automatic expiry checker (every 5 minutes)...
✅ Expiry checker started successfully
[timestamp] No expired categories found
[timestamp] Found 1 expired categories
✅ [timestamp] Sent expiry email: Category Name → user@email.com
```

## 🎉 Success!

Your system is now fully automated. Categories will automatically send expiry emails with PDF reports!

**No manual intervention needed!** 🚀

---

For detailed documentation, see: `AUTO-EXPIRY-EMAIL-SETUP.md`
