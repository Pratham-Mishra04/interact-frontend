import Discover from '@/screens/home/discover';
import Feed from '@/screens/home/feed';
import ProfileCompletion from '@/sections/home/profile_completion';
import { homeTabSelector, onboardingSelector } from '@/slices/feedSlice';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import OrgOnlyAndProtect from '@/utils/wrappers/org_only';
import OrgSidebar from '@/components/common/org_sidebar';
import WidthCheck from '@/utils/wrappers/widthCheck';
import OrgOnboarding from '@/components/common/org_onboarding';
import TrendingCard from '@/sections/home/trending_card';
import ProfileCard from '@/sections/home/profile_card';

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
        <div className="w-full flex gap-6 px-12 max-md:px-2 py-base_padding">
          <div className="w-[70%] max-md:w-full flex flex-col items-center relative">
            <div className={`w-full ${active === 0 ? 'block' : 'hidden'}`}>
              <Feed />
            </div>
            <div className={`w-full ${active === 1 ? 'block' : 'hidden'}`}>
              <Discover />
            </div>
          </div>

          <div className="w-[30%] h-fit max-md:hidden flex flex-col gap-4">
            <ProfileCard />
            <TrendingCard />
          </div>

          {
            //TODO Profile Completion for Organisations
          }
          {/* <ProfileCompletion /> */}
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default WidthCheck(OrgOnlyAndProtect(Home));
