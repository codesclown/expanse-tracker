# 🔧 Troubleshooting Guide - FinanceTracker

This guide helps you resolve common issues with database integration and email notifications.

## 🗄️ Database Issues

### Problem: "Database connection failed"

**Symptoms:**
- API calls return 500 errors
- Prisma Studio won't open
- Registration/login fails

**Solutions:**

1. **Check PostgreSQL is running:**
   ```bash
   # For local PostgreSQL
   brew services start postgresql  # macOS
   sudo service postgresql start   # Linux
   ```

2. **Verify DATABASE_URL format:**
   ```env
   # Correct format
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   
   # Common mistakes:
   # ❌ Missing protocol: username:password@localhost:5432/database_name
   # ❌ Wrong port: postgresql://username:password@localhost:3000/database_name
   # ❌ Special characters not encoded: postgresql://user@domain.com:pass@localhost:5432/db
   ```

3. **Test database connection:**
   ```bash
   npx prisma db push
   ```

4. **Reset and recreate database:**
   ```bash
   npx prisma db push --force-reset
   npx prisma generate
   ```

### Problem: "Prisma Client not generated"

**Symptoms:**
- Import errors for `@prisma/client`
- TypeScript errors about Prisma types

**Solutions:**
```bash
# Regenerate Prisma client
npx prisma generate

# If still failing, delete and regenerate
rm -rf node_modules/.prisma
npx prisma generate
```

### Problem: "Table doesn't exist"

**Symptoms:**
- Database queries fail
- Missing table errors in logs

**Solutions:**
```bash
# Push schema to database
npx prisma db push

# Or reset everything
npx prisma db push --force-reset
```

## 📧 Email Issues

### Problem: "Email sending failed"

**Symptoms:**
- No welcome emails received
- No expense alert emails
- Console shows email errors

**Solutions:**

1. **Verify Gmail 2FA is enabled:**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Check App Password format:**
   ```env
   # Correct (16 characters, no spaces)
   GMAIL_APP_PASSWORD="abcdabcdabcdabcd"
   
   # Wrong formats:
   # ❌ With spaces: "abcd abcd abcd abcd"
   # ❌ Too short: "abcdabcd"
   # ❌ Regular password: "mypassword123"
   ```

3. **Test email configuration:**
   ```bash
   # Check environment variables are loaded
   node -e "console.log(process.env.GMAIL_USER, process.env.GMAIL_APP_PASSWORD)"
   ```

4. **Generate new App Password:**
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Delete old password, generate new one
   - Update `.env.local` immediately

### Problem: "Gmail authentication failed"

**Symptoms:**
- "Invalid credentials" errors
- "Authentication failed" in logs

**Solutions:**

1. **Verify Gmail account settings:**
   - 2FA must be enabled
   - App password must be generated after 2FA
   - Account must not have security restrictions

2. **Check for typos:**
   ```env
   # Make sure email is correct
   GMAIL_USER="your-actual-email@gmail.com"
   
   # App password is exactly 16 characters
   GMAIL_APP_PASSWORD="abcdabcdabcdabcd"
   ```

3. **Test with simple email:**
   - Try with a fresh Gmail account
   - Ensure no special security policies

## 🔐 Authentication Issues

### Problem: "JWT token invalid"

**Symptoms:**
- Automatic logout
- "Unauthorized" errors
- Login doesn't persist

**Solutions:**

1. **Check JWT_SECRET:**
   ```env
   # Must be at least 32 characters
   JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"
   
   # Generate random secret:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Clear browser storage:**
   ```javascript
   // In browser console
   localStorage.clear()
   sessionStorage.clear()
   ```

3. **Restart development server:**
   ```bash
   # Stop server (Ctrl+C) and restart
   npm run dev
   ```

### Problem: "Password hashing failed"

**Symptoms:**
- Registration fails
- Login always fails
- bcrypt errors in logs

**Solutions:**

1. **Check bcrypt installation:**
   ```bash
   npm install bcryptjs
   npm install @types/bcryptjs
   ```

2. **Verify password requirements:**
   - Minimum 6 characters
   - No special encoding issues

## 🌐 API Issues

### Problem: "API routes not working"

**Symptoms:**
- 404 errors on API calls
- Network tab shows failed requests
- Forms don't submit

**Solutions:**

1. **Check API route files exist:**
   ```
   src/app/api/auth/login/route.ts
   src/app/api/auth/register/route.ts
   src/app/api/expenses/route.ts
   ```

2. **Verify export format:**
   ```typescript
   // Correct format
   export const POST = withAuth(async (request, { userId }) => {
     // handler code
   })
   
   // Wrong format
   export default function handler() { }
   ```

3. **Check middleware:**
   ```typescript
   // Ensure withAuth is imported correctly
   import { withAuth } from '@/lib/auth'
   ```

### Problem: "CORS errors"

**Symptoms:**
- Browser blocks API requests
- CORS policy errors in console

**Solutions:**

1. **Check API route headers:**
   ```typescript
   return NextResponse.json(data, {
     headers: {
       'Access-Control-Allow-Origin': '*',
       'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
       'Access-Control-Allow-Headers': 'Content-Type, Authorization',
     }
   })
   ```

## 🔄 Environment Issues

### Problem: "Environment variables not loaded"

**Symptoms:**
- `process.env.DATABASE_URL` is undefined
- Configuration not working
- API calls fail with missing config

**Solutions:**

1. **Check file name:**
   ```bash
   # Must be exactly this name
   .env.local
   
   # Not these:
   # .env
   # .env.development
   # env.local
   ```

2. **Restart development server:**
   ```bash
   # Environment changes require restart
   npm run dev
   ```

3. **Check file location:**
   ```
   project-root/
   ├── .env.local          ✅ Correct location
   ├── src/
   │   └── .env.local      ❌ Wrong location
   ```

4. **Verify syntax:**
   ```env
   # Correct
   DATABASE_URL="postgresql://user:pass@localhost:5432/db"
   
   # Wrong (no spaces around =)
   DATABASE_URL = "postgresql://user:pass@localhost:5432/db"
   ```

## 🚀 Development Issues

### Problem: "Build fails"

**Symptoms:**
- `npm run build` errors
- TypeScript compilation errors
- Missing dependencies

**Solutions:**

1. **Check TypeScript errors:**
   ```bash
   npx tsc --noEmit
   ```

2. **Install missing dependencies:**
   ```bash
   npm install
   ```

3. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run build
   ```

### Problem: "Hot reload not working"

**Symptoms:**
- Changes don't reflect
- Page doesn't update
- Development server issues

**Solutions:**

1. **Restart development server:**
   ```bash
   # Stop (Ctrl+C) and restart
   npm run dev
   ```

2. **Clear browser cache:**
   - Hard refresh (Ctrl+Shift+R)
   - Clear browser cache
   - Try incognito mode

## 🧪 Testing Your Setup

### Database Test
```bash
# Open Prisma Studio
npm run db:studio

# Should open http://localhost:5555
# You should see your database tables
```

### Email Test
1. Register a new account
2. Check your email for welcome message
3. Add an expense
4. Check for expense alert email

### API Test
1. Open browser Network tab
2. Add an expense
3. Should see successful POST to `/api/expenses`
4. Response should be 201 with expense data

### Authentication Test
1. Login with valid credentials
2. Should redirect to dashboard
3. Refresh page - should stay logged in
4. Logout - should redirect to login

## 📞 Getting Help

If you're still having issues:

1. **Check the logs:**
   ```bash
   # Development server logs
   npm run dev
   
   # Check browser console for errors
   # Check Network tab for failed requests
   ```

2. **Verify your setup:**
   ```bash
   # Run the setup script again
   node setup-database.js
   ```

3. **Create a minimal test:**
   - Try with a fresh database
   - Test with a new Gmail account
   - Use the exact environment variables from the guide

4. **Common gotchas:**
   - PostgreSQL not running
   - Wrong Gmail app password format
   - JWT_SECRET too short
   - Environment file in wrong location
   - Typos in environment variables

Remember: Most issues are configuration-related. Double-check your `.env.local` file and ensure all services (PostgreSQL, Gmail) are properly set up.