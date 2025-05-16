import React from 'react';

import { Button } from '../ui';

const MyPageComponent = () => {
  const handleClick = () => {
    // eslint-disable-next-line no-console
    console.log('Button clicked in web app!');
  };

  return (
    <div>
      <h1>Welcome to My Page</h1>
      <Button onClick={handleClick} variant="primary" size="large">
        Click Me!
      </Button>
      <Button
        onClick={() => alert('Secondary clicked')}
        variant="secondary"
        style={{ marginLeft: '10px' }}
      >
        Another Action
      </Button>
      <Button variant="destructive" isLoading={true} style={{ marginLeft: '10px' }}>
        Processing...
      </Button>
    </div>
  );
};

export default MyPageComponent;
