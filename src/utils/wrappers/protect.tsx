import React, { ComponentType, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Toaster from '../toaster';
import Base from '@/screens/base_template';

const Protect = <Props extends Object>(Component: ComponentType<Props>) => {
  const ProtectedComponent = (props: Props) => {
    //TODO do verification redirect here only
    const [isAuthenticated, setIsAuthenticated] = useState(0);
    useEffect(() => {
      const token = Cookies.get('token');
      if (!token || token == '') {
        Toaster.error('You are not logged in.');
        setIsAuthenticated(0);
        window.location.replace('/login');
      } else setIsAuthenticated(1);
    }, []);

    if (isAuthenticated === 1) return <Component {...props} />;
    return <Base />;
  };
  return ProtectedComponent;
};

export default Protect;
