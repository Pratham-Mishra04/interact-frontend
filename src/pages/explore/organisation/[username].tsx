import TabMenu from '@/components/common/tab_menu';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import Sidebar from '@/components/common/sidebar';
import React, { useEffect, useState } from 'react';
import { initialOrganization, initialProfile, initialUser } from '@/types/initials';
import { EXPLORE_URL, USER_COVER_PIC_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { navbarOpenSelector } from '@/slices/feedSlice';
import Posts from '@/screens/profile/posts';
import Projects from '@/screens/profile/projects';
import { GetServerSidePropsContext } from 'next/types';
import ProfileCard from '@/sections/explore/profile_card';
import ProfileCardLoader from '@/components/loaders/profile_card';
import { SERVER_ERROR } from '@/config/errors';
import Loader from '@/components/common/loader';
import PostsLoader from '@/components/loaders/posts';
import WidthCheck from '@/utils/wrappers/widthCheck';
import About from '@/screens/profile/about';
import Events from '@/screens/profile/events';
import OrgSidebar from '@/components/common/org_sidebar';
import { userSelector } from '@/slices/userSlice';
import Reviews from '@/screens/profile/reviews';
import NewsFeed from '@/screens/profile/newsfeed';
import Openings from '@/screens/profile/opening';
interface Props {
  username: string;
}

const User = ({ username }: Props) => {
  const [active, setActive] = useState(0);
  const [user, setUser] = useState(initialUser);
  const [organisation, setOrganisation] = useState(initialOrganization);
  const [loading, setLoading] = useState(true);

  const open = useSelector(navbarOpenSelector);
  const loggedInUser = useSelector(userSelector);

  const getUser = () => {
    const URL = `${EXPLORE_URL}/orgs/${username}`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          setUser(res.data.user);
          setOrganisation(res.data.organization);
          setLoading(false);
        } else {
          if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
          else {
            Toaster.error(SERVER_ERROR, 'error_toaster');
          }
        }
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  useEffect(() => {
    getUser();
  }, [username]);

  return (
    <BaseWrapper title={user.name}>
      {loggedInUser.isOrganization ? <OrgSidebar index={1} /> : <Sidebar index={2} />}
      <MainWrapper>
        <div className="w-full flex max-lg:flex-col transition-ease-out-500 font-primary">
          {user.coverPic != '' ? (
            <Image
              crossOrigin="anonymous"
              priority={true}
              width={10000}
              height={10000}
              alt={'User Pic'}
              src={`${USER_COVER_PIC_URL}/${user.coverPic}`}
              className={`${
                open ? 'w-no_side_base_open' : 'w-no_side_base_close'
              } max-lg:w-screen h-64 cursor-default fixed top-navbar fade-img transition-ease-out-500 object-cover`}
            />
          ) : (
            <></>
          )}
          {loading ? (
            <ProfileCardLoader width="400px" />
          ) : (
            <ProfileCard user={user} organisation={organisation} org={true} />
          )}
          <div className={`grow flex flex-col gap-12 pt-12 max-lg:pt-0`}>
            {user.tagline && user.tagline != '' ? (
              <div className="w-full h-24 font-bold text-5xl max-lg:text-3xl flex-center text-center dark:text-white">
                {user.tagline}
              </div>
            ) : (
              <></>
            )}

            <TabMenu
              items={['About', 'Posts', 'Projects', 'Events', 'Reviews', 'News','Opening']}
              active={active}
              setState={setActive}
              width={open ? '640px' : '720px'}
              sticky={true}
            />

            <div className={`${active === 0 ? 'block' : 'hidden'}`}>
              {loading ? (
                <Loader />
              ) : (
                <About profile={user.profile || initialProfile} organisation={organisation} org={true} />
              )}
            </div>
            <div className={`${active === 1 ? 'block' : 'hidden'}`}>
              {loading ? (
                <div className="w-[45vw] mx-auto max-lg:w-[85%] max-md:w-screen max-lg:px-4 pb-2">
                  <PostsLoader />
                </div>
              ) : (
                <Posts userID={user.id} />
              )}
            </div>
            <div className={`${active === 2 ? 'block' : 'hidden'}`}>
              {loading ? <Loader /> : <Projects userID={user.id} />}
            </div>
            <div className={`${active === 3 ? 'block' : 'hidden'} `}>
              {loading ? <Loader /> : <Events orgID={organisation.id} />}
            </div>
            <div className={`${active === 4 ? 'block' : 'hidden'} `}>
              {loading ? <Loader /> : <Reviews orgID={organisation.id} />}
            </div>
            <div className={`${active === 5 ? 'block' : 'hidden'} `}>
              {loading ? <Loader /> : <NewsFeed orgID={organisation.id} />}
            </div>
            <div className={`${active === 6 ? 'block' : 'hidden'} `}>
              {loading ? <Loader /> : <Openings orgID={organisation.id} />}
            </div>
          </div>
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default User;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { username } = context.query;

  return {
    props: { username },
  };
}
