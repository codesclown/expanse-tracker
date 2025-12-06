# Category Expiry Date Feature - Implementation Complete

## Overview
Added expiry date functionality to planning categories with automatic inactive status management.

## Features Implemented

### 1. Expiry Date Field
- Added optional `expiryDate` field to categories
- Users can set when a category should expire
- Field is visible in both create and edit category modals

### 2. Automatic Inactive Status
Categories automatically become inactive when:
- Expiry date is set in the past during creation
- Expiry date is reached (checked on page load)
- User tries to add expense to expired category

### 3. Validation & Protection
- Cannot add new expenses to inactive categories
- Cannot add expenses to expired categories
- System shows clear error messages
- Auto-updates category status when expired

### 4. UI Indicators
- Active categories: Green "● Active" badge
- Inactive categories: Red "● Inactive" badge
- Expired categories automatically show as inactive

## Database Changes
```prisma
model PlanningCategory {
  // ... existing fields
  expiryDate   DateTime?  // NEW FIELD
  isActive     Boolean    @default(true)
  // ... rest of fields
}
```

## API Updates

### POST /api/planning-categories
- Accepts `expiryDate` parameter
- Auto-sets `isActive` based on expiry date

### GET /api/planning-categories
- Checks all categories for expiry
- Auto-updates expired categories to inactive
- Returns updated list

### PATCH /api/planning-categories/[id]
- Accepts `expiryDate` updates
- Auto-adjusts `isActive` when expiry changes

### POST /api/expense-planning
- Validates category is active before adding expense
- Checks if category has expired
- Auto-marks expired categories as inactive
- Shows appropriate error messages

## User Experience

### Creating a Category
1. Fill in category details
2. Optionally set expiry date
3. Category is active if no expiry or expiry is in future
4. Category is inactive if expiry is in past

### Adding Expenses
1. Click "Plan" button on category card
2. If category is expired → Error: "This category has expired"
3. If category is inactive → Error: "This category is inactive"
4. If category is active → Expense is added successfully

### Editing Categories
1. Click edit button on category
2. Can update expiry date
3. Status automatically adjusts based on new expiry date
4. Can manually toggle active/inactive status

## Files Modified
- `prisma/schema.prisma` - Added expiryDate field
- `src/components/PlanningCategoryModal.tsx` - Added expiry date input
- `src/app/api/planning-categories/route.ts` - Added expiry logic
- `src/app/api/planning-categories/[id]/route.ts` - Added expiry update logic
- `src/app/api/expense-planning/route.ts` - Added validation for inactive/expired categories

## Testing
1. Create a category with expiry date in future → Should be active
2. Create a category with expiry date in past → Should be inactive
3. Try adding expense to inactive category → Should show error
4. Wait for category to expire → Should auto-mark as inactive on next page load
5. Edit category to extend expiry → Should become active again

## Notes
- Expiry date is optional - categories without expiry remain active indefinitely
- System checks expiry on every page load for automatic updates
- Manual active/inactive toggle still works for categories without expiry
- Clear error messages guide users when trying to use expired categories
