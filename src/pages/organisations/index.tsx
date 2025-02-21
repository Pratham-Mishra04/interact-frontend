import MenuBar from '@/components/common/menu_bar';
import Sidebar from '@/components/common/sidebar';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import PrimeWrapper from '@/wrappers/prime';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import ExploreOrganisations from '@/screens/organisations/explore';
import MemberOrganizations from '@/screens/organisations/memberships';

const Organisations = () => {
  const [active, setActive] = useState(0);
  const user = useSelector(userSelector);

  useEffect(() => {
    const oid = new URLSearchParams(window.location.search).get('oid');
    if (oid) setActive(1);
  }, [window.location.search]);

  return (
    <BaseWrapper title="Organisations">
      <Sidebar index={4} />
      <MainWrapper restrictWidth>
        {user && user.organizationMemberships?.length > 0 ? (
          <>
            <MenuBar items={['Explore', 'Joined']} active={active} setState={setActive} />
            {active == 0 ? (
              <PrimeWrapper index={0} maxIndex={2}>
                <ExploreOrganisations />
              </PrimeWrapper>
            ) : (
              active == 1 && (
                <PrimeWrapper index={1} maxIndex={2}>
                  <MemberOrganizations />
                </PrimeWrapper>
              )
            )}
          </>
        ) : (
          <PrimeWrapper>
            <ExploreOrganisations />
          </PrimeWrapper>
        )}
        {/* </div> */}
        {/* <SideBarWrapper>
          <SidePrimeWrapper>This section to promote organisations</SidePrimeWrapper>
        </SideBarWrapper> */}
      </MainWrapper>
    </BaseWrapper>
  );
};

export default Organisations;
