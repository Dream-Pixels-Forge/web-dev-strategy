# Layout Patterns

## Grid System

### CSS Grid Layout
```css
.grid {
  display: grid;
  gap: 1rem;
}

.grid--2-col {
  grid-template-columns: repeat(2, 1fr);
}

.grid--3-col {
  grid-template-columns: repeat(3, 1fr);
}

.grid--auto-fit {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.grid--responsive {
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .grid--responsive {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid--responsive {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Flexbox Layout
```css
.flex {
  display: flex;
  gap: 1rem;
}

.flex--center {
  justify-content: center;
  align-items: center;
}

.flex--between {
  justify-content: space-between;
  align-items: center;
}

.flex--column {
  flex-direction: column;
}

.flex--wrap {
  flex-wrap: wrap;
}
```

## Container Patterns

### Max-Width Container
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.container--narrow {
  max-width: 800px;
}

.container--wide {
  max-width: 1400px;
}
```

### Fluid Container
```css
.container-fluid {
  width: 100%;
  padding: 0 1rem;
}
```

## Page Layout Patterns

### Header-Main-Footer Layout
```jsx
const Layout = ({ children }) => {
  return (
    <div className="layout">
      <header className="layout-header">
        <Navigation />
      </header>
      <main className="layout-main">
        {children}
      </main>
      <footer className="layout-footer">
        <Footer />
      </footer>
    </div>
  );
};
```

```css
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-header {
  flex-shrink: 0;
}

.layout-main {
  flex: 1;
  padding: 2rem 0;
}

.layout-footer {
  flex-shrink: 0;
}
```

### Sidebar Layout
```jsx
const SidebarLayout = ({ sidebar, children }) => {
  return (
    <div className="sidebar-layout">
      <aside className="sidebar">
        {sidebar}
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};
```

```css
.sidebar-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
  min-height: 100vh;
}

.sidebar {
  background: var(--color-gray-50);
  padding: 1rem;
}

.main-content {
  padding: 1rem;
}

@media (max-width: 768px) {
  .sidebar-layout {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    order: 2;
  }
}
```

## Section Patterns

### Hero Section
```jsx
const HeroSection = ({ title, subtitle, cta, backgroundImage }) => {
  return (
    <section 
      className="hero"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="hero-content">
        <h1 className="hero-title">{title}</h1>
        <p className="hero-subtitle">{subtitle}</p>
        {cta && <div className="hero-cta">{cta}</div>}
      </div>
    </section>
  );
};
```

```css
.hero {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
  position: relative;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
}

.hero-content {
  position: relative;
  text-align: center;
  color: white;
  max-width: 600px;
  padding: 2rem;
}
```

### Content Section
```jsx
const ContentSection = ({ title, children, variant = 'default' }) => {
  return (
    <section className={`content-section content-section--${variant}`}>
      <div className="container">
        {title && <h2 className="section-title">{title}</h2>}
        <div className="section-content">
          {children}
        </div>
      </div>
    </section>
  );
};
```

## Responsive Breakpoints

```css
/* Mobile First Approach */
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* Usage */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

## Best Practices

### Layout Design
- Use mobile-first responsive design
- Implement consistent spacing system
- Ensure proper content hierarchy
- Maintain visual balance and alignment

### Performance
- Use CSS Grid and Flexbox for layouts
- Minimize layout shifts (CLS)
- Optimize for different screen sizes
- Use efficient CSS selectors

### Accessibility
- Ensure proper heading hierarchy
- Provide skip navigation links
- Maintain focus management
- Use semantic HTML structure