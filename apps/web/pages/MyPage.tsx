import React from 'react'

import { Button } from '../src/ui'

export default function MyPage() {
  return (
    <div>
      <h1>Property Portal</h1>
      <Button variant="primary" onClick={() => alert('Clicked!')}>
        Click Me
      </Button>
    </div>
  )
}
