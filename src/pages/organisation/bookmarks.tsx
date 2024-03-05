import TabMenu from '@/components/common/tab_menu';
import { bookmarksTabSelector, setBookmarksTab } from '@/slices/feedSlice';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import OrgSidebar from '@/components/common/org_sidebar';
import React from 'react';
import { useSelector } from 'react-redux';
import Posts from '@/screens/bookmarks/posts';
import Projects from '@/screens/bookmarks/projects';
import WidthCheck from '@/utils/wrappers/widthCheck';
import OrgOnlyAndProtect from '@/utils/wrappers/org_only';
import { currentOrgSelector } from '@/slices/orgSlice';

const Bookmarks = () => {
  const active = useSelector(bookmarksTabSelector);
  const currentOrg = useSelector(currentOrgSelector);
  return (
    <BaseWrapper title={`Bookmarks | ${currentOrg.title}`}>
      <OrgSidebar index={11} />
      <MainWrapper>
        <div className="w-full flex flex-col items-center gap-4 py-20">
          <TabMenu items={['Posts', 'Projects']} active={active} setReduxState={setBookmarksTab} />
          <div className={`w-full ${active === 0 ? 'block' : 'hidden'}`}>
            <Posts />
          </div>
          <div className={`w-full ${active === 1 ? 'block' : 'hidden'}`}>
            <Projects />
          </div>
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default WidthCheck(OrgOnlyAndProtect(Bookmarks));
