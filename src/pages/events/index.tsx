import MenuBar from '@/components/common/menu_bar';
import Sidebar from '@/components/common/sidebar';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import PrimeWrapper from '@/wrappers/prime';
import React, { useState } from 'react';
import ExploreEvents from '@/screens/events/explore';
import BookmarkEvents from '@/screens/events/bookmarks';
import RegisteredEvents from '@/screens/events/registered';
import { useSelector } from 'react-redux';
import { userIDSelector } from '@/slices/userSlice';

const Events = () => {
  const [active, setActive] = useState(0);
  const userID = useSelector(userIDSelector);

  return (
    <BaseWrapper title="Events">
      <Sidebar index={3} />
      <MainWrapper restrictWidth>
        {userID ? (
          <>
            <MenuBar items={['Explore', 'Registered', 'Saved']} active={active} setState={setActive} />
            {active == 0 ? (
              <PrimeWrapper index={0} maxIndex={2}>
                <ExploreEvents />
              </PrimeWrapper>
            ) : active == 1 ? (
              <PrimeWrapper index={1} maxIndex={2}>
                <RegisteredEvents />
              </PrimeWrapper>
            ) : (
              active == 2 && (
                <PrimeWrapper index={2} maxIndex={2}>
                  <BookmarkEvents />
                </PrimeWrapper>
              )
            )}
          </>
        ) : (
          <PrimeWrapper>
            <ExploreEvents />
          </PrimeWrapper>
        )}
        {/* </div> */}
        {/* <SideBarWrapper>
          <SidePrimeWrapper>Top 10 list, etc</SidePrimeWrapper>
          <SidePrimeWrapper>This section to promote new events</SidePrimeWrapper>
        </SideBarWrapper> */}
      </MainWrapper>
    </BaseWrapper>
  );
};

export default Events;
