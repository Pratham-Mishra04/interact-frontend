import TabMenu from '@/components/common/tab_menu';
import Discover from '@/screens/home/discover';
import Feed from '@/screens/home/feed';
import ProfileCompletion from '@/sections/home/profile_completion';
import { homeTabSelector, onboardingSelector, setHomeTab } from '@/slices/feedSlice';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import OrgOnlyAndProtect from '@/utils/wrappers/org_only';
import OrgSidebar from '@/components/common/org_sidebar';
import WidthCheck from '@/utils/wrappers/widthCheck';
import OrgOnboarding from '@/components/common/org_onboarding';

const Home = () => {
  const active = useSelector(homeTabSelector);
  const onboarding = useSelector(onboardingSelector);
  const user = useSelector(userSelector);

  useEffect(() => {
    if (!user.isOnboardingComplete) {
      sessionStorage.setItem('onboarding-redirect', 'organisation-home-callback');
      window.location.replace('/organisation/onboarding');
    }
  }, []);

  return (
    <BaseWrapper title="Home">
      <OrgSidebar index={1} />
      <MainWrapper>
        {onboarding && user.id != '' ? <OrgOnboarding /> : <></>}
        <div className="w-full flex flex-col items-center relative gap-4 px-9 max-md:px-2 pt-20 pb-base_padding">
          <TabMenu items={['Feed', 'Discover']} active={active} setReduxState={setHomeTab} />
          <div className={`${active === 0 ? 'block' : 'hidden'}`}>
            <Feed />
          </div>
          <div className={`${active === 1 ? 'block' : 'hidden'}`}>
            <Discover />
          </div>
          <ProfileCompletion />
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default WidthCheck(OrgOnlyAndProtect(Home));
