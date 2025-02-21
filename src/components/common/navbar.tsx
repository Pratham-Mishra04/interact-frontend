import Notifications from '@/sections/navbar/notifications';
import { unreadChatsSelector, unreadNotificationsSelector } from '@/slices/feedSlice';
import { Bell, ChatCircleDots, Handshake } from '@phosphor-icons/react';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { ReactSVG } from 'react-svg';
import Image from 'next/image';
import { USER_PROFILE_PIC_URL } from '@/config/routes';
import { userSelector } from '@/slices/userSlice';
import ProfileDropdown from '@/sections/navbar/profile_dropdown';
import Link from 'next/link';
import Feedback from './feedback';
import { Button } from '../ui/button';
import { DialogSearchBar } from '../explore/searchbar';
import TooltipIcon from './tooltip_icon';

const Navbar = ({ includeExplore = false }: { includeExplore?: boolean }) => {
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
        {user.isLoggedIn ? (
          <div className="flex items-center gap-2 max-md:gap-0 z-0">
            {includeExplore && <DialogSearchBar />}
            <TooltipIcon
              label="Feedback"
              onClick={() => setClickedOnFeedback(true)}
              icon={<Handshake className="max-md:w-6 max-md:h-6" size={24} weight="regular" />}
            />
            <TooltipIcon
              label="Chats"
              icon={
                <Link className="w-full h-full relative" href={'/messaging'}>
                  {chats > 0 && (
                    <div className="w-4 h-4 animate-pulse rounded-full absolute top-0 right-0 flex items-center justify-center text-xs bg-black dark:text-white">
                      {chats}
                    </div>
                  )}
                  <ChatCircleDots className="max-md:w-6 max-md:h-6" size={24} weight="regular" />
                </Link>
              }
            />
            <TooltipIcon
              label="Notifications"
              icon={
                <div
                  onClick={() => {
                    setClickedOnProfile(false);
                    setClickedOnNotifications(prev => !prev);
                    // dispatch(setUnreadNotifications(0));
                  }}
                  className="w-full h-full relative"
                >
                  {notifications > 0 && (
                    <div className="w-4 h-4 animate-pulse rounded-full absolute top-0 right-0 flex items-center justify-center text-xs bg-black dark:text-white">
                      {notifications}
                    </div>
                  )}
                  <Bell className="cursor-pointer max-md:w-6 max-md:h-6" size={24} weight="regular" />
                </div>
              }
            />
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
        ) : (
          <Button onClick={() => window.location.assign('/login')}>Register Now!</Button>
        )}
      </div>
    </>
  );
};

export default Navbar;
