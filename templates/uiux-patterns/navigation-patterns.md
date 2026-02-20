# Navigation Patterns

## Header Navigation

### Primary Navigation
```jsx
const Navigation = ({ items, currentPath }) => {
  return (
    <nav className="nav-primary" role="navigation" aria-label="Main navigation">
      <div className="nav-brand">
        <Link to="/" className="nav-logo">
          <img src="/logo.svg" alt="Company Name" />
        </Link>
      </div>
      <ul className="nav-menu">
        {items.map((item) => (
          <li key={item.path} className="nav-item">
            <Link 
              to={item.path}
              className={`nav-link ${currentPath === item.path ? 'nav-link--active' : ''}`}
              aria-current={currentPath === item.path ? 'page' : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
```

### Mobile Navigation
```jsx
const MobileNavigation = ({ items, isOpen, onToggle }) => {
  return (
    <>
      <button 
        className="nav-toggle"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-label="Toggle navigation menu"
      >
        <span className="hamburger"></span>
      </button>
      
      <div 
        id="mobile-menu"
        className={`nav-mobile ${isOpen ? 'nav-mobile--open' : ''}`}
      >
        <ul className="nav-mobile-menu">
          {items.map((item) => (
            <li key={item.path} className="nav-mobile-item">
              <Link 
                to={item.path}
                className="nav-mobile-link"
                onClick={onToggle}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
```

## Sidebar Navigation

### Collapsible Sidebar
```jsx
const Sidebar = ({ items, isCollapsed, onToggle }) => {
  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
      <button 
        className="sidebar-toggle"
        onClick={onToggle}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronIcon />
      </button>
      
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {items.map((item) => (
            <SidebarItem 
              key={item.id} 
              item={item} 
              isCollapsed={isCollapsed} 
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
};

const SidebarItem = ({ item, isCollapsed }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <li className="sidebar-item">
      {hasChildren ? (
        <>
          <button
            className="sidebar-link sidebar-link--expandable"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {!isCollapsed && (
              <>
                <span className="sidebar-label">{item.label}</span>
                <ChevronIcon className={`sidebar-chevron ${isExpanded ? 'sidebar-chevron--expanded' : ''}`} />
              </>
            )}
          </button>
          {!isCollapsed && isExpanded && (
            <ul className="sidebar-submenu">
              {item.children.map((child) => (
                <li key={child.id} className="sidebar-subitem">
                  <Link to={child.path} className="sidebar-sublink">
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <Link to={item.path} className="sidebar-link">
          <span className="sidebar-icon">{item.icon}</span>
          {!isCollapsed && <span className="sidebar-label">{item.label}</span>}
        </Link>
      )}
    </li>
  );
};
```

## Breadcrumb Navigation

```jsx
const Breadcrumb = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      <ol className="breadcrumb-list">
        {items.map((item, index) => (
          <li key={item.path} className="breadcrumb-item">
            {index < items.length - 1 ? (
              <>
                <Link to={item.path} className="breadcrumb-link">
                  {item.label}
                </Link>
                <span className="breadcrumb-separator" aria-hidden="true">
                  /
                </span>
              </>
            ) : (
              <span className="breadcrumb-current" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
```

## Tab Navigation

```jsx
const Tabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="tabs">
      <div className="tabs-list" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tabs-tab ${activeTab === tab.id ? 'tabs-tab--active' : ''}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`panel-${tab.id}`}
          className={`tabs-panel ${activeTab === tab.id ? 'tabs-panel--active' : ''}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
};
```

## Pagination

```jsx
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5 
}) => {
  const getVisiblePages = () => {
    const delta = Math.floor(maxVisiblePages / 2);
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, start + maxVisiblePages - 1);
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <nav aria-label="Pagination" className="pagination">
      <ul className="pagination-list">
        {showFirstLast && currentPage > 1 && (
          <li className="pagination-item">
            <button 
              className="pagination-link"
              onClick={() => onPageChange(1)}
              aria-label="Go to first page"
            >
              First
            </button>
          </li>
        )}
        
        {showPrevNext && currentPage > 1 && (
          <li className="pagination-item">
            <button 
              className="pagination-link"
              onClick={() => onPageChange(currentPage - 1)}
              aria-label="Go to previous page"
            >
              Previous
            </button>
          </li>
        )}
        
        {getVisiblePages().map((page) => (
          <li key={page} className="pagination-item">
            <button
              className={`pagination-link ${page === currentPage ? 'pagination-link--active' : ''}`}
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </button>
          </li>
        ))}
        
        {showPrevNext && currentPage < totalPages && (
          <li className="pagination-item">
            <button 
              className="pagination-link"
              onClick={() => onPageChange(currentPage + 1)}
              aria-label="Go to next page"
            >
              Next
            </button>
          </li>
        )}
        
        {showFirstLast && currentPage < totalPages && (
          <li className="pagination-item">
            <button 
              className="pagination-link"
              onClick={() => onPageChange(totalPages)}
              aria-label="Go to last page"
            >
              Last
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};
```

## CSS Styles

```css
/* Primary Navigation */
.nav-primary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid var(--color-gray-200);
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: var(--color-gray-700);
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.nav-link:hover,
.nav-link--active {
  color: var(--color-primary-600);
  background: var(--color-primary-50);
}

/* Mobile Navigation */
.nav-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
  
  .nav-toggle {
    display: block;
  }
  
  .nav-mobile {
    position: fixed;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100vh;
    background: white;
    transition: left 0.3s ease;
    z-index: 1000;
  }
  
  .nav-mobile--open {
    left: 0;
  }
}

/* Sidebar */
.sidebar {
  width: 250px;
  background: var(--color-gray-50);
  border-right: 1px solid var(--color-gray-200);
  transition: width 0.3s ease;
}

.sidebar--collapsed {
  width: 60px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: var(--color-gray-700);
  transition: all 0.2s;
}

.sidebar-link:hover {
  background: var(--color-gray-100);
  color: var(--color-primary-600);
}
```

## Best Practices

### Navigation Design
- Keep navigation consistent across pages
- Use clear, descriptive labels
- Indicate current location
- Provide multiple navigation methods

### Accessibility
- Use semantic HTML elements (nav, ul, li)
- Include proper ARIA labels and roles
- Support keyboard navigation
- Provide skip links for screen readers

### Mobile Considerations
- Implement responsive navigation patterns
- Use touch-friendly target sizes
- Consider thumb-friendly placement
- Optimize for one-handed use