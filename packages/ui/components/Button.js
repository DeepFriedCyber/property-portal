import clsx from 'clsx'
import { jsx as _jsx } from 'react/jsx-runtime'
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  disabled = false,
  type = 'button',
}) => {
  const buttonClassName = clsx(
    'rounded font-semibold transition-colors',
    {
      // Size variations
      'px-2 py-1 text-sm': size === 'sm',
      'px-4 py-2': size === 'md',
      'px-6 py-3 text-lg': size === 'lg',
      // Variant and state combinations
      'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50':
        variant === 'primary' && !disabled,
      'bg-gray-200 text-black hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50':
        variant === 'secondary' && !disabled,
      'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50':
        variant === 'success' && !disabled,
      'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50':
        variant === 'danger' && !disabled,
      'bg-gray-300 text-gray-500 cursor-not-allowed': disabled,
    },
    className
  )
  return _jsx('button', {
    onClick: onClick,
    className: buttonClassName,
    disabled: disabled,
    type: type,
    children: children,
  })
}
//# sourceMappingURL=Button.js.map
