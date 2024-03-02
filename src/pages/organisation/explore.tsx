import OrgSidebar from '@/components/common/org_sidebar';
import TabMenu from '@/components/common/tab_menu';
import SearchBar from '@/components/explore/searchbar';
import Events from '@/screens/explore/events';
import Organisations from '@/screens/explore/oraganisations';
import Projects from '@/screens/explore/projects';
import Users from '@/screens/explore/users';
import ProfileCompletion from '@/sections/home/profile_completion';
import { exploreTabSelector, setExploreTab } from '@/slices/feedSlice';
import OrgOnlyAndProtect from '@/utils/wrappers/org_only';
import WidthCheck from '@/utils/wrappers/widthCheck';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import React from 'react';
import { useSelector } from 'react-redux';

const Explore = () => {
  const active = useSelector(exploreTabSelector);
  const initialSearch = new URLSearchParams(window.location.search).get('search');
  return (
    <BaseWrapper title="Explore">
      <OrgSidebar index={1} />
      <MainWrapper>
        <div
          className={`w-full max-lg:w-full flex flex-col items-center gap-4 transition-ease-out-500 pt-20 pb-base_padding`}
        >
          <TabMenu
            items={['Projects', 'Users', 'Organisations', 'Events']}
            active={active}
            setReduxState={setExploreTab}
            width="720px"
          />
          <SearchBar initialValue={initialSearch && initialSearch != '' ? initialSearch : ''} />
          <div className={`w-full ${active === 0 ? 'block' : 'hidden'}`}>
            <Projects />
          </div>
          <div className={`w-full ${active === 1 ? 'block' : 'hidden'} `}>
            <Users />
          </div>
          <div className={`w-full ${active === 2 ? 'block' : 'hidden'} `}>
            <Organisations />
          </div>
          <div className={`w-full ${active === 3 ? 'block' : 'hidden'} `}>
            <Events />
          </div>
        </div>
        {/* <ProfileCompletion /> */}
      </MainWrapper>
    </BaseWrapper>
  );
};

export default WidthCheck(OrgOnlyAndProtect(Explore));
