import TabMenu from '@/components/common/tab_menu';
import { bookmarksTabSelector, setBookmarksTab } from '@/slices/feedSlice';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import Sidebar from '@/components/common/sidebar';
import React from 'react';
import { useSelector } from 'react-redux';
import Posts from '@/screens/bookmarks/posts';
import Projects from '@/screens/bookmarks/projects';
import Openings from '@/screens/bookmarks/openings';
import NonOrgOnlyAndProtect from '@/utils/wrappers/non_org_only';
import Events from '@/screens/bookmarks/events';

const Bookmarks = () => {
  const active = useSelector(bookmarksTabSelector);
  return (
    <BaseWrapper title="Bookmarks | Interact">
      <Sidebar index={6} />
      <MainWrapper>
        <div className="w-full flex flex-col items-center gap-4 py-20">
          <TabMenu
            items={['Posts', 'Projects', 'Openings', 'Events']}
            active={active}
            setReduxState={setBookmarksTab}
          />
          <div className={`w-full ${active === 0 ? 'block' : 'hidden'}`}>
            <Posts />
          </div>
          <div className={`w-full ${active === 1 ? 'block' : 'hidden'}`}>
            <Projects />
          </div>
          <div className={`w-full ${active === 2 ? 'block' : 'hidden'}`}>
            <Openings />
          </div>
          <div className={`w-full ${active === 3 ? 'block' : 'hidden'}`}>
            <Events />
          </div>
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default NonOrgOnlyAndProtect(Bookmarks);
