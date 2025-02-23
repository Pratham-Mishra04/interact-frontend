import React from 'react';
import Image from 'next/image';
import { USER_PROFILE_PIC_URL } from '@/config/routes';
import { User } from '@/types';
import Link from 'next/link';
import { Buildings } from '@phosphor-icons/react';
import UserHoverCard from './user_hover_card';

interface Props {
  user: User;
}

const UserSideCard = ({ user }: Props) => {
  return (
    <Link
      href={`${`/${user.isOrganization ? 'organisations' : 'users'}/${user.username}`}`}
      target="_blank"
      className="w-full flex items-center gap-2 hover:bg-primary_comp_hover dark:hover:bg-dark_primary_comp_active rounded-md pl-2 py-1 transition-ease-out-500 animate-fade_third"
    >
      <div className="w-20 flex items-center h-20 relative rounded-full">
        <Image
          crossOrigin="anonymous"
          width={100}
          height={100}
          alt={'User Pic'}
          src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
          placeholder="blur"
          blurDataURL={user.profilePicBlurHash || 'no-hash'}
          className=" rounded-md"
        />
        {user.isOrganization && (
          <div className="w-6 h-6 rounded-full absolute -top-2 -right-2 glassMorphism flex-center shadow-lg">
            <Buildings size={12} />
          </div>
        )}
      </div>

      <div className="w-[calc(100%-44px)] flex flex-col ml-1">
        <div className="w-full flex flex-col space-y-1">
          <UserHoverCard trigger={<div className="font-medium">{user.name}</div>} user={user} />
          <div className="text-sm text-[#525252]">@{user.username}</div>
        </div>

        <div className="w-full text-sm mt-1">{user.tagline}</div>
      </div>
    </Link>
  );
};

export default UserSideCard;
