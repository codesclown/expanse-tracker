# Complete Planning Categories System

## Overview
A comprehensive expense planning system with time-based categories, budget tracking, and export functionality.

## Features

### 1. **Category Types**

#### General Category
- No time restrictions
- Can add expenses anytime
- Always active

#### Festival Category
- For festivals and special events
- Can set start date
- Tracks festival-specific expenses

#### Single Day Category
- Expenses restricted to a specific day
- System validates that expense date matches category date
- Auto-expires after the day ends

#### Monthly Category
- Expenses restricted to a specific month
- System validates month and year
- Auto-expires after month ends

#### Yearly Category
- Expenses restricted to a specific year
- System validates year
- Auto-expires after year ends

#### Time Duration Category
- Custom date range (start date to end date)
- Expenses must fall within the range
- Auto-expires after end date

### 2. **Category Management**

#### Create Category
- Name, icon (16 options), color theme (8 gradients)
- Select category type
- Set expected budget
- Define time constraints based on type
- Categories are active by default

#### Edit Category
- Update all category details
- Modify expected budget
- Change time constraints
- Toggle active status

#### Delete Category
- Removes category
- Expenses become uncategorized
- Confirmation required

### 3. **Date Validation**

The system automatically validates expense dates based on category type:

- **Day**: Expense date must match the category's specific day
- **Month**: Expense must be in the same month and year
- **Year**: Expense must be in the same year
- **Duration**: Expense must fall between start and end dates
- **Festival**: Flexible, but typically within event timeframe

Error messages guide users when dates don't match category constraints.

### 4. **Category Status Tracking**

#### Active Status
- Green indicator: Category is currently active
- Can add new expenses
- Included in statistics

#### Expired Status
- Red indicator: Category time period has passed
- Cannot add new expenses (validation fails)
- Still visible for historical tracking

### 5. **Budget Analysis**

Each category tracks:
- **Expected Cost**: Planned budget
- **Real Cost**: Actual spending (auto-calculated from completed expenses)
- **Variance**: Difference (over/under budget)
- **Progress**: Visual progress bar showing spending vs budget
- **Expense Count**: Number of expenses in category

### 6. **Category Details View**

Click any category card to open detailed view showing:
- Category summary with all metrics
- Budget progress visualization
- Time period information
- Complete list of all expenses
- Edit/delete actions for each expense
- Export options

### 7. **Export Functionality**

#### PDF Export
- Professional formatted report
- Category summary with all metrics
- Table of all expenses
- Downloadable PDF file

#### Excel Export
- CSV format for spreadsheet applications
- Category details and expense list
- Easy to import into Excel/Google Sheets

#### Email Export
- Beautiful HTML email
- Sent to user's registered email
- Includes all category and expense details
- Professional formatting with colors

### 8. **Expense Management**

#### Add Expense
- Select category (optional)
- System validates date against category constraints
- Shows error if date doesn't match category type
- Auto-links to category

#### Complete Expense
- Mark as completed with actual amount
- Auto-updates category's real cost
- Recalculates variance

#### Edit/Delete Expense
- Available from category details view
- Updates category metrics automatically

## User Workflow

### Planning a Wedding (Example)

1. **Create Category**
   - Name: "Wedding 2024"
   - Type: Duration
   - Start Date: Jan 1, 2024
   - End Date: Dec 31, 2024
   - Expected Cost: ₹500,000
   - Icon: 💍
   - Color: Purple gradient

2. **Add Expenses**
   - Venue booking: ₹150,000 (June 15)
   - Catering: ₹200,000 (June 15)
   - Photography: ₹50,000 (June 15)
   - Decorations: ₹75,000 (June 14)
   - All dates validated to be within 2024

3. **Track Progress**
   - View category card showing:
     - Expected: ₹500,000
     - Real Cost: ₹0 (until expenses completed)
     - Progress bar
     - Active status

4. **Complete Expenses**
   - Mark venue as completed: ₹155,000 (actual)
   - Real cost updates to ₹155,000
   - Variance shows +₹5,000 (over budget on venue)

5. **Export Report**
   - Click category to open details
   - Click Export → PDF
   - Download complete wedding expense report
   - Or email to yourself/partner

### Monthly Budget (Example)

1. **Create Category**
   - Name: "January 2024 Budget"
   - Type: Month
   - Month: January 2024
   - Expected Cost: ₹50,000

2. **Add Expenses**
   - Only expenses dated in January 2024 are accepted
   - System rejects expenses from other months
   - Helps maintain monthly discipline

3. **Monitor**
   - See real-time progress
   - Get warnings when approaching budget
   - Category auto-expires after January

## Technical Implementation

### Database Schema
```prisma
model PlanningCategory {
  id           String
  userId       String
  name         String
  icon         String
  color        String
  type         String  // general, festival, day, month, year, duration
  expectedCost Float
  realCost     Float
  startDate    DateTime?
  endDate      DateTime?
  isActive     Boolean
  expenses     ExpensePlanning[]
}
```

### API Endpoints

#### Categories
- `GET /api/planning-categories` - List all categories
- `POST /api/planning-categories` - Create category
- `PATCH /api/planning-categories/[id]` - Update category
- `DELETE /api/planning-categories/[id]` - Delete category

#### Expenses (Enhanced)
- `POST /api/expense-planning` - Create expense (with date validation)
- Date validation logic checks category type and constraints

#### Export
- `POST /api/category-export/email` - Send category report via email

### Components

1. **PlanningCategoryModal** - Create/edit categories with type selection
2. **CategoryDetailsModal** - View category details and expenses
3. **ExpensePlanningModal** - Add expenses with category selection
4. **Export Utilities** - PDF, Excel, Email generation

## Benefits

1. **Better Organization**: Group expenses by purpose and timeframe
2. **Budget Control**: Set and track budgets per category
3. **Time Management**: Ensure expenses are recorded in correct periods
4. **Automatic Validation**: System prevents date mismatches
5. **Historical Tracking**: See expired categories for past events
6. **Professional Reports**: Export for sharing or record-keeping
7. **Flexibility**: Multiple category types for different needs
8. **Visual Feedback**: Progress bars, status indicators, color coding

## Best Practices

1. **Use Appropriate Types**: Choose category type that matches your planning needs
2. **Set Realistic Budgets**: Base expected costs on research
3. **Regular Updates**: Mark expenses as completed with actual amounts
4. **Review Variance**: Learn from over/under budget patterns
5. **Export Reports**: Keep records of major expense categories
6. **Archive Old Categories**: Keep expired categories for reference
7. **Plan Ahead**: Create categories before events/periods start
