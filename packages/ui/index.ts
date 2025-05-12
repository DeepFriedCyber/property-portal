// tsconfig.json configuration
// {
//   "compilerOptions": {
//     "jsx": "react",
//     // other options
//   }
// }

import React from 'react';

export * from './components/Button';
// Add more exports here as you create more components

import Button from "./components/Button";

export default function MyPage() {
  return (
    <div>
      <Button variant="primary" onClick={() => alert('Clicked!')}>
        {'Click Me'}
      </Button>
    </div>
  );
}