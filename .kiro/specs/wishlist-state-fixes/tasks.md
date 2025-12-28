# Implementation Plan: Wishlist State Management Fixes

## Overview

This implementation plan addresses critical state management issues by properly integrating the useWishlist hook with the Dashboard component and fixing ProductSearch button functionality. The tasks are organized to fix the most critical issues first, then add comprehensive testing.

## Tasks

- [x] 1. Fix Dashboard useWishlist Hook Integration
  - Refactor Dashboard component to use useWishlist hook's addItem method instead of direct API calls
  - Remove manual isSubmitting state management from Dashboard
  - Update handleAddItem to use hook's addItem method and error handling
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ]* 1.1 Write property test for Dashboard hook integration
  - **Property 1: Dashboard Hook Integration**
  - **Validates: Requirements 1.1, 1.2, 1.3**

- [x] 2. Fix ProductSearch Event Handling
  - Fix event propagation issues in ProductSearch component
  - Ensure both card clicks and button clicks trigger onSelectProduct correctly
  - Add proper stopPropagation to prevent event conflicts
  - _Requirements: 2.1, 2.3, 2.4_

- [ ]* 2.1 Write property test for ProductSearch event handling
  - **Property 2: ProductSearch Event Handling**
  - **Validates: Requirements 2.1, 2.3, 2.4**

- [x] 3. Fix AddItemModal State Transitions
  - Ensure proper state transitions when product is selected from search
  - Verify pre-filled data is correctly passed to AddItemForm
  - Test modal view switching between search and manual entry
  - _Requirements: 2.2_

- [ ]* 3.1 Write property test for modal state transitions
  - **Property 3: Modal State Transitions**
  - **Validates: Requirements 2.2**

- [x] 4. Checkpoint - Test Basic Functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Enhance useWishlist Hook as Single Source of Truth
  - Verify all components use useWishlist hook for data operations
  - Remove any remaining direct API calls from components
  - Ensure consistent data across all hook consumers
  - _Requirements: 3.1, 3.2, 3.4_

- [ ]* 5.1 Write property test for hook as single source of truth
  - **Property 4: Hook as Single Source of Truth**
  - **Validates: Requirements 3.1, 3.2, 3.4**

- [x] 6. Fix Collection Count Updates
  - Ensure collection item counts are updated after item operations
  - Implement proper collection refresh after successful operations
  - Maintain data consistency between items and collections
  - _Requirements: 3.3_

- [ ]* 6.1 Write property test for collection count consistency
  - **Property 5: Collection Count Consistency**
  - **Validates: Requirements 3.3**

- [x] 7. Implement Comprehensive Error Handling
  - Ensure errors from useWishlist hook are displayed in Dashboard UI
  - Implement proper error clearing mechanisms
  - Add retry functionality for network errors
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ]* 7.1 Write property test for error handling consistency
  - **Property 6: Error Handling Consistency**
  - **Validates: Requirements 4.1, 4.2, 4.4**

- [ ]* 7.2 Write property test for network error recovery
  - **Property 7: Network Error Recovery**
  - **Validates: Requirements 4.3**

- [x] 8. Integration Testing and Validation
  - Test complete user flow from product search to wishlist addition
  - Verify real-time UI updates without page refresh
  - Validate error scenarios and recovery mechanisms
  - _Requirements: All_

- [ ]* 8.1 Write integration tests for complete user flows
  - Test end-to-end scenarios from search to addition
  - Validate state consistency across components

- [x] 9. Final Checkpoint - Ensure all tests pass
  - **COMPLETED**: Fixed critical database binding error in wishlist item creation
  - **Root Cause**: HttpUrl objects from Pydantic were not being converted to strings before database insertion
  - **Solution**: Added proper URL string conversion in create and update routes
  - **Verification**: Backend API now successfully creates wishlist items with URLs
  - **Status**: Core functionality restored - products can now be added to wishlist successfully

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Focus on fixing the most critical state management issues first