# Modal Patterns

## Basic Modal

### Modal Component
```jsx
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  closeOnOverlay = true,
  closeOnEscape = true,
  showCloseButton = true 
}) => {
  useEffect(() => {
    if (!closeOnEscape) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="modal-overlay" 
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div 
        className={`modal modal--${size}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && <h2 id="modal-title" className="modal-title">{title}</h2>}
            {showCloseButton && (
              <button 
                className="modal-close" 
                onClick={onClose}
                aria-label="Close modal"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        )}
        
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
```

## Modal Variants

### Confirmation Modal
```jsx
const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger' 
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <div className="confirmation-modal">
        <div className="confirmation-message">
          {message}
        </div>
        
        <div className="confirmation-actions">
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Usage
<ConfirmationModal
  isOpen={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onConfirm={handleDelete}
  message="Are you sure you want to delete this item? This action cannot be undone."
  confirmText="Delete"
  variant="danger"
/>
```

### Form Modal
```jsx
const FormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  title,
  children,
  submitText = 'Save',
  isSubmitting = false 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="modal-form-content">
          {children}
        </div>
        
        <div className="modal-form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
```

### Image Modal/Lightbox
```jsx
const ImageModal = ({ 
  isOpen, 
  onClose, 
  images, 
  currentIndex = 0,
  onIndexChange 
}) => {
  const [index, setIndex] = useState(currentIndex);

  useEffect(() => {
    setIndex(currentIndex);
  }, [currentIndex]);

  const goToPrevious = () => {
    const newIndex = index > 0 ? index - 1 : images.length - 1;
    setIndex(newIndex);
    onIndexChange?.(newIndex);
  };

  const goToNext = () => {
    const newIndex = index < images.length - 1 ? index + 1 : 0;
    setIndex(newIndex);
    onIndexChange?.(newIndex);
  };

  if (!isOpen || !images.length) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="fullscreen"
      closeOnOverlay={true}
    >
      <div className="image-modal">
        <div className="image-container">
          <img 
            src={images[index].src} 
            alt={images[index].alt}
            className="image-modal-img"
          />
        </div>
        
        {images.length > 1 && (
          <>
            <button 
              className="image-nav image-nav--prev"
              onClick={goToPrevious}
              aria-label="Previous image"
            >
              <ChevronLeftIcon />
            </button>
            
            <button 
              className="image-nav image-nav--next"
              onClick={goToNext}
              aria-label="Next image"
            >
              <ChevronRightIcon />
            </button>
          </>
        )}
        
        <div className="image-counter">
          {index + 1} of {images.length}
        </div>
      </div>
    </Modal>
  );
};
```

## Drawer/Slide-out Modal

```jsx
const Drawer = ({ 
  isOpen, 
  onClose, 
  position = 'right',
  title,
  children,
  width = '400px' 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="drawer-overlay" onClick={onClose}>
      <div 
        className={`drawer drawer--${position}`}
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "drawer-title" : undefined}
      >
        <div className="drawer-header">
          {title && <h2 id="drawer-title" className="drawer-title">{title}</h2>}
          <button 
            className="drawer-close" 
            onClick={onClose}
            aria-label="Close drawer"
          >
            <CloseIcon />
          </button>
        </div>
        
        <div className="drawer-content">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
```

## Bottom Sheet (Mobile)

```jsx
const BottomSheet = ({ 
  isOpen, 
  onClose, 
  title,
  children,
  snapPoints = ['25%', '50%', '90%'],
  initialSnap = 1 
}) => {
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    
    // Handle drag logic here
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // Snap to nearest point logic
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div 
        className="bottom-sheet"
        style={{ height: snapPoints[currentSnap] }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="bottom-sheet-handle"></div>
        
        {title && (
          <div className="bottom-sheet-header">
            <h2 className="bottom-sheet-title">{title}</h2>
          </div>
        )}
        
        <div className="bottom-sheet-content">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
```

## Modal Hook

```jsx
const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  };
};

// Usage
const MyComponent = () => {
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <>
      <Button onClick={openModal}>Open Modal</Button>
      
      <Modal isOpen={isOpen} onClose={closeModal} title="My Modal">
        <p>Modal content goes here</p>
      </Modal>
    </>
  );
};
```

## CSS Styles

```css
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

/* Modal Container */
.modal {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalEnter 0.2s ease-out;
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Modal Sizes */
.modal--small {
  width: 100%;
  max-width: 400px;
}

.modal--medium {
  width: 100%;
  max-width: 600px;
}

.modal--large {
  width: 100%;
  max-width: 800px;
}

.modal--fullscreen {
  width: 100vw;
  height: 100vh;
  max-width: none;
  max-height: none;
  border-radius: 0;
}

/* Modal Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  color: var(--color-gray-400);
  transition: color 0.2s;
}

.modal-close:hover {
  color: var(--color-gray-600);
}

/* Modal Content */
.modal-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

/* Confirmation Modal */
.confirmation-modal {
  text-align: center;
}

.confirmation-message {
  margin-bottom: 2rem;
  color: var(--color-gray-700);
  line-height: 1.5;
}

.confirmation-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* Form Modal */
.modal-form {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.modal-form-content {
  flex: 1;
  overflow-y: auto;
}

.modal-form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-gray-200);
  margin-top: 1.5rem;
}

/* Image Modal */
.image-modal {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: black;
}

.image-container {
  max-width: 90%;
  max-height: 90%;
}

.image-modal-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.image-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 1rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background 0.2s;
}

.image-nav:hover {
  background: rgba(0, 0, 0, 0.7);
}

.image-nav--prev {
  left: 1rem;
}

.image-nav--next {
  right: 1rem;
}

.image-counter {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
}

/* Drawer */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.drawer {
  position: fixed;
  top: 0;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  animation: drawerSlideIn 0.3s ease-out;
}

.drawer--right {
  right: 0;
}

.drawer--left {
  left: 0;
  box-shadow: 4px 0 6px -1px rgba(0, 0, 0, 0.1);
}

@keyframes drawerSlideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-gray-200);
  flex-shrink: 0;
}

.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

/* Bottom Sheet */
.bottom-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  animation: bottomSheetSlideUp 0.3s ease-out;
}

@keyframes bottomSheetSlideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.bottom-sheet-handle {
  width: 2rem;
  height: 0.25rem;
  background: var(--color-gray-300);
  border-radius: 0.125rem;
  margin: 0.75rem auto;
}

.bottom-sheet-header {
  padding: 0 1.5rem 1rem;
  border-bottom: 1px solid var(--color-gray-200);
}

.bottom-sheet-content {
  padding: 1.5rem;
  overflow-y: auto;
}

/* Responsive */
@media (max-width: 640px) {
  .modal {
    margin: 0;
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
    border-radius: 0;
  }
  
  .drawer {
    width: 100% !important;
  }
}
```

## Best Practices

### Modal Design
- Use modals sparingly and for focused tasks
- Provide clear ways to close the modal
- Prevent body scroll when modal is open
- Use appropriate modal sizes for content

### Accessibility
- Trap focus within the modal
- Return focus to trigger element on close
- Use proper ARIA attributes
- Support keyboard navigation (Escape to close)

### User Experience
- Use animations for smooth transitions
- Provide loading states for async operations
- Consider mobile-specific patterns (bottom sheets)
- Avoid nested modals when possible