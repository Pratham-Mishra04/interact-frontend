import React, { useState } from 'react';
import TabMenu from '@/components/common/tab_menu';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import OrgSidebar from '@/components/common/org_sidebar';
import WidthCheck from '@/utils/wrappers/widthCheck';
import OrgMembersOnlyAndProtect from '@/utils/wrappers/org_members_only';
import Polls from '@/screens/organisation/polls';
import Announcements from '@/screens/organisation/announcements';
import { useSelector } from 'react-redux';
import { currentOrgSelector } from '@/slices/orgSlice';

const News = () => {
  const [tab, setTab] = useState(0);
  const currentOrg = useSelector(currentOrgSelector);

  return (
    <BaseWrapper title={`News | ${currentOrg.title}`}>
      <OrgSidebar index={13} />
      <MainWrapper>
        <div className="w-full flex flex-col items-center gap-4 py-20">
          <TabMenu items={['Polls', 'Announcements']} active={tab} setState={setTab} />
          <div className={`w-full ${tab === 0 ? 'block' : 'hidden'}`}>
            <Polls />
          </div>
          <div className={`w-full ${tab === 1 ? 'block' : 'hidden'}`}>
            <Announcements />
          </div>
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default WidthCheck(OrgMembersOnlyAndProtect(News));
