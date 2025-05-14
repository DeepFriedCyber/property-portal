// AccessibleTable.tsx
import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((data: T) => React.ReactNode);
  width?: string;
}

interface AccessibleTableProps<T> {
  data: T[];
  columns: Column<T>[];
  caption?: string;
  ariaLabel?: string;
  id: string;
  sortColumn?: keyof T;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: keyof T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  rowClassName?: (item: T) => string;
  onRowClick?: (item: T) => void;
}

function AccessibleTable<T extends { id?: string | number }>({
  data,
  columns,
  caption,
  ariaLabel,
  id,
  sortColumn,
  sortDirection,
  onSort,
  emptyMessage = 'No data available',
  isLoading = false,
  rowClassName,
  onRowClick
}: AccessibleTableProps<T>) {
  // Function to get cell value based on accessor
  const getCellValue = (item: T, accessor: Column<T>['accessor']) => {
    if (typeof accessor === 'function') {
      return accessor(item);
    }
    return item[accessor];
  };

  // Function to handle header click for sorting
  const handleHeaderClick = (column: Column<T>) => {
    if (onSort && typeof column.accessor !== 'function') {
      onSort(column.accessor);
    }
  };

  // Function to determine if a column is sortable
  const isSortable = (column: Column<T>) => {
    return onSort && typeof column.accessor !== 'function';
  };

  // Function to get sort indicator
  const getSortIndicator = (column: Column<T>) => {
    if (typeof column.accessor === 'function' || !sortColumn) return null;
    
    if (column.accessor === sortColumn) {
      return (
        <span 
          className={`sort-indicator ${sortDirection}`} 
          aria-hidden="true"
        >
          {sortDirection === 'asc' ? ' ↑' : ' ↓'}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="table-responsive" role="region" aria-label={ariaLabel || caption}>
      <table id={id}>
        {caption && <caption>{caption}</caption>}
        
        <thead>
          <tr>
            {columns.map((column, index) => {
              const sortable = isSortable(column);
              return (
                <th 
                  key={index} 
                  scope="col" 
                  style={{ width: column.width }}
                  className={sortable ? 'sortable-header' : ''}
                  onClick={sortable ? () => handleHeaderClick(column) : undefined}
                  aria-sort={
                    typeof column.accessor !== 'function' && 
                    column.accessor === sortColumn 
                      ? sortDirection === 'asc' 
                        ? 'ascending' 
                        : 'descending' 
                      : undefined
                  }
                >
                  {column.header}
                  {getSortIndicator(column)}
                </th>
              );
            })}
          </tr>
        </thead>
        
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="loading-cell">
                <div aria-live="polite">Loading data...</div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="empty-cell">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr 
                key={item.id || rowIndex}
                className={rowClassName ? rowClassName(item) : ''}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? 'button' : undefined}
                onKeyDown={
                  onRowClick 
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick(item);
                        }
                      }
                    : undefined
                }
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {getCellValue(item, column.accessor)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AccessibleTable;