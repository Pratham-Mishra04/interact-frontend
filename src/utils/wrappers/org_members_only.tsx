import React, { ComponentType, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Toaster from '../toaster';
import OrgBase from '@/screens/org_base_template';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import { currentOrgMembershipSelector, currentOrgSelector } from '@/slices/orgSlice';
import { initialOrganization, initialOrganizationMembership } from '@/types/initials';

const OrgMembersOnlyAndProtect = <Props extends Object>(Component: ComponentType<Props>) => {
  const ProtectedComponent = (props: Props) => {
    const [isAuthenticated, setIsAuthenticated] = useState(0);
    const user = useSelector(userSelector);
    const organization = useSelector(currentOrgSelector) || initialOrganization;
    const orgMembership = useSelector(currentOrgMembershipSelector) || initialOrganizationMembership;

    useEffect(() => {
      const token = Cookies.get('token');
      if (!token || token == '' || user.id == '') {
        Toaster.error('You are not logged in.');
        setIsAuthenticated(0);
        window.location.replace('/login');
      } else if (!user.isOrganization) {
        if (orgMembership.userID != user.id || orgMembership.organizationID != organization.id) {
          Toaster.error('Page only for organization members.');
          setIsAuthenticated(0);
          window.location.replace('/home');
        } else setIsAuthenticated(1);
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

export default OrgMembersOnlyAndProtect;
