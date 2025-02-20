import MenuBar from '@/components/common/menu_bar';
import Sidebar from '@/components/common/sidebar';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import PrimeWrapper from '@/wrappers/prime';
import SideBarWrapper from '@/wrappers/side';
import React, { useEffect, useState } from 'react';
import Discover from '@/screens/home/discover';
import Feed from '@/screens/home/feed';
import FeedSide from '@/sides/home/feed';
import CommunitySide from '@/sides/home/community';
import Communities from '@/screens/home/communities';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import Image from 'next/image';
import Link from 'next/link';

const FOLLOWING_THRESHOLD = 3;

const Home = () => {
  const [active, setActive] = useState(0);
  const user = useSelector(userSelector);

  useEffect(() => {
    if (user.isOrganization) window.location.assign('/organisation/home');
  }, [user]);

  return (
    <BaseWrapper title="Home">
      <Sidebar index={1} />
      <MainWrapper restrictWidth sidebarLayout>
        <div className="w-2/3 max-md:w-full">
          <Link href={'/events'}>
            <Image
              src={'/home/banner.png'}
              height={460}
              width={1880}
              className={'rounded-lg w-full mb-4 shadow-sm'}
              alt={'live-on-interact'}
            />
          </Link>
          <MenuBar
            items={
              user.id
                ? user.following?.length > FOLLOWING_THRESHOLD
                  ? ['Following', 'Explore', 'Communities']
                  : ['Explore', 'Following', 'Communities']
                : ['Explore', 'Communities']
            }
            active={active}
            setState={setActive}
          />
          {active == 0 ? (
            <PrimeWrapper index={0} maxIndex={2}>
              {user.following?.length > FOLLOWING_THRESHOLD ? <Feed /> : <Discover />}
            </PrimeWrapper>
          ) : active == 1 ? (
            <PrimeWrapper index={1} maxIndex={2}>
              {user.id ? user.following?.length > FOLLOWING_THRESHOLD ? <Discover /> : <Feed /> : <Communities />}
            </PrimeWrapper>
          ) : (
            active == 2 && (
              <PrimeWrapper index={2} maxIndex={2}>
                <Communities />
              </PrimeWrapper>
            )
          )}
        </div>
        <SideBarWrapper>{active == 0 || active == 1 ? <FeedSide /> : active == 2 && <CommunitySide />}</SideBarWrapper>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default Home;
