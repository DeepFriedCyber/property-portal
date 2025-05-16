// AccessibleNavigation.tsx
import React, { useState, useRef, useEffect } from 'react';

import AccessibleButton from './AccessibleButton';

interface NavItem {
  id: string;
  label: string;
  href: string;
  children?: NavItem[];
  icon?: React.ReactNode;
}

interface AccessibleNavigationProps {
  items: NavItem[];
  currentPath: string;
  ariaLabel?: string;
  className?: string;
  onNavItemClick?: (item: NavItem) => void;
}

const AccessibleNavigation: React.FC<AccessibleNavigationProps> = ({
  items,
  currentPath,
  ariaLabel = 'Main Navigation',
  className = '',
  onNavItemClick,
}) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const navRef = useRef<HTMLElement>(null);

  // Handle keyboard navigation
  useEffect(() => {
    if (!navRef.current) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;

      // Only handle keyboard events for nav items
      if (!target.classList.contains('nav-link') && !target.classList.contains('nav-button')) {
        return;
      }

      const navItems = Array.from(
        navRef.current?.querySelectorAll('.nav-link, .nav-button') || []
      ) as HTMLElement[];

      const currentIndex = navItems.indexOf(target);

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (currentIndex < navItems.length - 1) {
            navItems[currentIndex + 1].focus();
          }
          break;

        case 'ArrowUp':
          event.preventDefault();
          if (currentIndex > 0) {
            navItems[currentIndex - 1].focus();
          }
          break;

        case 'Home':
          event.preventDefault();
          navItems[0].focus();
          break;

        case 'End':
          event.preventDefault();
          navItems[navItems.length - 1].focus();
          break;

        default:
          break;
      }
    };

    navRef.current.addEventListener('keydown', handleKeyDown);

    return () => {
      navRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [items]);

  // Toggle submenu
  const toggleSubmenu = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Handle nav item click
  const handleItemClick = (item: NavItem, event: React.MouseEvent) => {
    // If the item has children, toggle the submenu
    if (item.children && item.children.length > 0) {
      event.preventDefault();
      toggleSubmenu(item.id);
    }

    // Call the custom click handler if provided
    if (onNavItemClick) {
      onNavItemClick(item);
    }
  };

  // Render a nav item
  const renderNavItem = (item: NavItem, level: number = 0) => {
    const isActive = currentPath === item.href;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.id] || false;

    return (
      <li key={item.id} className={`nav-item level-${level}`}>
        {hasChildren ? (
          <>
            <AccessibleButton
              className={`nav-button ${isActive ? 'active' : ''}`}
              onClick={(e) => handleItemClick(item, e)}
              ariaExpanded={isExpanded}
              ariaControls={`submenu-${item.id}`}
              ariaLabel={`${item.label} ${isExpanded ? 'collapse' : 'expand'} submenu`}
              icon={item.icon}
            >
              {item.label}
              <span className="submenu-indicator" aria-hidden="true">
                {isExpanded ? '▼' : '▶'}
              </span>
            </AccessibleButton>

            {isExpanded && (
              <ul
                id={`submenu-${item.id}`}
                className="submenu"
                role="menu"
                aria-label={`${item.label} submenu`}
              >
                {item.children.map((child) => renderNavItem(child, level + 1))}
              </ul>
            )}
          </>
        ) : (
          <a
            href={item.href}
            className={`nav-link ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={(e) => handleItemClick(item, e)}
          >
            {item.icon && (
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
            )}
            {item.label}
          </a>
        )}
      </li>
    );
  };

  return (
    <nav ref={navRef} aria-label={ariaLabel} className={`accessible-nav ${className}`}>
      <ul className="nav-list" role="menubar">
        {items.map((item) => renderNavItem(item))}
      </ul>
    </nav>
  );
};

export default AccessibleNavigation;
