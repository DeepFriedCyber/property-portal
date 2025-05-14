# Accessibility Guide for Property Portal

This guide provides best practices for ensuring that our property portal is accessible to all users, including those with disabilities.

## Table of Contents

1. [General Principles](#general-principles)
2. [Semantic HTML](#semantic-html)
3. [ARIA Attributes](#aria-attributes)
4. [Keyboard Navigation](#keyboard-navigation)
5. [Focus Management](#focus-management)
6. [Color and Contrast](#color-and-contrast)
7. [Images and Media](#images-and-media)
8. [Forms](#forms)
9. [Tables](#tables)
10. [Dynamic Content](#dynamic-content)
11. [Testing](#testing)

## General Principles

- **Perceivable**: Information must be presentable to users in ways they can perceive.
- **Operable**: User interface components must be operable by all users.
- **Understandable**: Information and operation must be understandable.
- **Robust**: Content must be robust enough to be interpreted by a variety of user agents, including assistive technologies.

## Semantic HTML

Use semantic HTML elements to provide meaning and structure to your content.

### Examples:

```jsx
// Good - Uses semantic elements
<header>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
</header>
<main>
  <section>
    <h1>Property Listings</h1>
    <article>
      <h2>Beautiful Home</h2>
    </article>
  </section>
</main>
<footer>
  <p>&copy; 2023 Property Portal</p>
</footer>

// Bad - Uses generic divs
<div class="header">
  <div class="nav">
    <div class="nav-items">
      <div><a href="/">Home</a></div>
    </div>
  </div>
</div>
```

## ARIA Attributes

ARIA (Accessible Rich Internet Applications) attributes enhance accessibility when native HTML is not sufficient.

### Key ARIA Attributes:

1. **Roles**: Define what an element is or does
   ```jsx
   <div role="button" tabIndex={0}>Click me</div>
   ```

2. **Properties**: Define properties of elements
   ```jsx
   <button aria-pressed="true">Selected</button>
   ```

3. **States**: Define the current state of an element
   ```jsx
   <div aria-expanded="false">Collapsed content</div>
   ```

4. **Landmarks**: Identify regions of a page
   ```jsx
   <div role="search">Search form here</div>
   ```

### Common ARIA Attributes:

- `aria-label`: Provides a label for objects that can be read by screen readers
- `aria-labelledby`: Identifies the element that labels the current element
- `aria-describedby`: Identifies the element that describes the current element
- `aria-required`: Indicates that user input is required
- `aria-invalid`: Indicates that the value entered is invalid
- `aria-expanded`: Indicates if a control is expanded or collapsed
- `aria-hidden`: Hides content from assistive technology
- `aria-live`: Indicates that an element will be updated dynamically

## Keyboard Navigation

Ensure all interactive elements are accessible via keyboard.

### Guidelines:

1. **Focusable Elements**: All interactive elements should be focusable with the Tab key
2. **Focus Order**: Tab order should follow a logical sequence
3. **Focus Visibility**: Focus state should be clearly visible
4. **Keyboard Shortcuts**: Provide keyboard shortcuts for common actions

### Example:

```jsx
// Ensure custom buttons are keyboard accessible
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Custom Button
</div>
```

## Focus Management

Properly manage focus, especially in dynamic applications.

### Guidelines:

1. **Modal Dialogs**: When opening a modal, trap focus inside and return focus when closed
2. **Dynamic Content**: When content changes, move focus to the new content if appropriate
3. **Skip Links**: Provide skip links to bypass navigation and go directly to main content

### Example:

```jsx
// Skip link example
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

// Later in the document
<main id="main-content">
  Content here
</main>
```

## Color and Contrast

Ensure sufficient color contrast and don't rely solely on color to convey information.

### Guidelines:

1. **Contrast Ratio**: Maintain a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text
2. **Color Independence**: Don't use color alone to convey information
3. **Focus Indicators**: Ensure focus indicators have sufficient contrast

### Example:

```jsx
// Don't rely on color alone for error states
<div className="error-message">
  <span aria-hidden="true">❌</span> Error: Form submission failed
</div>
```

## Images and Media

Provide text alternatives for non-text content.

### Guidelines:

1. **Alt Text**: All images should have appropriate alt text
2. **Decorative Images**: Decorative images should have empty alt text (`alt=""`)
3. **Complex Images**: Complex images should have detailed descriptions
4. **Video Captions**: Videos should have captions

### Example:

```jsx
// Informative image
<img 
  src="/images/property-exterior.jpg" 
  alt="Two-story colonial house with red brick exterior and white trim"
/>

// Decorative image
<img 
  src="/images/decorative-divider.png" 
  alt="" 
  role="presentation"
/>
```

## Forms

Create accessible forms with clear labels, instructions, and error messages.

### Guidelines:

1. **Labels**: All form controls should have associated labels
2. **Grouping**: Related form controls should be grouped with `fieldset` and `legend`
3. **Instructions**: Provide clear instructions for completing the form
4. **Error Messages**: Error messages should be clear and associated with the relevant field
5. **Required Fields**: Clearly indicate required fields

### Example:

```jsx
<div className="form-field">
  <label htmlFor="name" className="required-field">Name</label>
  <input 
    id="name" 
    type="text" 
    aria-required="true"
    aria-invalid={!!errors.name}
    aria-describedby="name-error"
  />
  {errors.name && (
    <div id="name-error" className="error-message" role="alert">
      {errors.name}
    </div>
  )}
</div>
```

## Tables

Use tables for tabular data with proper headers and structure.

### Guidelines:

1. **Headers**: Use `<th>` elements with `scope` attributes
2. **Captions**: Provide a caption that describes the table content
3. **Associations**: Associate data cells with headers

### Example:

```jsx
<table aria-label="Property comparison">
  <caption>Comparison of properties in downtown area</caption>
  <thead>
    <tr>
      <th scope="col">Property</th>
      <th scope="col">Price</th>
      <th scope="col">Bedrooms</th>
      <th scope="col">Bathrooms</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">123 Main St</th>
      <td>$350,000</td>
      <td>3</td>
      <td>2</td>
    </tr>
  </tbody>
</table>
```

## Dynamic Content

Ensure that dynamically updated content is accessible.

### Guidelines:

1. **ARIA Live Regions**: Use ARIA live regions for content that updates dynamically
2. **Loading States**: Provide accessible loading indicators
3. **Notifications**: Make notifications accessible to screen readers

### Example:

```jsx
// Live region for search results
<div aria-live="polite" aria-atomic="true">
  {isLoading ? (
    <p>Loading search results...</p>
  ) : (
    <p>{results.length} properties found</p>
  )}
</div>
```

## Testing

Regularly test your application for accessibility issues.

### Testing Methods:

1. **Automated Testing**: Use tools like Lighthouse, axe, or WAVE
2. **Keyboard Testing**: Navigate your application using only the keyboard
3. **Screen Reader Testing**: Test with screen readers like NVDA, JAWS, or VoiceOver
4. **User Testing**: Conduct testing with users who have disabilities

### Example Lighthouse Command:

```bash
npx lighthouse https://your-property-portal.com --view --only-categories=accessibility
```

## Accessible Components

Our property portal includes the following accessible components:

1. **AccessibleButton**: A button component with proper ARIA attributes
2. **AccessibleInput**: A form input with associated label and error handling
3. **AccessibleTable**: A table component with proper semantics
4. **AccessibleModal**: A modal dialog with focus trapping
5. **AccessibleNavigation**: A navigation menu with keyboard support
6. **AccessibleForm**: A form component with validation and error handling
7. **PropertyCard**: An accessible property listing card
8. **PropertySearchForm**: An accessible search form for properties

## Resources

- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [MDN Web Docs: Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project](https://www.a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)
- [WebAIM](https://webaim.org/)