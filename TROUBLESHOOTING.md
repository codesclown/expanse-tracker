# Troubleshooting Guide

## "Invalid request" Error on Registration

### Problem
You see "Invalid request" error when trying to register.

### Causes & Solutions

#### 1. Database Not Set Up (Most Common)

**Symptom**: Error on registration/login

**Solution**: The app works without a database! Just use local storage mode.

**How to fix**:
1. Ignore the error message
2. The app will automatically use local storage
3. You'll be redirected to dashboard after 2 seconds
4. All data will be saved in your browser

**To use database** (optional):
```bash
# 1. Install PostgreSQL
# 2. Create database
createdb expense_tracker

# 3. Add to .env.local
DATABASE_URL="postgresql://username:password@localhost:5432/expense_tracker"

# 4. Run migrations
npm run db:push
npm run db:generate

# 5. Restart server
npm run dev
```

#### 2. Salary Field Issue

**Symptom**: Error specifically mentions salary

**Solution**: Leave salary field empty or enter a valid number

**Valid inputs**:
- Empty (leave blank)
- Numbers only: 50000, 100000, etc.
- No commas or special characters

#### 3. Password Too Short

**Symptom**: Error on registration

**Solution**: Use at least 6 characters for password

#### 4. Email Format

**Symptom**: Error on registration

**Solution**: Use valid email format
- ✅ user@example.com
- ❌ user@example
- ❌ user.example.com

## Common Issues

### 1. Can't See Data After Registration

**Solution**:
- Check browser console (F12)
- Data is in localStorage
- Refresh the page
- Try adding an expense

### 2. "Unauthorized" Error

**Solution**:
- Logout and login again
- Clear browser cache
- Check if token is in localStorage (F12 → Application → Local Storage)

### 3. Dashboard Shows No Data

**Solution**:
- Add some expenses first
- Add income to see Smart Score
- Data persists in browser localStorage

### 4. Subscription Detection Not Working

**Solution**:
- Add at least 2 similar expenses
- Make them ~30 days apart
- Click "Auto-Detect Subscriptions" button
- Example:
  - Expense 1: "Netflix" ₹500 on Jan 1
  - Expense 2: "Netflix" ₹500 on Feb 1

### 5. Smart Score Shows 0

**Solution**:
- Add income first (required for calculation)
- Add some expenses
- Score = (Income - Expense) / Income * 100

### 6. Chat Not Responding

**Solution**:
- Check if you have expenses/income added
- Try simpler questions
- Refresh the page

## Development Issues

### Port Already in Use

```bash
# Use different port
npm run dev -- -p 3001
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Prisma Errors

```bash
# Regenerate Prisma client
npm run db:generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
npm run db:push
```

### TypeScript Errors

```bash
# Check for errors
npm run build

# Fix common issues
rm -rf .next
npm run dev
```

## Browser Issues

### Clear Cache

1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### Clear localStorage

1. Open DevTools (F12)
2. Go to Application tab
3. Click Local Storage → http://localhost:3000
4. Right-click → Clear

### Supported Browsers

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Database Issues

### Connection Failed

**Check**:
1. PostgreSQL is running
2. DATABASE_URL is correct
3. Database exists
4. User has permissions

**Test connection**:
```bash
psql -d expense_tracker
```

### Migration Errors

```bash
# Force push schema
npm run db:push -- --force-reset

# Or create new migration
npx prisma migrate dev --name init
```

## API Issues

### 404 Not Found

**Check**:
- API route file exists in `src/app/api/`
- File is named `route.ts`
- Export is `export async function POST/GET`

### 500 Internal Server Error

**Check**:
- Server logs in terminal
- Database connection
- Environment variables

### CORS Errors

**Solution**: Not needed for Next.js (same origin)

## Performance Issues

### Slow Loading

**Solutions**:
- Clear browser cache
- Check network tab (F12)
- Reduce number of expenses
- Use API mode instead of localStorage

### High Memory Usage

**Solutions**:
- Clear old data
- Export and delete old expenses
- Use database mode

## Data Issues

### Lost Data

**localStorage mode**:
- Data is in browser only
- Clearing cache = losing data
- Export regularly

**API mode**:
- Data is in database
- Survives browser clear
- Backup database regularly

### Duplicate Data

**Solution**:
- Delete duplicates manually
- Check for multiple accounts
- Clear localStorage and start fresh

## Still Having Issues?

### Check Logs

**Browser Console**:
```
F12 → Console tab
Look for red errors
```

**Server Logs**:
```
Check terminal where npm run dev is running
Look for error messages
```

### Debug Mode

Add to `.env.local`:
```env
NODE_ENV=development
DEBUG=true
```

### Get Help

1. Check browser console for errors
2. Check server terminal for errors
3. Note exact error message
4. Note steps to reproduce
5. Check if database is set up

## Quick Fixes

### Reset Everything

```bash
# 1. Stop server (Ctrl+C)

# 2. Clear browser data
# F12 → Application → Clear storage

# 3. Delete node_modules
rm -rf node_modules .next

# 4. Reinstall
npm install

# 5. Restart
npm run dev
```

### Start Fresh

```bash
# 1. Clear localStorage (F12 → Application)

# 2. Register new account

# 3. Add test data

# 4. Check if working
```

## Prevention

### Best Practices

1. **Regular Backups**: Export data weekly
2. **Use Database**: For important data
3. **Test First**: Try with sample data
4. **Update Regularly**: Keep dependencies updated
5. **Monitor Logs**: Check for errors

### Recommended Setup

**For Testing**:
- Use localStorage mode
- No database needed
- Quick and easy

**For Production**:
- Set up PostgreSQL
- Use API mode
- Regular backups
- Monitor errors

## Success Checklist

- ✅ App loads at http://localhost:3000
- ✅ Can register/login
- ✅ Can add expenses
- ✅ Can add income
- ✅ Dashboard shows data
- ✅ Smart Score calculates
- ✅ Chat responds
- ✅ Subscriptions detect

If all checked, you're good to go! 🎉
