import React from 'react';
import Sidebar from '@/components/common/sidebar';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import PrimeWrapper from '@/wrappers/prime';
import ExploreUsers from '@/screens/users/explore';

const Users = () => {
  return (
    <BaseWrapper title="Users">
      <Sidebar index={-1} />
      <MainWrapper>
        <PrimeWrapper>
          <ExploreUsers />
        </PrimeWrapper>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default Users;
