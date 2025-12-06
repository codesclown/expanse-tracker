# Shopping Category Expiry Feature

## Overview
Shopping categories now support expiry dates. When a category expires:
- It's automatically marked as inactive
- Users cannot add new items to it
- An email with the shopping bill is sent to the user

## Features Added

### 1. Database Schema
- Added `expiryDate` field to `ShoppingCategory` model
- Migration applied: `20251206170715_add_expiry_to_shopping_category`

### 2. UI Updates
- **ShoppingCategoryModal**: Added expiry date picker field
- **Shopping Page**: 
  - Shows expiry status badge (Active/Expired)
  - Displays expiry date with countdown
  - Disables "Add Item" button for expired categories
  - Visual indicators (red border, grayscale effect) for expired categories

### 3. Automatic Expiry Check
- Script: `scripts/check-expired-shopping.js`
- Checks for expired categories daily
- Marks them as inactive
- Sends email with shopping bill attachment

## Usage

### Setting Expiry Date
1. Create or edit a shopping category
2. Set the "Expiry Date" field (optional)
3. Category will auto-expire on that date

### Running Expiry Check Manually
```bash
npm run check-expired-shopping
```

### Setting Up Cron Job (Production)

#### Linux/Mac (crontab)
```bash
# Edit crontab
crontab -e

# Add this line to run daily at midnight
0 0 * * * cd /path/to/your/app && npm run check-expired-shopping >> /var/log/shopping-expiry.log 2>&1
```

#### Windows (Task Scheduler)
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Daily at midnight
4. Action: Start a program
5. Program: `node`
6. Arguments: `scripts/check-expired-shopping.js`
7. Start in: Your app directory

#### Docker/PM2
```bash
# Using PM2 cron
pm2 start scripts/check-expired-shopping.js --cron "0 0 * * *" --no-autorestart
```

## Email Notification
When a category expires, users receive an email with:
- Category name and details
- Complete shopping bill (PDF attachment)
- List of all items (bought and pending)
- Cost summary (expected vs actual)

## API Updates
The shopping category API routes now handle the `expiryDate` field:
- `POST /api/shopping-categories` - Create with expiry date
- `PATCH /api/shopping-categories/[id]` - Update expiry date

## Testing
1. Create a category with expiry date set to tomorrow
2. Wait for the date or manually run: `npm run check-expired-shopping`
3. Check that:
   - Category is marked inactive
   - "Add Item" button is disabled
   - Email is sent with bill attachment

## Notes
- Expiry date is optional
- Categories without expiry date never expire automatically
- Users can manually reactivate expired categories by editing them
- Expiry check runs once daily (configure cron as needed)
