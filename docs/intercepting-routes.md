# Intercepting Routes Implementation

## Overview

This implementation uses Next.js intercepting routes to show a modal when navigating to `/accounts/new` from the accounts page, while preserving the full page experience for direct navigation.

## File Structure

```
src/app/
├── @newAccountModal/
│   ├── default.tsx              # Default slot (empty)
│   └── (.)accounts/
│       └── new/
│           └── page.tsx         # Intercepted modal route
├── accounts/
│   ├── page.tsx                 # Main accounts page
│   └── new/
│       └── page.tsx             # Standalone add account page
└── layout.tsx                   # Root layout with {newAccountModal} slot
```

## How It Works

### Modal Flow (Intercepted)

1. User on `/accounts` clicks "Add Account"
2. Navigation to `/accounts/new` is intercepted
3. Modal opens via the `@newAccountModal` slot
4. Form submission closes modal and navigates to `/accounts`

### Direct Navigation Flow

1. User goes directly to `/accounts/new` (bookmark, refresh)
2. Intercepting route doesn't trigger
3. Full standalone page is displayed

## Key Components

### InterceptedAddAccountPage (Modal)

- **Client component** with dialog state management
- Uses `useState` for open/close state
- Handles `onOpenChange` for ESC key and outside clicks
- Calls `onClose()` prop to close modal on form success

### AddAccountFormWrapper

- Accepts optional `onClose` prop for modal context
- Calls `onClose?.()` before navigation on success/cancel
- Works in both modal and standalone contexts

## Implementation Details

```tsx
// Modal component pattern
const [open, setOpen] = useState(true);

const handleOpenChange = (isOpen: boolean) => {
  if (!isOpen) {
    setOpen(false);
    router.back();
  }
};

// Form wrapper pattern
const handleSuccess = () => {
  onClose?.(); // Close modal if in modal context
  router.push('/accounts');
};
```

## Benefits

- **Seamless UX**: Modal for quick actions, full page for direct access
- **URL preservation**: Both experiences use the same URL
- **Mobile optimized**: Responsive dialog sizing
- **Proper navigation**: Handles back button and browser navigation

## Notes

- Modal is client-side rendered for state management
- Both routes must be maintained for proper fallback
- Form wrapper handles both modal and standalone contexts
