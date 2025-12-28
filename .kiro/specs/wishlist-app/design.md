# Design Document: Wishlist App

## Overview

The Wishlist App is a modern, frontend-only web application built with React, TypeScript, and Vite. It provides users with an intuitive interface to track products they want to purchase, monitor price trends through mock data, and manage their wishlist items with persistent local storage. The application features a pastel-colored design system optimized for consumer use with a dashboard-style layout.

## Architecture

### Technology Stack
- **Frontend Framework**: React 18+ with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with custom pastel theme configuration
- **Routing**: React Router v6 for client-side navigation
- **State Management**: React hooks (useState, useEffect, useContext) with custom localStorage hooks
- **Data Persistence**: Browser localStorage API
- **Charts**: Custom lightweight chart component using SVG

### Application Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI elements (Button, Card, Input)
│   ├── layout/          # Layout components (Sidebar, Header)
│   └── charts/          # Chart components
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── data/                # Mock data and generators
└── styles/              # Global styles and Tailwind config
```

## Components and Interfaces

### Core TypeScript Interfaces

```typescript
interface WishlistItem {
  id: string;
  name: string;
  currentPrice: number;
  originalPrice: number;
  priceHistory: PricePoint[];
  trend: 'up' | 'down' | 'flat';
  dateAdded: Date;
  daysTracked: number;
  productUrl?: string;
  imageUrl?: string;
}

interface PricePoint {
  date: Date;
  price: number;
}

interface AppTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
  };
}
```

### Component Architecture

#### Layout Components
- **AppLayout**: Main application wrapper with routing
- **Sidebar**: Navigation component with icons and active states, including login and cart icons
- **Header**: Top navigation bar with branding

#### UI Components
- **Button**: Reusable button with pastel styling variants
- **Card**: Product card component with rounded corners and shadows
- **Input**: Form input with pastel accent styling
- **Modal**: Overlay component for add item functionality
- **IconButton**: Reusable icon button component for navigation icons
- **LoginIcon**: SVG icon component for user authentication
- **CartIcon**: SVG icon component for shopping cart

#### Feature Components
- **WishlistGrid**: Grid layout for displaying wishlist item cards
- **WishlistCard**: Individual item display with price trend indicators
- **AddItemForm**: Form component for creating new wishlist items
- **PriceChart**: SVG-based chart for price history visualization
- **TrendIndicator**: Visual component showing price movement with colors

#### Page Components
- **LandingPage**: Welcome screen with call-to-action
- **Dashboard**: Main application interface
- **ItemDetail**: Detailed view of individual wishlist items
- **AddItem**: Modal or page for adding new items
- **LoginPlaceholder**: Placeholder interface for future login functionality
- **CartPlaceholder**: Placeholder interface for future cart functionality

## Data Models

### Local Storage Schema
```typescript
interface StorageSchema {
  wishlistItems: WishlistItem[];
  userPreferences: {
    theme: 'light' | 'dark';
    currency: string;
  };
  appMetadata: {
    version: string;
    lastUpdated: Date;
  };
}
```

### Mock Data Generation
- **Price fluctuation algorithm**: Generates realistic price changes over time
- **Trend calculation**: Determines up/down/flat status based on recent price history
- **Sample products**: Pre-populated items for demonstration

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

<function_calls>
<invoke name="prework">
<parameter name="featureName">wishlist-app

### Property Reflection

After analyzing all acceptance criteria, I identified several areas where properties can be consolidated:

**Redundancy Analysis:**
- Properties 2.2 and 2.3 can be combined into a comprehensive wishlist card rendering property
- Properties 3.3 and 3.4 can be combined into a single item creation and persistence property  
- Properties 5.1, 5.2, and 5.3 can be combined into a comprehensive localStorage round-trip property
- Properties 8.1, 8.2, 8.3, and 8.4 can be combined into a comprehensive design system consistency property
- Properties 9.1, 9.3, and 9.4 can be combined into a comprehensive routing behavior property

This consolidation reduces redundancy while maintaining comprehensive coverage of all testable requirements.

### Correctness Properties

Property 1: Responsive layout adaptation
*For any* screen size below 768px, the application layout should adapt to mobile-friendly formatting with proper touch targets and readable content
**Validates: Requirements 1.5, 2.5, 7.1, 7.2, 7.4**

Property 2: Wishlist card completeness
*For any* wishlist item, when rendered as a card, the display should include product name, current price, price trend indicator, and days tracked
**Validates: Requirements 2.2, 2.3**

Property 3: Item creation and persistence
*For any* valid wishlist item data, creating the item should both add it to the application state and store it in localStorage immediately
**Validates: Requirements 3.3, 3.4**

Property 4: Form validation consistency
*For any* invalid form input (empty strings, negative prices, whitespace-only names), the form should prevent submission and display appropriate validation feedback
**Validates: Requirements 3.6**

Property 5: Navigation behavior consistency
*For any* clickable wishlist item card, clicking should navigate to the correct item detail page with the proper URL structure
**Validates: Requirements 4.1**

Property 6: Date and duration calculations
*For any* wishlist item, the displayed date added and days tracked should accurately reflect the item's creation timestamp
**Validates: Requirements 4.3, 4.4**

Property 7: LocalStorage round-trip consistency
*For any* set of wishlist items, storing them in localStorage and then loading the application should retrieve the exact same items with all properties intact
**Validates: Requirements 5.1, 5.2, 5.3**

Property 8: LocalStorage error handling
*For any* localStorage unavailability scenario (disabled, full, or corrupted), the application should continue functioning with in-memory state and graceful degradation
**Validates: Requirements 5.4**

Property 9: Price trend calculation consistency
*For any* price history data, the calculated trend (up/down/flat) should correctly reflect the price movement direction with appropriate color coding
**Validates: Requirements 6.1, 6.2, 6.4**

Property 10: Design system consistency
*For any* UI component (buttons, cards, inputs), the styling should consistently use the pastel color palette, rounded corners, subtle shadows, and clean typography
**Validates: Requirements 2.6, 8.1, 8.2, 8.3, 8.4**

Property 11: Accessibility compliance
*For any* color combination used in the interface, the contrast ratio should meet WCAG AA standards for accessibility
**Validates: Requirements 8.5**

Property 12: Routing system integrity
*For any* navigation action (direct URL access, link clicks, browser back/forward), the application should maintain proper URL structure and render the correct page content
**Validates: Requirements 9.1, 9.3, 9.4, 9.5**

Property 13: Navigation icon consistency
*For any* navigation icon (login, cart, dashboard), the styling should consistently use the pastel design system with proper spacing and visual hierarchy
**Validates: Requirements 10.2, 11.2**

## Error Handling

### Client-Side Error Boundaries
- **Component Error Boundaries**: Wrap major sections to prevent crashes from propagating
- **Graceful Degradation**: Show fallback UI when components fail to render
- **Error Logging**: Console logging for development debugging

### Data Validation
- **Form Input Validation**: Real-time validation with user-friendly error messages
- **Type Safety**: TypeScript interfaces prevent runtime type errors
- **Data Sanitization**: Clean user inputs before storage

### Storage Error Handling
- **LocalStorage Availability**: Detect and handle disabled localStorage
- **Storage Quota**: Handle storage full scenarios gracefully
- **Data Corruption**: Validate stored data and reset if corrupted
- **Fallback Strategy**: In-memory storage when localStorage unavailable

### Network Simulation
- **Mock API Delays**: Simulate realistic loading states
- **Error States**: Mock network failures for robust error handling
- **Retry Logic**: Implement retry mechanisms for failed operations

## Testing Strategy

### Dual Testing Approach

The application will use both unit testing and property-based testing to ensure comprehensive coverage:

**Unit Tests**: Verify specific examples, edge cases, and error conditions
- Component rendering with specific props
- Form validation with known invalid inputs  
- Navigation to specific routes
- Error boundary behavior with simulated errors
- Integration between components

**Property Tests**: Verify universal properties across all inputs
- Responsive behavior across all screen sizes
- Data persistence across all valid item types
- Form validation across all possible invalid inputs
- Navigation behavior for all routes
- Design consistency across all components

### Testing Framework Configuration

**Testing Libraries**:
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing utilities
- **fast-check**: Property-based testing library for JavaScript/TypeScript
- **@testing-library/jest-dom**: Additional Jest matchers

**Property Test Configuration**:
- Minimum 100 iterations per property test
- Custom generators for WishlistItem, form data, and UI states
- Each property test tagged with: **Feature: wishlist-app, Property {number}: {property_text}**

**Test Organization**:
```
src/
├── __tests__/           # Unit tests
│   ├── components/      # Component unit tests
│   ├── hooks/          # Hook unit tests
│   └── utils/          # Utility function tests
├── __property_tests__/  # Property-based tests
│   ├── ui.properties.test.ts
│   ├── data.properties.test.ts
│   └── navigation.properties.test.ts
└── __mocks__/          # Test mocks and fixtures
```

### Mock Data Strategy

**Generators for Property Testing**:
- **WishlistItem Generator**: Creates valid items with random but realistic data
- **Price History Generator**: Generates realistic price fluctuation patterns
- **Form Data Generator**: Creates both valid and invalid form inputs
- **Viewport Size Generator**: Tests responsive behavior across screen sizes

**Static Mock Data**:
- Sample wishlist items for development and testing
- Predefined price history patterns
- Test user preferences and settings

### Accessibility Testing

**Automated Accessibility**:
- Color contrast validation in property tests
- Keyboard navigation testing
- Screen reader compatibility verification
- Focus management validation

**Manual Testing Checklist**:
- Keyboard-only navigation
- Screen reader compatibility
- High contrast mode support
- Touch target sizing on mobile devices