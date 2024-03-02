import { profileCompletionOpenSelector, setProfileCompletionOpen } from '@/slices/feedSlice';
import { userSelector } from '@/slices/userSlice';
import { useWindowWidth } from '@react-hook/window-size';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

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
    if (completionPercentage != 100) setHide(false);
    if (user.id == '') setHide(true);
    const circleBackground = document.getElementById('circleBackground');
    const circleLength = 2 * Math.PI * parseFloat(circleBackground?.getAttribute('r') as string);
    const dashOffset = circleLength * ((100 - completionPercentage) / 100);
    circleBackground?.setAttribute('stroke-dashoffset', String(dashOffset));
  }, []);

  const width = useWindowWidth();

  return (
    <Link
      href={'/profile'}
      onClick={el => {
        if (width > 760) {
          el.preventDefault();
          dispatch(setProfileCompletionOpen(!open));
        }
      }}
      className={`${
        hide ? 'hidden' : ''
      } w-96 p-6 max-md:p-4 flex flex-col items-center justify-center gap-2 hover:shadow-xl bg-white dark:bg-transparent dark:text-white dark:border-dark_primary_btn rounded-xl cursor-pointer transition-ease-500`}
    >
      <div className="relative">
        <div className="text-3xl font-bold absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 text-gradient">
          {completionPercentage}%
        </div>
        <svg id="dynamicCircle" className="-rotate-90" width="150" height="150" xmlns="http://www.w3.org/2000/svg">
          <circle
            id="circleBackground"
            cx="75"
            cy="75"
            r="60"
            className="stroke-dark_primary_btn"
            fill="transparent"
            strokeWidth="8"
            strokeDasharray="376.8"
          />
        </svg>
      </div>
      <div className="w-full text-center flex flex-col gap-1">
        <div className="text-gradient text-5xl font-bold">Complete Profile</div>
        <div className="text-lg font-medium">to increase your reach!</div>
      </div>
    </Link>
  );
};

export default ProfileCompletion;
