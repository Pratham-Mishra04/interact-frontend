import { EXPLORE_URL } from '@/config/routes';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import { ArrowLeft, ArrowRight, ChartLineUp, Lock } from '@phosphor-icons/react';
import { SERVER_ERROR } from '@/config/errors';
import { User } from '@/types';
import { userSelector } from '@/slices/userSlice';
import UserCard from '@/components/explore/user_card';
import TrendingCardLoader from '@/components/loaders/feed_trending_card';
import { homeTabSelector, setHomeTab } from '@/slices/feedSlice';

const TrendingCard = () => {
  const [searches, setSearches] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const user = useSelector(userSelector);
  const homeTab = useSelector(homeTabSelector);

  const dispatch = useDispatch();

  const fetchSearches = () => {
    const URL = `${EXPLORE_URL}/trending_searches`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          const searchData: string[] = res.data.searches || [];
          setSearches(searchData.splice(0, 10));
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

  const fetchProfiles = () => {
    const URL = `${EXPLORE_URL}/users/trending?limit=10`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          const profileData: User[] = res.data.users || [];
          setUsers(profileData.filter(u => u.id != user.id));
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
    fetchProfiles();
    fetchSearches();
  }, []);

  return (
    <>
      {loading ? (
        <TrendingCardLoader />
      ) : (
        <>
          {searches && searches.length > 0 && (
            <div className="w-full h-fit flex flex-col gap-2 bg-white rounded-lg p-4">
              <div className="w-fit text-2xl font-bold text-gradient">Trending Now</div>
              <div className="w-full gap-2 mt-2 flex flex-wrap">
                {searches.map((str, i) => {
                  return (
                    <Link
                      href={`/explore?search=${str}`}
                      key={i}
                      className="w-fit flex items-center gap-2 bg-slate-100 rounded-lg px-4 py-1"
                    >
                      <div>{str}</div>
                      {i < 3 ? <ChartLineUp /> : <></>}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
          {user.id != '' && (
            <div className="relative">
              <div
                onClick={() => {
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                  });
                  if (homeTab == 0) dispatch(setHomeTab(1));
                  else dispatch(setHomeTab(0));
                }}
                className="w-full h-16 relative overflow-clip flex-center gap-2 bg-white rounded-md p-4 hover:shadow-lg cursor-pointer transition-ease-300"
              >
                <div
                  className={`w-fit flex group absolute top-1/2 ${
                    homeTab == 0 ? '-translate-y-1/2 opacity-100' : '-translate-y-20 opacity-0'
                  } hover:-translate-x-1 text-lg font-semibold transition-ease-out-500`}
                >
                  <div className="text-gradient">Check Out What&apos;s Trending!</div>
                  <ArrowRight
                    className="text-dark_secondary_gradient_end absolute z-10 opacity-0 group-hover:opacity-100 top-1/2 right-0 group-hover:-right-5 -translate-y-1/2 transition-ease-out-300"
                    weight="bold"
                  />
                </div>
                <div
                  className={`w-fit flex group absolute top-1/2 ${
                    homeTab == 0 ? 'translate-y-20 opacity-0' : '-translate-y-1/2 opacity-100'
                  } hover:translate-x-1 text-lg font-semibold transition-ease-out-500`}
                >
                  <div className="text-gradient">Back to your Following</div>
                  <ArrowLeft
                    className="text-dark_secondary_gradient_start absolute z-10 opacity-0 group-hover:opacity-100 top-1/2 left-0 group-hover:-left-5 -translate-y-1/2 transition-ease-out-300"
                    weight="bold"
                  />
                </div>
              </div>
              <div
                className={`w-[calc(100%+4px)] h-[calc(100%+4px)] bg-transparent absolute rotating-border-mask opacity-10 ${
                  homeTab == 0 && 'animate-pulse'
                } top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 rounded-lg -z-10 transition-ease-300`}
              ></div>
            </div>
          )}
          {users && users.length > 0 && (
            <div className="w-full h-fit flex flex-col gap-2 bg-white rounded-lg p-4 relative">
              {user.id == '' && (
                <div className="w-full h-[calc(100%-48px)] flex-center flex-col gap-1 absolute top-12 right-0 backdrop-blur-sm rounded-lg z-10">
                  <div className="bg-white flex-center gap-1 border-primary_black border-[1px] rounded-lg px-2 py-1">
                    <Lock /> Locked
                  </div>
                  <Link href={'/login'} className="font-medium hover-underline-animation after:bg-black">
                    Sign up to see who&apos;s here
                  </Link>
                </div>
              )}

              <div className="w-fit text-2xl font-bold text-gradient">Profiles to Follow</div>
              <div className="w-full flex flex-col gap-2">
                {users.map(user => (
                  <UserCard key={user.id} user={user} forTrending={true} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default TrendingCard;
