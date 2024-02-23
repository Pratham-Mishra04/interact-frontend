import React, { ComponentType, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Toaster from '../toaster';
import Base from '@/screens/base_template';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';

const NonOrgOnlyAndProtect = <Props extends Object>(Component: ComponentType<Props>) => {
  const ProtectedComponent = (props: Props) => {
    const [isAuthenticated, setIsAuthenticated] = useState(0);
    const user = useSelector(userSelector);

    useEffect(() => {
      const token = Cookies.get('token');
      if (!token || token == '' || user.id == '') {
        Toaster.error('You are not logged in.');
        setIsAuthenticated(0);
        window.location.replace('/login');
      } else if (user.isOrganization) {
        Toaster.error('Page only for non organization accounts.');
        setIsAuthenticated(0);
        window.location.replace('/organisation/home');
      } else setIsAuthenticated(1);
    }, []);

    if (isAuthenticated === 1) return <Component {...props} />;
    return <Base />;
  };
  return ProtectedComponent;
};

export default NonOrgOnlyAndProtect;
