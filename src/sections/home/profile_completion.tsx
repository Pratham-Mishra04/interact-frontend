import React, { useEffect, useState } from 'react';
import { ArrowUpRight, CheckCircle, Circle } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import Link from 'next/link';
import { profileCompletionOpenSelector, setProfileCompletionOpen } from '@/slices/feedSlice';

const ProfileCompletion = () => {
  const [hide, setHide] = useState(true);

  const user = useSelector(userSelector);
  const open = useSelector(profileCompletionOpenSelector);

  const dispatch = useDispatch();

  const getPercentage = (): number => {
    const totalPoints = 5;
    var counter = 0;
    if ((user.following || []).length >= 3) counter++;
    if ((user.links || []).length != 0) counter++;
    if (user.tagline != '') counter++;
    if (user.email != '' && user.isVerified) counter++;
    if ((user.ownerProjects || []).length != 0) counter++;
    return Math.floor((counter / totalPoints) * 100);
  };

  const completionPercentage = getPercentage();

  useEffect(() => {
    if (user.id != '') {
      if (completionPercentage != 100) setHide(false);
      const circleBackground = document.getElementById('circleBackground');
      const circleLength = 2 * Math.PI * 40;
      const dashOffset = circleLength * ((100 - completionPercentage) / 100);
      circleBackground?.setAttribute('stroke-dashoffset', String(dashOffset));
    }
  }, []);

  return (
    <div
      className={`${
        open
          ? 'w-[36vw] h-[60vh] pb-4 max-md:mb-12 gap-4 pt-6 max-md:pb-8 max-md:pt-4 px-4 bottom-8 right-12 '
          : 'w-[64px] h-[64px] pb-0 gap-0 pt-16 px-0 bottom-4 right-4 hover:shadow-lg '
      } ${
        hide ? 'hidden' : ''
      } rounded-xl shadow-md transition-ease-500 max-md:h-fit fixed overflow-y-hidden overflow-x-hidden max-md:mx-auto font-primary flex flex-col dark:text-white items-center bg-white dark:bg-[#84478023] backdrop-blur-md border-[1px] border-gray-400 dark:border-dark_primary_btn max-md:hidden max-md:bg-transparent  z-10`}
    >
      <div
        onClick={() => dispatch(setProfileCompletionOpen(!open))}
        className={`absolute ${
          open ? 'top-2 right-2' : 'top-[8px] right-[6px]'
        } text-gray-500 dark:text-white transition-ease-500 cursor-pointer`}
      >
        <div
          className={`absolute font-bold group ${
            open ? 'top-[18%] right-[6%] text-2xl z-10 p-4' : 'top-[10px] right-1 text-lg -z-10'
          } transition-ease-500`}
        >
          <div className="absolute text-gradient text-3xl top-[15px] right-[34px] opacity-0 group-hover:opacity-100 transition-ease-300">
            X
          </div>
          <div className=" text-gradient opacity-100 group-hover:opacity-0 transition-all ease-in-out group-hover:duration-300 duration-0">
            {completionPercentage}%
          </div>
        </div>
        <svg
          id="dynamicCircle"
          className={`${open ? 'opacity-100 scale-100' : 'opacity-0 scale-0'} -rotate-90 transition-ease-500`}
          width="100"
          height="100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            id="circleBackground"
            cx="50"
            cy="50"
            r={`${open ? '40' : '75'}`}
            className="transition-ease-500 stroke-dark_primary_btn"
            fill="transparent"
            strokeWidth="5"
            strokeDasharray="251.3274"
          />
        </svg>
      </div>

      <div
        className={`w-full ${
          open ? 'opacity-100 pr-24' : 'opacity-0 pr-0'
        } cursor-default transition-ease-500 font-semibold text-xl text-gray-800 dark:text-white`}
      >
        <div className="text-gradient font-bold text-5xl">Complete Profile </div>
        <Link
          href={'/profile'}
          className="w-fit flex items-center gap-1 hover-underline-animation after:bg-black dark:after:bg-dark_primary_btn"
        >
          <div>to increase your Reach!</div>
          <ArrowUpRight weight="bold" />
        </Link>
      </div>
      <div
        className={`w-full ${
          open ? 'opacity-100' : 'opacity-0'
        } cursor-default transition-ease-500 text-gray-800 dark:text-white`}
      >
        <div className="flex items-center gap-4 px-2 py-4 border-b-[1px] border-gray-200 dark:border-dark_primary_btn">
          {(user.ownerProjects || []).length != 0 ? <CheckCircle size={32} /> : <Circle size={32} />}
          {(user.ownerProjects || []).length != 0 ? (
            <div className="cursor-default">Create a Project</div>
          ) : (
            <Link
              href={'/workspace?action=new_project'}
              onClick={() => dispatch(setProfileCompletionOpen(false))}
              className="hover-underline-animation after:bg-black dark:after:bg-dark_primary_btn"
            >
              Create a Project
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4 px-2 py-4 border-b-[1px] border-gray-200 dark:border-dark_primary_btn">
          {(user.links || []).length != 0 ? <CheckCircle size={32} /> : <Circle size={32} />}
          {(user.links || []).length != 0 ? (
            <div className="cursor-default">Add Links to your social media</div>
          ) : (
            <Link
              href={'/profile?action=edit&tag=links'}
              onClick={() => dispatch(setProfileCompletionOpen(false))}
              className="hover-underline-animation after:bg-black dark:after:bg-dark_primary_btn"
            >
              Add Links to your social media
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4 px-2 py-4 border-b-[1px] border-gray-200 dark:border-dark_primary_btn">
          {user.following && user.following.length >= 3 ? <CheckCircle size={32} /> : <Circle size={32} />}
          {user.following && user.following.length >= 3 ? (
            <div className="cursor-default">Follow at least 3 Profiles</div>
          ) : (
            <Link
              href={'/explore?tab=users'}
              onClick={() => dispatch(setProfileCompletionOpen(false))}
              className="hover-underline-animation after:bg-black dark:after:bg-dark_primary_btn"
            >
              Follow at least 3 Profiles
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4 px-2 py-4 border-b-[1px] border-gray-200 dark:border-dark_primary_btn">
          {user.tagline != '' ? <CheckCircle size={32} /> : <Circle size={32} />}
          {user.tagline != '' ? (
            <div className="cursor-default">Add a Tagline</div>
          ) : (
            <Link
              href={'/profile?action=edit&tag=tagline'}
              onClick={() => dispatch(setProfileCompletionOpen(false))}
              className="hover-underline-animation after:bg-black dark:after:bg-dark_primary_btn"
            >
              Add a Tagline
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4 px-2 py-4 border-b-[1px] border-gray-200 dark:border-dark_primary_btn">
          {user.email && user.isVerified ? <CheckCircle size={32} /> : <Circle size={32} />}
          <div>Complete Sign Up</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletion;
