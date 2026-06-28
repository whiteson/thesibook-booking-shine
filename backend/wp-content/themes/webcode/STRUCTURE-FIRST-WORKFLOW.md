# 🏗️ Structure-First Development Workflow

## Overview
This workflow prioritizes **content structure** before **visual styling**, ensuring:
- ✅ Semantic, accessible HTML
- ✅ Content-first approach
- ✅ Faster iteration
- ✅ Better maintainability
- ✅ Easier testing

---

## 📋 **STEP-BY-STEP WORKFLOW**

### **STEP 1: Planning & Analysis** (5-10 minutes)

#### 1.1 Analyze Figma Design
```markdown
- [ ] Identify content hierarchy (H1, H2, H3, etc.)
- [ ] List all text content that needs to be dynamic
- [ ] Note images, buttons, and interactive elements
- [ ] Determine layout structure (grid, flexbox, etc.)
- [ ] Plan responsive behavior
```

#### 1.2 Content Strategy
```markdown
- [ ] What content comes from ACF?
- [ ] What content is static?
- [ ] What variations are needed?
- [ ] What fallbacks are required?
```

#### 1.3 Technical Planning
```markdown
- [ ] Choose component template (card, hero, section, etc.)
- [ ] Plan ACF field structure
- [ ] Decide on naming conventions
- [ ] Plan responsive breakpoints
```

---

### **STEP 2: Structure Development** (15-30 minutes)

#### 2.1 Create Component File
```bash
# Copy template
cp elements/component-template.php elements/my-component.php

# Create SCSS file
touch assets/src/scss/elements/_my-component.scss
```

#### 2.2 Build HTML Structure
```php
<?php
// 1. Define ACF fields with fallbacks
$title = get_field('title') ?: 'Default Title';
$description = get_field('description') ?: 'Default description';
$image = get_field('image');
$button_text = get_field('button_text') ?: 'Learn More';
$button_link = get_field('button_link') ?: '#';
?>

<!-- 2. Build semantic HTML structure -->
<section class="my-component">
    <div class="component--container">
        <div class="my-component__content">
            <h2 class="my-component__title"><?php echo $title; ?></h2>
            <div class="my-component__description">
                <?php echo $description; ?>
            </div>
            <?php if ($button_text && $button_link): ?>
            <div class="my-component__actions">
                <a href="<?php echo $button_link; ?>" class="btn btn-primary">
                    <?php echo $button_text; ?>
                </a>
            </div>
            <?php endif; ?>
        </div>
    </div>
</section>
```

#### 2.3 Add Basic Utility Classes
```html
<!-- Add utility classes for basic layout -->
<section class="my-component d-flex align-center py-6">
    <div class="component--container">
        <div class="row">
            <div class="col-lg-6">
                <div class="my-component__content">
                    <h2 class="my-component__title fs-32 font-weight-bold mb-4">
                        <?php echo $title; ?>
                    </h2>
                    <div class="my-component__description lh-1-6 mb-4">
                        <?php echo $description; ?>
                    </div>
                    <div class="my-component__actions">
                        <a href="<?php echo $button_link; ?>" class="btn btn-primary">
                            <?php echo $button_text; ?>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
```

#### 2.4 Test Structure
```markdown
- [ ] Content renders correctly
- [ ] ACF fields work
- [ ] HTML is semantic
- [ ] No console errors
- [ ] Basic layout works
```

---

### **STEP 3: ACF Integration** (10-15 minutes)

#### 3.1 Create Field Group
```php
// ACF Field Group: My Component Settings
// Location: Page Template is equal to [Your Template]

// Fields:
- title (Text)
- description (Wysiwyg Editor)
- image (Image)
- button_text (Text)
- button_link (Link)
- layout (Select: left|right|center)
- background_color (Select: bg-primary|bg-secondary)
- padding (Select: py-4|py-6|py-8)
```

#### 3.2 Test ACF Integration
```markdown
- [ ] Fields appear in WordPress admin
- [ ] Content saves and loads correctly
- [ ] Fallbacks work when fields are empty
- [ ] All variations function properly
```

---

### **STEP 4: Basic Styling** (10-15 minutes)

#### 4.1 Apply Utility Classes
```html
<!-- Use utility classes for immediate visual improvement -->
<section class="my-component bg-primary text-white py-8">
    <div class="component--container">
        <div class="row align-center">
            <div class="col-lg-6 text-center text-lg-left">
                <div class="my-component__content">
                    <h2 class="my-component__title fs-40 font-weight-bold mb-4">
                        <?php echo $title; ?>
                    </h2>
                    <div class="my-component__description fs-18 lh-1-6 mb-6">
                        <?php echo $description; ?>
                    </div>
                    <div class="my-component__actions">
                        <a href="<?php echo $button_link; ?>" class="btn btn-secondary btn-lg">
                            <?php echo $button_text; ?>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
```

#### 4.2 Test Basic Styling
```markdown
- [ ] Component looks decent with utilities
- [ ] Responsive behavior works
- [ ] Colors and typography are readable
- [ ] Spacing is appropriate
```

---

### **STEP 5: Custom Styling** (20-40 minutes)

#### 5.1 Create SCSS File
```scss
// assets/src/scss/elements/_my-component.scss

.my-component {
    // Use Figma measurements with mixins
    @include figma-spacing('padding', 60, 80, 120);
    @include figma-bg('#F8F9FA');
    
    &__content {
        .my-component__title {
            @include figma-font(32, 40, 48);
            @include figma-color('#2C3E50');
            font-weight: bold;
            margin-bottom: 1.5rem;
        }
        
        .my-component__description {
            @include figma-font(18, 20, 22);
            line-height: 1.6;
            margin-bottom: 2rem;
            @include figma-color('#6C757D');
        }
        
        .my-component__actions {
            .btn {
                @include figma-spacing('padding', 12, 16, 20);
                @include figma-radius(8);
                @include figma-shadow(0, 4, 12, 0.15);
                transition: all 0.3s ease;
                
                &:hover {
                    transform: translateY(-2px);
                    @include figma-shadow(0, 8, 20, 0.2);
                }
            }
        }
    }
    
    // Responsive adjustments
    @media (max-width: 768px) {
        .my-component__content {
            text-align: center;
        }
    }
}
```

#### 5.2 Import in main.scss
```scss
// assets/src/scss/main.scss
@import "elements/my-component";
```

#### 5.3 Test Custom Styling
```markdown
- [ ] Design matches Figma
- [ ] Responsive design works
- [ ] Animations/transitions work
- [ ] Cross-browser compatibility
- [ ] Performance is acceptable
```

---

### **STEP 6: Polish & Optimization** (10-20 minutes)

#### 6.1 Add Animations
```scss
.my-component {
    // Add entrance animations
    &.component--animate {
        animation: fadeInUp 0.6s ease-out;
    }
    
    // Add hover effects
    &__content {
        transition: transform 0.3s ease;
        
        &:hover {
            transform: translateY(-4px);
        }
    }
}
```

#### 6.2 Performance Optimization
```markdown
- [ ] Optimize images
- [ ] Minify CSS/JS
- [ ] Lazy load images
- [ ] Check bundle size
```

#### 6.3 Final Testing
```markdown
- [ ] All variations work
- [ ] Content editing is smooth
- [ ] No console errors
- [ ] Accessibility standards met
- [ ] SEO best practices followed
```

---

## 🎯 **BENEFITS OF THIS APPROACH**

### **Phase 1 Benefits (Structure)**
- ✅ **Content-first**: Ensures content works before styling
- ✅ **Accessibility**: Semantic HTML from the start
- ✅ **SEO-friendly**: Proper heading structure
- ✅ **Maintainable**: Clear separation of concerns
- ✅ **Testable**: Can test functionality without styling

### **Phase 2 Benefits (Styling)**
- ✅ **Faster iteration**: Structure is already solid
- ✅ **Better UX**: Focus on visual polish
- ✅ **Responsive**: Can optimize for all devices
- ✅ **Performance**: Optimized styling approach
- ✅ **Consistency**: Use established patterns

---

## 📊 **TIME ESTIMATES**

| Phase | Time | Description |
|-------|------|-------------|
| Planning | 5-10 min | Analyze design, plan structure |
| Structure | 15-30 min | Build HTML, add utilities |
| ACF Setup | 10-15 min | Create fields, test integration |
| Basic Styling | 10-15 min | Apply utility classes |
| Custom Styling | 20-40 min | Add custom SCSS |
| Polish | 10-20 min | Animations, optimization |

**Total: 70-130 minutes per component**

---

## 🔄 **ITERATION WORKFLOW**

### **Quick Iterations**
1. **Structure changes**: Update HTML/PHP (5-10 min)
2. **Content changes**: Modify ACF fields (5 min)
3. **Style tweaks**: Adjust utility classes (5 min)
4. **Custom styling**: Update SCSS (10-20 min)

### **When to Refactor**
- Component becomes too complex
- Multiple similar components emerge
- Performance issues arise
- Design system needs updating

---

## 📝 **BEST PRACTICES**

### **Structure Phase**
- Use semantic HTML elements
- Plan for accessibility from the start
- Keep ACF fields simple and logical
- Use consistent naming conventions
- Test content rendering early

### **Styling Phase**
- Start with utility classes
- Use Figma measurements consistently
- Follow mobile-first approach
- Keep animations subtle and purposeful
- Document custom patterns

### **Quality Assurance**
- Test on multiple devices
- Validate HTML/CSS
- Check accessibility standards
- Optimize for performance
- Document component usage 