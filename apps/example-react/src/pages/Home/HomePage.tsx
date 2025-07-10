import React, { useEffect } from 'react';

import * as styles from './home-page.module.scss';

const HomePage = () => {
  const [apiResponse, setApiResponse] = React.useState<{
    origin: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api-example/ip')
      .then((response) => response.json())
      .then((responseAsJson) => {
        setApiResponse(responseAsJson);
      });
  }, []);

  return (
    <div className={styles['home-page__welcome-section']}>
      <h1>Hello world</h1>
      <p>Your IP is: {apiResponse?.origin || '...'}</p>
    </div>
  );
};

export { HomePage };
