import Notifications from '@/sections/navbar/notifications';
import { unreadChatsSelector, unreadNotificationsSelector } from '@/slices/feedSlice';
import { Bell, ChatCircleDots, Handshake, MagnifyingGlass } from '@phosphor-icons/react';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { ReactSVG } from 'react-svg';
import Image from 'next/image';
import { USER_PROFILE_PIC_URL } from '@/config/routes';
import { userSelector } from '@/slices/userSlice';
import ProfileDropdown from '@/sections/navbar/profile_dropdown';
import Link from 'next/link';
import Feedback from './feedback';

const Navbar = () => {
  const [clickedOnNotifications, setClickedOnNotifications] = useState(false);
  const [clickedOnProfile, setClickedOnProfile] = useState(false);
  const [clickedOnFeedback, setClickedOnFeedback] = useState(false);

  const user = useSelector(userSelector);
  const notifications = useSelector(unreadNotificationsSelector);
  const chats = (useSelector(unreadChatsSelector) || []).length;

  return (
    <>
      {clickedOnNotifications && <Notifications setShow={setClickedOnNotifications} />}
      {clickedOnFeedback && <Feedback setShow={setClickedOnFeedback} />}
      <div className={`${clickedOnProfile ? '' : 'hidden'}`}>
        <ProfileDropdown setShow={setClickedOnProfile} />
      </div>
      <div className="w-full h-navbar bg-navbar dark:bg-dark_navbar text-gray-500 dark:text-white border-gray-300 border-b-[1px] dark:border-0 glassMorphism backdrop-blur-sm fixed top-0 flex justify-between px-4 items-center z-20">
        <Link href={'/home'} className="hidden dark:flex px-4 max-md:px-0">
          <ReactSVG src="/onboarding_logo_dark.svg" />
        </Link>
        <Link href={'/home'} className="static dark:hidden px-4 max-md:px-0">
          <ReactSVG src="/onboarding_logo.svg" />
        </Link>
        {user.isLoggedIn && (
          <div className="flex items-center gap-2 max-md:gap-0 z-0">
            <div
              onClick={() => setClickedOnFeedback(true)}
              className="w-10 h-10 rounded-full flex-center hover:bg-primary_comp_hover dark:hover:bg-dark_primary_comp_hover cursor-pointer transition-ease-300"
            >
              <Handshake className="max-md:w-6 max-md:h-6" size={24} weight="regular" />
            </div>
            <Link
              className="w-10 h-10 rounded-full flex-center hover:bg-primary_comp_hover dark:hover:bg-dark_primary_comp_hover transition-ease-300"
              href={`/${user.isOrganization ? 'organisation/' : ''}explore`}
            >
              <MagnifyingGlass className="max-md:w-6 max-md:h-6" size={24} weight="regular" />
            </Link>
            <Link
              className="w-10 h-10 rounded-full flex-center relative hover:bg-primary_comp_hover dark:hover:bg-dark_primary_comp_hover transition-ease-300"
              href={'/messaging'}
            >
              {chats > 0 && (
                <div className="w-4 h-4 animate-pulse rounded-full absolute top-0 right-0 flex items-center justify-center text-xs bg-black dark:text-white">
                  {chats}
                </div>
              )}
              <ChatCircleDots className="max-md:w-6 max-md:h-6" size={24} weight="regular" />
            </Link>
            <div
              onClick={() => {
                setClickedOnProfile(false);
                setClickedOnNotifications(prev => !prev);
                // dispatch(setUnreadNotifications(0));
              }}
              className="w-10 h-10 rounded-full flex-center relative hover:bg-primary_comp_hover dark:hover:bg-dark_primary_comp_hover transition-ease-300"
            >
              {notifications > 0 && (
                <div className="w-4 h-4 animate-pulse rounded-full absolute top-0 right-0 flex items-center justify-center text-xs bg-black dark:text-white">
                  {notifications}
                </div>
              )}
              <Bell className="cursor-pointer max-md:w-6 max-md:h-6" size={24} weight="regular" />
            </div>
            <Image
              crossOrigin="anonymous"
              className="w-9 h-9 max-md:w-6 max-md:h-6 max-md:ml-2 rounded-full cursor-pointer"
              onClick={() => {
                setClickedOnNotifications(false);
                setClickedOnProfile(prev => !prev);
              }}
              width={50}
              height={50}
              alt="user"
              src={`${USER_PROFILE_PIC_URL}/${user.profilePic != '' ? user.profilePic : 'default.jpg'}`}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
