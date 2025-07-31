# Recipe & Meal Planning Feature

## Overview

The Recipe & Meal Planning feature helps users connect their grocery shopping to specific recipes, reducing food waste and improving budget planning. Users can create recipes, link ingredients to products, and seamlessly add recipe ingredients to their shopping lists.

## Core Functionality

### 1. Recipe Management

**Create & Edit Recipes:**

- Recipe name and description
- Serving size information
- Prep and cook time estimates
- Optional media links (cooking videos, articles)
- Future: embedded video content

**Recipe Organization:**

- Tagging system for categorization (e.g., "quick meals", "vegetarian", "budget-friendly")
- Search and filter recipes
- Personal recipe collection

### 2. Ingredient Management

**Flexible Ingredient System:**

- Link ingredients to existing products in the database
- Custom ingredient names for items not yet in the product database
- Quantity and unit specifications (cups, grams, pieces, etc.)
- Additional notes (diced, fresh, optional, etc.)
- Ingredient ordering for recipe display

**Smart Product Linking:**

- Auto-suggest products when adding ingredients
- Create new products from recipe ingredients
- Price estimation based on product history

### 3. Shopping Integration

**Recipe to Shopping List:**

- One-click addition of all recipe ingredients to planned purchases
- Bulk ingredient selection for partial recipe shopping
- Quantity adjustment based on serving size scaling

**Shopping Context:**

- View which recipe an item is for when looking at shopping lists
- Multiple recipes can share the same ingredient
- Recipe context helps users remember why they added items

### 4. Cost Analysis

**Recipe Costing:**

- Calculate total recipe cost based on ingredient prices
- Cost per serving calculations
- Compare cooking vs. eating out expenses
- Track recipe cost changes over time

**Budget Integration:**

- Recipe costs contribute to grocery budget tracking
- Meal planning helps predict monthly grocery expenses
- Cost-conscious recipe recommendations

## User Experience

### Recipe Creation Flow

1. **Basic Info:** Enter recipe name, description, servings
2. **Add Ingredients:** Search products or add custom ingredients with quantities
3. **Optional Details:** Add prep/cook time, media links, tags
4. **Save & Use:** Recipe is ready for meal planning and shopping

### Shopping Flow

1. **Plan Meals:** Browse recipes and select meals for the week
2. **Add to List:** Click "Add to Shopping List" for selected recipes
3. **Smart Shopping:** See recipe context when viewing grocery items
4. **Shop Efficiently:** Check off items knowing exactly what they're for

### Recipe Discovery

- **Personal Collection:** All user-created recipes in one place
- **Recent Recipes:** Quick access to frequently used recipes
- **Cost-Effective:** Filter recipes by estimated cost per serving
- **Quick Meals:** Filter by prep time for busy days

## Technical Implementation

### Data Model Relationships

```
Recipe -> RecipeIngredient -> Product
       -> PlannedItem (shopping list)
       -> RecipeTag (categorization)
```

### Key Features

- **Cascade Deletion:** Removing recipes cleans up ingredients
- **Flexible Linking:** Ingredients can exist without product links
- **Extensible Tags:** Color-coded category system
- **Media Support:** URL storage for external content

### API Endpoints

```
GET /api/recipes              # List user recipes
POST /api/recipes             # Create recipe
GET /api/recipes/[id]         # Get recipe details
PUT /api/recipes/[id]         # Update recipe
DELETE /api/recipes/[id]      # Delete recipe

POST /api/recipes/[id]/shop   # Add ingredients to shopping list
GET /api/recipes/tags         # Get available tags
```

## Mobile-First Design

### Recipe Cards

- Compact recipe overview with cost and time info
- Quick action buttons for shopping and viewing
- Tag indicators and difficulty ratings

### Ingredient Lists

- Mobile-optimized ingredient entry
- Quantity picker with common units
- Product search with autocomplete

### Shopping Integration

- Recipe context badges on shopping items
- Bulk selection for recipe ingredients
- Progress tracking for recipe completion

## Future Enhancements

### Phase 2: Enhanced Media

- **Video Embedding:** Native video player for cooking instructions
- **Image Support:** Recipe photos and step-by-step images
- **Voice Instructions:** Audio-guided cooking

### Phase 3: Smart Features

- **Meal Planning Calendar:** Weekly/monthly meal planning grid
- **Seasonal Suggestions:** Recipes based on ingredient availability/price
- **Nutrition Integration:** Calorie and nutrient tracking
- **Social Features:** Share recipes with household members

### Phase 4: Advanced Analytics

- **Cooking Frequency:** Track most-used recipes
- **Cost Trends:** Monitor recipe cost changes over time
- **Waste Reduction:** Suggest recipes based on leftover ingredients
- **Budget Optimization:** Recommend cost-effective meal combinations

## Benefits

### For Users

- **Never Forget:** Remember why you added grocery items
- **Better Planning:** Organize meals and shopping efficiently
- **Cost Awareness:** Understand the true cost of home cooking
- **Reduce Waste:** Buy exactly what you need for planned meals

### For Budget Management

- **Predictable Costs:** Plan grocery expenses with recipe costing
- **Smart Comparisons:** Compare cooking vs. eating out
- **Bulk Benefits:** Optimize shopping for multiple recipes
- **Historical Tracking:** Monitor cooking expenses over time

---

This feature bridges the gap between meal planning and financial management, making grocery shopping more intentional and budget-conscious.
