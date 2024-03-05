import Sidebar from '@/components/common/sidebar';
import TabMenu from '@/components/common/tab_menu';
import SearchBar from '@/components/explore/searchbar';
import Events from '@/screens/explore/events';
import Openings from '@/screens/explore/openings';
import Organisations from '@/screens/explore/oraganisations';
import Projects from '@/screens/explore/projects';
import Users from '@/screens/explore/users';
import ProfileCompletion from '@/sections/home/profile_completion';
import { exploreTabSelector, setExploreTab } from '@/slices/feedSlice';
import { userSelector } from '@/slices/userSlice';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

const Explore = () => {
  const active = useSelector(exploreTabSelector);
  const initialSearch = new URLSearchParams(window.location.search).get('search') || '';

  const user = useSelector(userSelector);

  useEffect(() => {
    if (user.isOrganization) window.location.replace('/organisation/explore');
  }, []);
  return (
    <BaseWrapper title="Explore | Interact">
      <Sidebar index={2} />
      <MainWrapper>
        <div className="w-full max-lg:w-full flex flex-col items-center gap-4 transition-ease-out-500 pt-20 pb-base_padding">
          <TabMenu
            items={['Projects', 'Openings', 'Users', 'Organisations', 'Events']}
            active={active}
            setReduxState={setExploreTab}
            width="840px"
          />
          <SearchBar initialValue={initialSearch} />
          <div className={`w-full ${active === 0 ? 'block' : 'hidden'}`}>
            <Projects />
          </div>
          <div className={`w-full ${active === 1 ? 'block' : 'hidden'}`}>
            <Openings />
          </div>
          <div className={`w-full ${active === 2 ? 'block' : 'hidden'} `}>
            <Users />
          </div>
          <div className={`w-full ${active === 3 ? 'block' : 'hidden'} `}>
            <Organisations />
          </div>
          <div className={`w-full ${active === 4 ? 'block' : 'hidden'} `}>
            <Events />
          </div>
        </div>
        <ProfileCompletion />
      </MainWrapper>
    </BaseWrapper>
  );
};

export default Explore;
