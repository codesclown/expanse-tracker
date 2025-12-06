# Planning Categories Feature

## Overview
The Expense Planning page now supports a category-based workflow where you can organize your planned expenses into custom categories with budget tracking.

## Key Features

### 1. **Planning Categories**
- Create custom categories for different types of planned expenses (e.g., Wedding, Vacation, Home Renovation)
- Each category has:
  - **Name**: Custom category name
  - **Icon**: Choose from 16 emoji icons
  - **Color Theme**: 8 gradient color options
  - **Expected Cost**: Total budget you expect to spend
  - **Real Cost**: Automatically calculated from actual expenses

### 2. **Category Management**
- **Create**: Add new planning categories with custom icons and colors
- **Edit**: Update category details, expected budget, icon, and color
- **Delete**: Remove categories (expenses become uncategorized)
- **Visual Progress**: See progress bars showing real cost vs expected cost

### 3. **Expense Planning**
- Add expenses to specific categories or leave them uncategorized
- Each expense has:
  - Title and description
  - Expected amount
  - Expected date
  - Optional category assignment
  - Actual amount (when completed)

### 4. **Budget Analysis**
- **Expected vs Real Cost**: Compare planned budget with actual spending per category
- **Variance Tracking**: See if you're over or under budget
- **Progress Indicators**: Visual progress bars for each category
- **Statistics Dashboard**: Overview of total categories, expenses, expected and real costs

## Workflow

1. **Create a Category**
   - Click "New Category" or the + button
   - Enter category name (e.g., "Summer Vacation")
   - Set expected budget (e.g., ₹50,000)
   - Choose an icon and color theme
   - Save

2. **Add Expenses to Category**
   - Click "Add Expense" on any category card
   - Enter expense details (title, amount, date)
   - The expense is automatically linked to that category
   - Save

3. **Track Progress**
   - Mark expenses as completed with actual amounts
   - Category's "Real Cost" updates automatically
   - See variance (over/under budget)
   - Monitor progress bar

4. **Analyze Spending**
   - View expected vs real cost for each category
   - See which categories are over/under budget
   - Track overall planning accuracy

## Database Schema

### PlanningCategory Model
```prisma
model PlanningCategory {
  id           String            @id @default(cuid())
  userId       String
  name         String
  icon         String            @default("📝")
  color        String            @default("from-blue-500 to-cyan-600")
  expectedCost Float             @default(0)
  realCost     Float             @default(0)
  expenses     ExpensePlanning[]
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
}
```

### ExpensePlanning Model (Updated)
```prisma
model ExpensePlanning {
  id           String            @id @default(cuid())
  userId       String
  categoryId   String?
  category     PlanningCategory? @relation(fields: [categoryId], references: [id])
  title        String
  amount       Float
  date         DateTime
  description  String?
  actualAmount Float?
  isCompleted  Boolean           @default(false)
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
}
```

## API Endpoints

### Planning Categories
- `GET /api/planning-categories` - List all categories with expenses
- `POST /api/planning-categories` - Create new category
- `PATCH /api/planning-categories/[id]` - Update category
- `DELETE /api/planning-categories/[id]` - Delete category

### Expense Planning (Updated)
- `GET /api/expense-planning` - List all expenses with category info
- `POST /api/expense-planning` - Create expense (with optional categoryId)
- `PATCH /api/expense-planning/[id]` - Update expense (auto-updates category real cost)
- `DELETE /api/expense-planning/[id]` - Delete expense

## UI Components

### New Components
- **PlanningCategoryModal**: Create/edit categories with icon and color selection
- **ExpensePlanningModal** (Updated): Now supports category selection

### Updated Pages
- **expense-planning/page.tsx**: Complete redesign with category-first workflow

## Benefits

1. **Better Organization**: Group related expenses together
2. **Budget Control**: Set and track budgets per category
3. **Visual Feedback**: Progress bars and variance indicators
4. **Flexibility**: Expenses can be categorized or uncategorized
5. **Accurate Planning**: Compare expected vs actual costs to improve future planning
