# Troubleshooting: Category Expiry Email System

## ✅ Issue: "Unknown argument `expiryDate`"

### Problem
Prisma client doesn't recognize the new `expiryDate`, `expiryEmailSent`, or `expiryEmailSentAt` fields.

### Solution
Run these commands:

```bash
# 1. Push schema to database
npx prisma db push

# 2. Regenerate Prisma client
npx prisma generate

# 3. Restart your dev server
# Press Ctrl+C to stop, then:
npm run dev
```

### Why This Happens
When you update the Prisma schema, you need to:
1. Sync the database (db push)
2. Regenerate the TypeScript types (generate)
3. Restart the server to load new types

---

## ✅ Issue: Expiry Checker Not Running

### Check Status
```bash
curl http://localhost:3000/api/init-expiry-checker
```

### Expected Response
```json
{
  "message": "Expiry checker already running",
  "status": "running",
  "interval": "5 minutes"
}
```

### If Not Running
1. **Restart dev server**:
   ```bash
   npm run dev
   ```

2. **Check console logs** for:
   ```
   🚀 Starting automatic expiry checker (every 5 minutes)...
   ✅ Expiry checker started successfully
   ```

3. **Manually initialize**:
   ```bash
   curl http://localhost:3000/api/init-expiry-checker
   ```

---

## ✅ Issue: Email Not Sending

### Test SMTP Connection
```bash
node test-smtp.js
```

### Expected Output
```
✅ SMTP connection successful!
✅ Test email sent successfully!
```

### If SMTP Fails

1. **Check environment variables**:
   ```bash
   cat .env.local | grep SMTP
   ```

2. **Verify credentials**:
   - SMTP_HOST=smtp.gmail.com
   - SMTP_PORT=587
   - SMTP_USER=your-email@gmail.com
   - SMTP_PASS=your-app-password (not regular password!)

3. **Gmail App Password**:
   - Enable 2FA on Gmail
   - Generate App Password: https://myaccount.google.com/apppasswords
   - Use 16-character app password (no spaces)

---

## ✅ Issue: Duplicate Emails

### This Should NEVER Happen
The system prevents duplicates with:
- `expiryEmailSent` flag
- Database query filters
- One-time update

### If It Happens

1. **Check database**:
   ```sql
   SELECT 
     name, 
     "expiryEmailSent", 
     "expiryEmailSentAt"
   FROM "PlanningCategory"
   WHERE name = 'Your Category Name';
   ```

2. **Verify flag is set**:
   - `expiryEmailSent` should be `true` after first email
   - `expiryEmailSentAt` should have timestamp

3. **Check logs** for duplicate processing

---

## ✅ Issue: Category Not Expiring

### Check Expiry Date
```sql
SELECT 
  name, 
  "expiryDate", 
  "isActive",
  "expiryEmailSent"
FROM "PlanningCategory"
WHERE "expiryDate" <= NOW()
  AND "expiryEmailSent" = false;
```

### Verify:
- `expiryDate` is in the past
- `isActive` is `true`
- `expiryEmailSent` is `false`

### Manual Trigger
```bash
curl -X POST http://localhost:3000/api/category-expiry-check
```

---

## ✅ Issue: No Console Logs

### Expected Logs
```
🚀 Starting automatic expiry checker (every 5 minutes)...
✅ Expiry checker started successfully
[timestamp] No expired categories found
```

### If No Logs

1. **Check if checker initialized**:
   - Look for "Starting automatic expiry checker" message
   - Should appear when app loads

2. **Check browser console**:
   - Open DevTools → Console
   - Look for "✅ Expiry checker: ..." message

3. **Restart server**:
   ```bash
   npm run dev
   ```

---

## ✅ Issue: Database Reset Lost Data

### If You Ran `--force-reset`
The `--force-reset` flag **deletes all data**. To avoid this:

```bash
# Use this instead (no data loss):
npx prisma db push
npx prisma generate
```

### Restore Data
If you have a backup:
```bash
psql financetracker < backup.sql
```

If no backup, you'll need to recreate:
- Users
- Categories
- Expenses

---

## ✅ Common Commands

### Database
```bash
# Sync schema (no data loss)
npx prisma db push

# Regenerate client
npx prisma generate

# Open Prisma Studio
npx prisma studio

# Reset database (DELETES DATA!)
npx prisma db push --force-reset
```

### Testing
```bash
# Test SMTP
node test-smtp.js

# Check expiry status
curl http://localhost:3000/api/init-expiry-checker

# Manually trigger check
curl -X POST http://localhost:3000/api/category-expiry-check

# Run cron script
npm run check-expiry
```

### Server
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production
npm start
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Database has new fields (`expiryDate`, `expiryEmailSent`, `expiryEmailSentAt`)
- [ ] Prisma client regenerated
- [ ] Server restarted
- [ ] Checker initialized (check console logs)
- [ ] SMTP connection works (`node test-smtp.js`)
- [ ] Can create category with expiry date
- [ ] Can update category expiry date
- [ ] Expiry checker runs every 5 minutes
- [ ] Email sent when category expires
- [ ] No duplicate emails
- [ ] Category marked inactive after expiry

---

## 🆘 Still Having Issues?

### Check These Files

1. **Schema**: `prisma/schema.prisma`
   - Has `expiryDate`, `expiryEmailSent`, `expiryEmailSentAt` fields?

2. **Checker**: `src/lib/expiryChecker.ts`
   - Exists and has no syntax errors?

3. **Initializer**: `src/components/ExpiryCheckerInitializer.tsx`
   - Exists and imported in layout?

4. **Layout**: `src/app/layout.tsx`
   - Has `<ExpiryCheckerInitializer />` component?

5. **Environment**: `.env.local`
   - Has all SMTP variables?

### Debug Mode

Add more logging to `src/lib/expiryChecker.ts`:

```typescript
console.log('🔍 Checking for expired categories...')
console.log('Current time:', new Date())
console.log('Query:', { expiryDate: { lte: new Date() } })
```

### Get Help

If still stuck:
1. Check console logs (both server and browser)
2. Check database with Prisma Studio: `npx prisma studio`
3. Verify SMTP with test script: `node test-smtp.js`
4. Check all files exist and have no errors

---

**Last Updated**: December 6, 2025
