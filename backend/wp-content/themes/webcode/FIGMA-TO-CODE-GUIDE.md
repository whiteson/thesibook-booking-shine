# 🚀 Figma-to-Code Workflow Guide

## Quick Start

### 1. Create New Component
```bash
# Copy template files
cp elements/component-template.php elements/your-component.php
cp assets/src/scss/elements/_component-template.scss assets/src/scss/elements/_your-component.scss
```

### 2. Import in main.scss
```scss
@import "elements/your-component";
```

### 3. Use in Template
```php
<?php include get_template_directory() . '/elements/your-component.php'; ?>
```

---

## 🎨 Figma-to-CSS Quick Reference

### Spacing (8px Grid System)
| Figma Value | CSS Class | Description |
|-------------|-----------|-------------|
| 8px | `.p-1`, `.m-1` | Extra small |
| 16px | `.p-2`, `.m-2` | Small |
| 24px | `.p-3`, `.m-3` | Medium |
| 32px | `.p-4`, `.m-4` | Large |
| 40px | `.p-5`, `.m-5` | Extra large |
| 48px | `.p-6`, `.m-6` | 2x Large |

### Font Sizes (px to rem)
| Figma px | CSS Class | rem Value |
|----------|-----------|-----------|
| 12px | `.fs-12` | 0.75rem |
| 14px | `.fs-14` | 0.875rem |
| 16px | `.fs-16` | 1rem |
| 18px | `.fs-18` | 1.125rem |
| 20px | `.fs-20` | 1.25rem |
| 24px | `.fs-24` | 1.5rem |
| 32px | `.fs-32` | 2rem |
| 40px | `.fs-40` | 2.5rem |
| 48px | `.fs-48` | 3rem |

### Colors (Your Theme)
| Color | CSS Class | Variable |
|-------|-----------|----------|
| Primary | `.bg-primary` | `var(--basic)` |
| Secondary | `.bg-secondary` | `var(--secondary)` |
| Highlight A | `.bg-highlight-a` | `var(--highlight-a)` |
| Highlight B | `.bg-highlight-b` | `var(--highlight-b)` |
| Support A | `.bg-support-a` | `var(--support-a)` |
| Support B | `.bg-support-b` | `var(--support-b)` |

### Layout Utilities
| Utility | Description |
|---------|-------------|
| `.d-flex` | Display flex |
| `.flex-column` | Flex direction column |
| `.justify-center` | Justify content center |
| `.align-center` | Align items center |
| `.w-100` | Width 100% |
| `.h-100` | Height 100% |

---

## 📐 SCSS Mixins for Figma Values

### Quick Spacing
```scss
@include figma-spacing('padding', 24, 48, 80);
// Mobile: 24px, Tablet: 48px, Desktop: 80px
```

### Quick Font Sizing
```scss
@include figma-font(24, 32, 40);
// Mobile: 24px, Tablet: 32px, Desktop: 40px
```

### Quick Colors
```scss
@include figma-color('#FF6B35');
@include figma-bg('#F8F9FA');
```

### Quick Effects
```scss
@include figma-radius(8);
@include figma-shadow(0, 4, 20, 0.1);
```

---

## 🧩 Component Patterns

### Card Component
```html
<div class="component component--card">
    <div class="component__content">
        <h3 class="component__title">Card Title</h3>
        <p class="component__description">Card description</p>
    </div>
</div>
```

### Hero Section
```html
<section class="component component--hero bg-primary">
    <div class="component--container">
        <div class="component__content text-white">
            <h1 class="component__title">Hero Title</h1>
            <p class="component__description">Hero description</p>
        </div>
    </div>
</section>
```

### Grid Layout
```html
<div class="component--grid component--grid--3">
    <div class="component--card">Item 1</div>
    <div class="component--card">Item 2</div>
    <div class="component--card">Item 3</div>
</div>
```

---

## 🎯 ACF Integration

### Field Group Template
```php
// ACF Field Group: Component Settings
// Location: Page Template is equal to [Your Template]

// Fields:
- title (Text)
- subtitle (Text) 
- description (Wysiwyg Editor)
- image (Image)
- button_text (Text)
- button_link (Link)
- background_color (Select)
  Choices: bg-primary|Primary, bg-secondary|Secondary
- text_color (Select)
  Choices: text-white|White, text-dark|Dark
- layout (Select)
  Choices: left|Left, right|Right, center|Center
- padding (Select)
  Choices: py-5|Small, py-10|Medium, py-15|Large
```

### Usage in Component
```php
<?php
$title = get_field('title') ?: 'Default Title';
$background_color = get_field('background_color') ?: 'bg-primary';
?>

<section class="component <?php echo $background_color; ?>">
    <h2><?php echo $title; ?></h2>
</section>
```

---

## ⚡ Rapid Development Workflow

### 1. Analyze Figma Design
- Extract colors, fonts, spacing
- Note layout structure
- Identify reusable patterns

### 2. Choose Base Pattern
- Card, Hero, Section, Grid
- Or create custom component

### 3. Apply Utility Classes
```html
<!-- Quick layout -->
<div class="d-flex justify-between align-center p-4">
    <h2 class="fs-32 font-weight-bold">Title</h2>
    <button class="btn btn-primary">Action</button>
</div>
```

### 4. Customize with SCSS
```scss
.your-component {
    @include figma-spacing('padding', 24, 48, 80);
    @include figma-font(24, 32, 40);
    @include figma-bg('#F8F9FA');
}
```

### 5. Add ACF Fields
- Create field group
- Map to component variables
- Test in WordPress admin

---

## 🔧 Common Figma Measurements

### Standard Spacing
- 8px (0.5rem) - Extra small
- 16px (1rem) - Small
- 24px (1.5rem) - Medium
- 32px (2rem) - Large
- 48px (3rem) - Extra large
- 64px (4rem) - 2x Large

### Standard Font Sizes
- 12px (0.75rem) - Caption
- 14px (0.875rem) - Small text
- 16px (1rem) - Body text
- 18px (1.125rem) - Large body
- 20px (1.25rem) - Subtitle
- 24px (1.5rem) - H3
- 32px (2rem) - H2
- 40px (2.5rem) - H1

### Standard Border Radius
- 4px - Small
- 8px - Medium
- 12px - Large
- 16px - Extra large
- 50% - Circle

---

## 🎨 Color Palette (Your Theme)

```scss
:root {
    --basic: rgba(70, 109, 115, 1);        // #23324E
    --secondary: rgba(244, 244, 230, 1);   // #f4f4e6
    --highlight-a: rgba(183, 113, 52, 1);  // #b77134
    --highlight-b: rgba(216, 182, 56, 1);  // #d8b638
    --support-a: rgba(223, 201, 143, 1);   // #dfc98f
    --support-b: rgba(172, 168, 161, 1);   // #aca8a1
}
```

---

## 📱 Responsive Breakpoints

```scss
// Mobile First
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1200px) { /* Large Desktop */ }
```

---

## 🚀 Tips for Speed

1. **Use utility classes first** - Quick layout and spacing
2. **Copy component templates** - Don't start from scratch
3. **Use SCSS mixins** - Convert Figma values quickly
4. **Create ACF field groups** - Reusable across components
5. **Test in browser** - Use BrowserSync for live reload
6. **Document patterns** - Create your own component library

---

## 📚 Next Steps

1. Create your first component using the template
2. Set up ACF field groups for your components
3. Build a component library for your project
4. Customize the utility classes for your design system
5. Create project-specific mixins and patterns 