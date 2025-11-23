# Help Button Component Structure

This folder contains the refactored Help Button component, organized into smaller, maintainable modules.

## Component Architecture

### Main Component
- **`helpButton.jsx`** - Main entry point that orchestrates all sub-components and manages top-level state

### UI Components
- **`HelpRequestModal.jsx`** - Modal container and form structure
- **`LocationSection.jsx`** - Location input (GPS or manual address)
- **`ProblemDetailsSection.jsx`** - Problem type, description, and priority selection
- **`ImageUpload.jsx`** - Image upload with preview
- **`PaymentSection.jsx`** - Optional payment amount and currency
- **`ErrorMessage.jsx`** - Reusable error message components (global & inline)

### Custom Hooks
- **`useLocation.js`** - Handles geolocation logic and state
- **`useImageUpload.js`** - Manages image selection, validation, and preview

### Services
- **`requestService.js`** - API calls and utility functions (geocoding, request creation, image conversion)

## Benefits of This Structure

1. **Separation of Concerns** - Each component has a single, well-defined responsibility
2. **Reusability** - Components and hooks can be reused in other parts of the application
3. **Maintainability** - Easier to locate and fix bugs in isolated components
4. **Testability** - Smaller components are easier to unit test
5. **Readability** - Clear component names make the codebase self-documenting
6. **Scalability** - Easy to extend or modify individual features without affecting others

## Usage

```jsx
import HelpButton from './components/helpButton/helpButton';

<HelpButton onRequestCreated={(request) => console.log(request)} />
```
