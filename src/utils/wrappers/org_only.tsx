import React, { ComponentType, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Toaster from '../toaster';
import OrgBase from '@/screens/org_base_template';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import { currentOrgSelector } from '@/slices/orgSlice';
import { initialOrganization } from '@/types/initials';

const OrgOnlyAndProtect = <Props extends Object>(Component: ComponentType<Props>) => {
  const ProtectedComponent = (props: Props) => {
    const [isAuthenticated, setIsAuthenticated] = useState(0);
    const user = useSelector(userSelector);
    const organization = useSelector(currentOrgSelector) || initialOrganization;

    useEffect(() => {
      const token = Cookies.get('token');
      if (!token || token == '' || user.id == '') {
        Toaster.error('You are not logged in.');
        setIsAuthenticated(0);
        window.location.replace('/login');
      } else if (!user.isOrganization) {
        Toaster.error('Page only for organization accounts.');
        setIsAuthenticated(0);
        window.location.replace('/home');
      } else if (user.id != organization.userID) {
        Toaster.error('Please log in again.');
        setIsAuthenticated(0);
        window.location.replace('/organization/login');
      } else setIsAuthenticated(1);
    }, []);

    if (isAuthenticated === 1) return <Component {...props} />;
    return <OrgBase />;
  };
  return ProtectedComponent;
};

export default OrgOnlyAndProtect;
