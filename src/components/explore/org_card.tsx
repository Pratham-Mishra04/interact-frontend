import React, { useState } from 'react';
import Image from 'next/image';
import { USER_COVER_PIC_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import { User } from '@/types';
import Link from 'next/link';
import FollowBtn from '../common/follow_btn';
import { Eye, IdentificationBadge, MapPin, Users } from '@phosphor-icons/react';
import { userSelector } from '@/slices/userSlice';
import { useSelector } from 'react-redux';

interface Props {
  user: User;
}

const OrgCard = ({ user }: Props) => {
  const [noFollowers, setNoFollowers] = useState(user.noFollowers);
  const loggedInUser = useSelector(userSelector);
  return (
    <Link
      href={`/explore/organisation/${user.username}`}
      target="_blank"
      className="w-72 max-md:w-4/5 flex flex-col gap-2 rounded-xl bg-white font-primary hover:shadow-xl transition-ease-300"
    >
      <div className="w-full relative">
        <Image
          crossOrigin="anonymous"
          width={100}
          height={100}
          alt={'User Pic'}
          src={`${USER_COVER_PIC_URL}/${user.coverPic}`}
          className="w-full h-32 rounded-t-xl fade-img"
        />
        <Image
          crossOrigin="anonymous"
          width={100}
          height={100}
          alt={'User Pic'}
          src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
          className="w-32 h-32 rounded-full absolute bottom-6 right-1/2 translate-x-1/2 translate-y-1/2"
        />
        {/* <Image
          crossOrigin="anonymous"
          width={10000}
          height={10000}
          alt={'User Pic'}
          src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
          className="w-32 h-32 rounded-full mx-auto"
        /> */}
      </div>
      <div className="w-full h-full flex flex-col justify-between gap-4 p-4 pt-12">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex flex-col items-center">
            <div className="w-full text-center text-2xl font-semibold line-clamp-1">{user.name}</div>
            <div className="text-sm text-gray-500 font-medium">@{user.username}</div>
          </div>

          <div className="w-full flex flex-col gap-2 px-2 font-medium text-xs text-gray-700">
            <div className="w-full flex justify-between flex-wrap gap-2 font-medium text-xs text-gray-700">
              <div className="flex gap-1 items-center">
                <Users />{' '}
                <div>
                  {noFollowers} Follower{noFollowers != 1 ? 's' : ''}
                </div>
              </div>
              <div className="flex gap-1 items-center">
                <div>{user.noImpressions}</div> <Eye />
              </div>
            </div>
            <div className="w-full flex justify-between flex-wrap gap-2 font-medium text-xs text-gray-700">
              {user.organization ? (
                <div className="flex gap-1 items-center">
                  <IdentificationBadge />
                  <div>
                    {user.organization?.noMembers} Member{user.organization?.noMembers != 1 ? 's' : ''}
                  </div>
                </div>
              ) : (
                <></>
              )}

              {user.profile?.location ? (
                <div className="flex gap-1 items-center">
                  <div className="text-xs">{user.profile.location}</div> <MapPin />
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>

          <div className="border-t-[1px] border-gray-500 border-dashed"></div>

          {user.tagline != '' ? <div className="text-sm text-gray-600 text-center">{user.tagline}</div> : <></>}
        </div>
        {loggedInUser.id != '' && (
          <div
            onClick={el => {
              el.preventDefault();
            }}
            className="w-full flex-center"
          >
            <FollowBtn toFollowID={user.id} setFollowerCount={setNoFollowers} />
          </div>
        )}
      </div>
    </Link>
  );
};

export default OrgCard;
