# Quick Start: Category Expiry Email

## ✅ What's New?

Categories now automatically send email notifications with PDF reports when they expire!

## 🚀 Quick Setup (3 Steps)

### Step 1: Database is Already Updated ✅
The database schema has been updated with:
- `expiryEmailSent` - Tracks if expiry email was sent
- `expiryEmailSentAt` - Timestamp of when email was sent

### Step 2: SMTP Already Configured ✅
Your `.env.local` already has SMTP settings configured.

### Step 3: Set Up Automatic Checking

Choose one option:

#### Option A: Manual Testing (Recommended First)
```bash
# Start your dev server first
npm run dev

# In another terminal, run:
npm run check-expiry
```

#### Option B: Cron Job (Every Hour)
```bash
# Edit crontab
crontab -e

# Add this line:
0 * * * * cd /Users/chandanvishwakarma/expanse-tracker && npm run check-expiry >> /tmp/expiry-check.log 2>&1
```

#### Option C: Cron Job (Every 30 Minutes)
```bash
# Edit crontab
crontab -e

# Add this line:
*/30 * * * * cd /Users/chandanvishwakarma/expanse-tracker && npm run check-expiry >> /tmp/expiry-check.log 2>&1
```

## 🧪 Test It Now!

### Quick Test:

1. **Create a test category** with expiry date = today
2. **Add some expenses** to it
3. **Run the checker**:
   ```bash
   npm run check-expiry
   ```
4. **Check your email** at `info.corpow@gmail.com`

### Expected Result:
- ✅ Email received with "Category Expired" subject
- ✅ PDF attachment with complete statement
- ✅ Category marked as inactive
- ✅ No duplicate emails on subsequent runs

## 📧 What Users Receive

When a category expires, users get:
1. **Email notification** with red alert banner
2. **Final summary** showing:
   - Expected budget vs actual spending
   - Variance (over/under budget)
   - Budget usage percentage
   - Complete expense list
3. **PDF attachment** - Professional bank statement style
4. **Category auto-deactivated** - No more expenses can be added

## 🔍 How It Works

```
Category Expires → Cron Job Runs → API Checks Database → 
Finds Expired Categories → Generates PDF → Sends Email → 
Marks as Sent → Deactivates Category
```

## 📊 View Logs

```bash
# View cron logs (if using cron)
tail -f /tmp/expiry-check.log

# Or check system logs
grep CRON /var/log/syslog
```

## 🎯 Production Deployment

For production, add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/category-expiry-check",
    "schedule": "0 * * * *"
  }]
}
```

## ✨ That's It!

Your categories will now automatically notify users when they expire with complete PDF reports!

For detailed documentation, see: `CATEGORY-EXPIRY-EMAIL.md`
