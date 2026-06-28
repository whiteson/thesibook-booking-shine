# 🎯 Component Planning Template

## Component: [Component Name]
**Figma Design:** [Link to Figma]
**Priority:** High/Medium/Low

---

## 📐 **PHASE 1: STRUCTURE & CONTENT**

### 1.1 Content Analysis
- [ ] **Text Content:** What text needs to be dynamic?
- [ ] **Images:** What images are needed?
- [ ] **Links:** What actions/links are required?
- [ ] **Data:** What data comes from ACF/WordPress?

### 1.2 HTML Structure Plan
```html
<!-- Planned Structure -->
<section class="component component--[type]">
    <div class="component--container">
        <div class="component__header">
            <!-- Title, subtitle, etc. -->
        </div>
        <div class="component__content">
            <!-- Main content -->
        </div>
        <div class="component__actions">
            <!-- Buttons, links -->
        </div>
    </div>
</section>
```

### 1.3 ACF Fields Needed
- [ ] `title` (Text)
- [ ] `subtitle` (Text)
- [ ] `description` (Wysiwyg)
- [ ] `image` (Image)
- [ ] `button_text` (Text)
- [ ] `button_link` (Link)
- [ ] `layout` (Select: left/right/center)
- [ ] `background_color` (Select)
- [ ] `padding` (Select)

### 1.4 Component Variations
- [ ] **Layout variations:** Left, Right, Center
- [ ] **Content variations:** With/without image, with/without button
- [ ] **Style variations:** Different colors, sizes

---

## 🎨 **PHASE 2: STYLING & POLISH**

### 2.1 Figma Measurements
- [ ] **Spacing:** Padding, margins (8px grid)
- [ ] **Typography:** Font sizes, weights, line heights
- [ ] **Colors:** Background, text, accent colors
- [ ] **Layout:** Width, height, positioning
- [ ] **Effects:** Shadows, borders, border-radius

### 2.2 CSS Classes Plan
```scss
// Base component
.component--[type] {
    // Layout & spacing
    // Background & colors
}

// Content areas
.component__header {
    // Typography
    // Spacing
}

.component__content {
    // Content styling
}

.component__actions {
    // Button styling
}

// Responsive breakpoints
@media (max-width: 768px) {
    // Mobile adjustments
}
```

### 2.3 Utility Classes to Use
- [ ] `.d-flex`, `.justify-center`, `.align-center`
- [ ] `.p-4`, `.m-4`, `.py-6`, `.px-4`
- [ ] `.fs-24`, `.font-weight-bold`, `.text-center`
- [ ] `.bg-primary`, `.text-white`, `.shadow`

### 2.4 Custom SCSS Needed
- [ ] Component-specific styles
- [ ] Figma-to-CSS mixins
- [ ] Animations/transitions
- [ ] Responsive adjustments

---

## ✅ **DEVELOPMENT CHECKLIST**

### Phase 1: Structure
- [ ] Create component PHP file
- [ ] Set up ACF fields
- [ ] Build HTML structure
- [ ] Test content rendering
- [ ] Validate HTML semantics

### Phase 2: Styling
- [ ] Apply utility classes first
- [ ] Add custom SCSS
- [ ] Test responsive design
- [ ] Add animations/transitions
- [ ] Cross-browser testing

### Phase 3: Integration
- [ ] Import in main.scss
- [ ] Test in WordPress admin
- [ ] Content editing test
- [ ] Performance check
- [ ] Documentation update

---

## 📝 **NOTES & DECISIONS**

### Design Decisions
- **Layout approach:** Flexbox/Grid
- **Responsive strategy:** Mobile-first
- **Animation style:** Subtle/pronounced
- **Color scheme:** Primary/secondary

### Technical Decisions
- **Component naming:** BEM methodology
- **CSS approach:** Utility-first + custom
- **ACF structure:** Flexible content/repeater
- **Performance:** Lazy loading, optimization

---

## 🔄 **REVIEW & ITERATION**

### Before Moving to Phase 2
- [ ] HTML structure is semantic and accessible
- [ ] ACF fields are properly configured
- [ ] Content renders correctly
- [ ] No console errors

### Before Final Approval
- [ ] Design matches Figma
- [ ] Responsive on all devices
- [ ] Performance is acceptable
- [ ] Code is clean and documented 