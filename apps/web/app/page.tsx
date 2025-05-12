import { Button } from 'ui';

export default function HomePage() {
  return (
    <div>
      <h1>Property Portal</h1>
      <Button variant="primary" onClick={() => alert('Clicked!')}>
        Click Me
      </Button>
    </div>
  );
}