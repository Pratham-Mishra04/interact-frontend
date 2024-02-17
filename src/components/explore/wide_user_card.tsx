import React, { useState } from 'react';
import Image from 'next/image';
import { USER_COVER_PIC_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import { User } from '@/types';
import Link from 'next/link';
import FollowBtn from '../common/follow_btn';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import { Buildings, Eye, MapPin, Users } from '@phosphor-icons/react';

interface Props {
  user: User;
}

const UserCard = ({ user }: Props) => {
  const [noFollowers, setNoFollowers] = useState(user.noFollowers);
  const loggedInUser = useSelector(userSelector);
  return (
    <Link
      href={`${
        user.username != loggedInUser.username
          ? `/explore/${user.isOrganization ? 'organisation' : 'user'}/${user.username}`
          : '/profile'
      }`}
      target="_blank"
      className="w-90 max-md:w-full flex flex-col gap-2 rounded-xl bg-white font-primary hover:shadow-xl transition-ease-300"
    >
      <div className="w-full relative">
        <Image
          crossOrigin="anonymous"
          width={200}
          height={200}
          alt={'User Pic'}
          src={`${USER_COVER_PIC_URL}/${user.coverPic}`}
          className="w-full h-40 rounded-t-xl fade-img absolute top-0"
        />
        <div className="w-full flex gap-4 p-4">
          <Image
            crossOrigin="anonymous"
            width={100}
            height={100}
            alt={'User Pic'}
            src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
            className="w-24 h-24 rounded-full z-[1]"
          />
          <div className="w-full flex flex-col justify-center">
            <div className="w-full text-2xl font-semibold line-clamp-1">{user.name}</div>
            <div className="w-full text-sm text-gray-600 font-medium">@{user.username}</div>
          </div>
        </div>
      </div>
      <div className="w-full h-full flex flex-col justify-between p-4 pt-0 gap-4">
        <div>
          {user.tags && user.tags.length > 0 ? (
            <div className="w-full flex flex-wrap gap-2">
              {user.tags
                .filter((_, index) => {
                  return index >= 0 && index < 3;
                })
                .map(tag => {
                  return (
                    <div
                      key={tag}
                      className="text-gray-600 flex-center px-2 py-1 text-xs border-[1px] border-gray-500 rounded-lg"
                    >
                      {tag}
                    </div>
                  );
                })}
              {user.tags.length - 3 > 0 ? (
                <div className="text-gray-600 flex-center px-2 py-1 text-xs border-[1px] border-gray-500 rounded-lg">
                  +{user.tags.length - 3}
                </div>
              ) : (
                <></>
              )}
            </div>
          ) : (
            <></>
          )}
        </div>
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex flex-col gap-4">
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
                {user.profile?.school ? (
                  <div className="flex gap-1 items-center">
                    <Buildings /> <div className="text-xs">{user.profile.school}</div>
                  </div>
                ) : (
                  <></>
                )}

                {user.profile?.location ? (
                  <div
                    className={`flex gap-1 items-center ${
                      !user.profile || user.profile.school == '' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className="text-xs">{user.profile.location}</div>
                    <MapPin />
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>

            <div className="border-t-[1px] border-gray-500 border-dashed"></div>
            {user.tagline != '' ? <div className="text-sm text-gray-600 text-center">{user.tagline}</div> : <></>}
          </div>
          <div
            onClick={el => {
              el.preventDefault();
            }}
            className="w-full flex-center"
          >
            <FollowBtn toFollowID={user.id} setFollowerCount={setNoFollowers} />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default UserCard;
