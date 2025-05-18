import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { describe, it, expect, vi } from 'vitest'

import { Button } from './Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click Me</Button>)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })

  it('triggers onClick', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
