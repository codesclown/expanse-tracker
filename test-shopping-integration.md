# Shopping to Expense Integration - Testing Guide

## How It Works

When you mark a shopping item as "bought" or a shopping list item as "completed", the system automatically creates an expense entry on your dashboard.

## Testing Steps

### For Shopping Items (Shopping Page):

1. **Go to Shopping page** (`/shopping`)
2. **Create a category** (if you don't have one)
3. **Add an item** to the category:
   - Name: "Test Item"
   - Expected Price: 100
   - Quantity: 2
   - Unit: pcs

4. **Mark the item as bought**:
   - Click the checkbox or "Mark as Bought" button
   - Enter the actual price when prompted (e.g., 120)
   - Click OK

5. **Check the Dashboard** (`/dashboard`):
   - You should see a new expense: "Test Item (Shopping)"
   - Amount: ₹240 (120 × 2)
   - Category: Shopping
   - Tags: [Category Name, Shopping]

### For Shopping List Items (Shopping List Page):

1. **Go to Shopping List page** (`/shopping-list`)
2. **Add an item**:
   - Name: "Test List Item"
   - Estimated Price: 50
   - Quantity: 3
   - Category: Groceries

3. **Mark the item as completed**:
   - Click the checkbox to mark as complete

4. **Check the Dashboard** (`/dashboard`):
   - You should see a new expense: "Test List Item (Shopping List)"
   - Amount: ₹150 (50 × 3)
   - Category: Groceries
   - Tags: [Shopping List, Groceries]

## Important Notes

1. **Expense is created only ONCE** - When you first mark an item as bought/completed
2. **If you unmark and re-mark** - No duplicate expense is created
3. **Amount calculation** - Actual Price × Quantity (for shopping items) or Estimated Price × Quantity (for shopping list)
4. **Check browser console** - If expenses aren't appearing, open Developer Tools (F12) and check the Console tab for any error messages

## Troubleshooting

### If expenses are not showing up:

1. **Check browser console** (F12 → Console tab):
   - Look for error messages when marking items as bought
   - Look for "Creating expense for shopping item:" log messages

2. **Check server logs**:
   - If running in development, check your terminal for console.log messages
   - Look for "Expense created successfully:" messages

3. **Verify the item wasn't already marked as bought**:
   - The system only creates an expense on the FIRST time you mark it as bought
   - If you previously marked it as bought, no new expense will be created

4. **Check if actual price was entered**:
   - For shopping items, you must enter an actual price when marking as bought
   - If you cancel the prompt, no expense is created

5. **Refresh the dashboard**:
   - After marking an item as bought, go to the dashboard and refresh the page
   - The expense should appear in the recent expenses list

## Database Check

If you want to verify directly in the database:

```sql
-- Check recent expenses
SELECT * FROM "Expense" 
WHERE "title" LIKE '%Shopping%' 
ORDER BY "createdAt" DESC 
LIMIT 10;

-- Check shopping items
SELECT id, name, "isBought", "actualPrice", quantity 
FROM "ShoppingItem" 
ORDER BY "updatedAt" DESC 
LIMIT 10;
```

## Code Locations

- Shopping Items API: `src/app/api/shopping-items/[id]/route.ts`
- Shopping List API: `src/app/api/shopping-list/[id]/route.ts`
- Shopping Page: `src/app/shopping/page.tsx`
- Shopping List Page: `src/app/shopping-list/page.tsx`
