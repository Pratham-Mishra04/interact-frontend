import Sidebar from '@/components/common/sidebar';
import Discover from '@/screens/home/discover';
import Feed from '@/screens/home/feed';
import ProfileCompletion from '@/sections/home/profile_completion';
import { homeTabSelector, onboardingSelector } from '@/slices/feedSlice';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Onboarding from '@/components/common/onboarding';
import { userSelector } from '@/slices/userSlice';
import { useRouter } from 'next/router';
import ProfileCard from '@/sections/home/profile_card';
import TrendingCard from '@/sections/home/trending_card';

const Home = () => {
  const active = useSelector(homeTabSelector);
  const onboarding = useSelector(onboardingSelector);
  const user = useSelector(userSelector);

  const router = useRouter(); //TODO use window.location instead of router

  useEffect(() => {
    if (user.isOrganization) router.replace('/organisation/home');
    else if (user.isLoggedIn && !user.isVerified) {
      router.replace('/verification');
    } else if (user.isLoggedIn && !user.isOnboardingComplete) {
      sessionStorage.setItem('onboarding-redirect', 'home-callback');
      router.replace('/onboarding');
    }
  }, []);

  return (
    <BaseWrapper title="Home">
      <Sidebar index={1} />
      <MainWrapper>
        {onboarding && user.id != '' ? <Onboarding /> : <></>}
        <div className="w-full flex gap-6 px-12 max-md:px-2 py-base_padding">
          <div className="w-[70%] flex flex-col items-center relative">
            {user.id != '' ? (
              <>
                {/* <TabMenu items={['Feed', 'Discover']} active={active} setReduxState={setHomeTab} /> */}
                <div className={`w-full ${active === 0 ? 'block' : 'hidden'}`}>
                  <Feed />
                </div>
                <div className={`w-full ${active === 1 ? 'block' : 'hidden'}`}>
                  <Discover />
                </div>
              </>
            ) : (
              <Discover />
            )}
          </div>

          <div className="w-[30%] h-fit flex flex-col gap-4">
            {user.id != '' && <ProfileCard />}
            <TrendingCard />
          </div>

          {
            //TODO Profile Completion for Organisations
          }
          <ProfileCompletion />
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default Home;
