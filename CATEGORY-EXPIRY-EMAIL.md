# Automatic Category Expiry Email Feature

## ✅ Implementation Complete

When a category expires, the system automatically sends an email with a PDF report to the user.

## 🎯 Features

1. **Automatic Detection**: Checks for expired categories based on `expiryDate`
2. **One-Time Email**: Each category sends expiry email only once (tracked via `expiryEmailSent`)
3. **PDF Attachment**: Professional bank statement-style PDF attached to email
4. **Auto-Deactivation**: Category is automatically marked as inactive after expiry
5. **Final Summary**: Email includes complete expense breakdown and budget analysis

## 📧 Email Content

The expiry email includes:
- **Alert Banner**: Red gradient header indicating expiry
- **Final Summary**: Budget vs actual spending, variance, usage percentage
- **Period Information**: Start date, end date, and expiry date
- **Complete Expense List**: All expenses in the category
- **PDF Attachment**: Professional statement for record keeping

## 🔧 Setup

### 1. Database Migration

Run the migration to add expiry tracking fields:

```bash
npx prisma db push
npx prisma generate
```

This adds:
- `expiryEmailSent` (Boolean) - Tracks if email was sent
- `expiryEmailSentAt` (DateTime) - When email was sent
- Index on `expiryDate` and `expiryEmailSent` for fast queries

### 2. SMTP Configuration

Ensure your `.env.local` has SMTP settings:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

### 3. Automated Checking

You have two options to run the expiry checker:

#### Option A: Cron Job (Linux/Mac)

Edit your crontab:
```bash
crontab -e
```

Add this line to check every hour:
```
0 * * * * cd /path/to/your/project && node scripts/check-category-expiry.js >> /var/log/category-expiry.log 2>&1
```

Or check every 30 minutes:
```
*/30 * * * * cd /path/to/your/project && node scripts/check-category-expiry.js >> /var/log/category-expiry.log 2>&1
```

#### Option B: Task Scheduler (Windows)

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., Daily at specific time, or repeat every hour)
4. Action: Start a program
   - Program: `node`
   - Arguments: `scripts/check-category-expiry.js`
   - Start in: `C:\path\to\your\project`

#### Option C: Manual Testing

Run manually to test:
```bash
node scripts/check-category-expiry.js
```

Or via API:
```bash
curl -X POST http://localhost:3000/api/category-expiry-check
```

### 4. Production Deployment

For production, use a proper job scheduler:

#### Vercel (Cron Jobs)
Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/category-expiry-check",
    "schedule": "0 * * * *"
  }]
}
```

#### AWS Lambda + EventBridge
Create a Lambda function that calls your API endpoint on a schedule.

#### Heroku Scheduler
Add the Heroku Scheduler add-on and configure:
```
node scripts/check-category-expiry.js
```

#### Docker + Cron
Add to your `docker-compose.yml`:
```yaml
services:
  cron:
    build: .
    command: sh -c "echo '0 * * * * node /app/scripts/check-category-expiry.js' | crontab - && crond -f"
    environment:
      - NEXT_PUBLIC_APP_URL=http://web:3000
```

## 🧪 Testing

### Test the Expiry Email Feature

1. **Create a test category**:
   - Set expiry date to current time or 1 minute in the future
   - Add some expenses to it

2. **Wait for expiry** or manually update the database:
   ```sql
   UPDATE "PlanningCategory" 
   SET "expiryDate" = NOW() - INTERVAL '1 minute'
   WHERE name = 'Your Test Category';
   ```

3. **Run the checker**:
   ```bash
   node scripts/check-category-expiry.js
   ```

4. **Check your email** for the expiry notification with PDF

### Expected Output

```
🔍 Checking for expired categories...
App URL: http://localhost:3000
✅ Successfully processed 1 expired categories

Results:
  ✓ Test Category → user@example.com
```

## 📊 How It Works

1. **Cron/Scheduler** runs `check-category-expiry.js` periodically
2. **Script** calls `/api/category-expiry-check` endpoint
3. **API** queries database for expired categories where:
   - `expiryDate <= NOW()`
   - `expiryEmailSent = false`
   - `isActive = true`
4. **For each expired category**:
   - Generate PDF with all expenses
   - Send email with PDF attachment
   - Mark `expiryEmailSent = true`
   - Set `isActive = false`
   - Record `expiryEmailSentAt` timestamp

## 🔍 Monitoring

### Check Logs

View cron logs:
```bash
tail -f /var/log/category-expiry.log
```

### Database Query

Check which categories have sent emails:
```sql
SELECT 
  name, 
  "expiryDate", 
  "expiryEmailSent", 
  "expiryEmailSentAt",
  "isActive"
FROM "PlanningCategory"
WHERE "expiryEmailSent" = true
ORDER BY "expiryEmailSentAt" DESC;
```

### API Response

The API returns:
```json
{
  "success": true,
  "processed": 2,
  "results": [
    {
      "categoryId": "clx...",
      "categoryName": "Festival Budget",
      "userEmail": "user@example.com",
      "status": "success"
    }
  ]
}
```

## 🚨 Troubleshooting

### Email not sending?
- Check SMTP credentials in `.env.local`
- Run `node test-smtp.js` to verify SMTP connection
- Check server logs for errors

### Cron not running?
- Verify cron service is running: `sudo service cron status`
- Check cron logs: `grep CRON /var/log/syslog`
- Ensure script has execute permissions: `chmod +x scripts/check-category-expiry.js`

### Categories not being detected?
- Verify `expiryDate` is set correctly
- Check `expiryEmailSent` is `false`
- Ensure category `isActive` is `true`

## 📝 Notes

- **One email per category**: Each category sends expiry email only once
- **Automatic deactivation**: Expired categories are marked inactive
- **No duplicate emails**: `expiryEmailSent` flag prevents duplicates
- **Timezone aware**: Uses server timezone for expiry checks
- **Batch processing**: Handles multiple expired categories in one run

## 🎉 Success!

Your categories will now automatically send final reports when they expire!

Users receive:
- ✅ Email notification when category expires
- ✅ Complete PDF statement for records
- ✅ Budget analysis and variance report
- ✅ Full expense breakdown
- ✅ Category automatically deactivated
