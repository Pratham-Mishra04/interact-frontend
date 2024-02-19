import { USER_COVER_PIC_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { initialUser } from '@/types/initials';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import ProfileCardLoader from '@/components/loaders/feed_profile_card';
import Connections from '../explore/connections_view';
import { SERVER_ERROR } from '@/config/errors';
import Link from 'next/link';
import { PencilSimple } from '@phosphor-icons/react';

const ProfileCard = () => {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(true);

  const [clickedOnFollowers, setClickedOnFollowers] = useState(false);
  const [clickedOnFollowing, setClickedOnFollowing] = useState(false);

  const fetchUser = () => {
    const URL = `/users/me`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          setUser(res.data.user);
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
    fetchUser();
  }, []);

  return (
    <>
      {clickedOnFollowers ? <Connections type="followers" user={user} setShow={setClickedOnFollowers} /> : <></>}
      {clickedOnFollowing ? <Connections type="following" user={user} setShow={setClickedOnFollowing} /> : <></>}
      {loading ? (
        <ProfileCardLoader />
      ) : (
        <div className="w-full h-fit flex flex-col gap-2 bg-white rounded-lg pb-4">
          <div className="relative">
            <div className="relative">
              <Link
                href={`/${user.isOrganization ? 'organisation/' : ''}profile?action=edit&tag=coverPic`}
                className="w-full h-full absolute top-0 right-0 rounded-t-lg flex-center pb-12 bg-white transition-ease-200 cursor-pointer opacity-0 hover:opacity-50"
              >
                <PencilSimple color="black" size={24} />
              </Link>
              <Image
                crossOrigin="anonymous"
                className="w-full rounded-t-lg"
                width={200}
                height={200}
                alt="Cover Pic"
                src={`${USER_COVER_PIC_URL}/${user.coverPic}`}
              />
            </div>

            <div className="absolute translate-x-1/2 -translate-y-1/2 right-1/2">
              <Link
                href={`/${user.isOrganization ? 'organisation/' : ''}profile?action=edit&tag=profilePic`}
                className="w-28 h-28 absolute top-0 right-0 rounded-full flex-center bg-white transition-ease-200 cursor-pointer opacity-0 hover:opacity-50"
              >
                <PencilSimple color="black" size={24} />
              </Link>
              <Image
                crossOrigin="anonymous"
                className="w-28 h-28 rounded-full"
                width={100}
                height={100}
                alt="Profile Pic"
                src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
              />
            </div>
          </div>
          <div className="w-full flex flex-col items-center pt-14">
            <Link
              href={`/${user.isOrganization ? 'organisation/' : ''}profile?action=edit&tag=name`}
              className="w-fit relative group rounded-lg flex-center px-8 py-1 hover:bg-primary_comp cursor-pointer transition-ease-300"
            >
              <PencilSimple className="absolute opacity-0 group-hover:opacity-100 top-1/2 right-2 -translate-y-1/2 transition-ease-300" />
              <div className="w-full text-2xl font-semibold text-center line-clamp-1">{user.name}</div>
            </Link>
            <div className="text-sm text-gray-600">@{user.username}</div>
          </div>
          <div className="w-full flex justify-center gap-4">
            <div onClick={() => setClickedOnFollowers(true)} className="flex-center gap-1 cursor-pointer">
              <div className="font-bold">{user.noFollowers}</div>
              <div className="">Follower{user.noFollowers != 1 ? 's' : ''}</div>
            </div>
            <div onClick={() => setClickedOnFollowing(true)} className="flex-center gap-1 cursor-pointer">
              <div className="font-bold">{user.noFollowing}</div>
              <div className="">Following</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileCard;
