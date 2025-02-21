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
      className="w-full flex items-center gap-2 hover:bg-primary_comp_hover dark:hover:bg-dark_primary_comp_active rounded-md p-2 transition-ease-out-500 animate-fade_third"
    >
      <div className="w-11 h-11 relative rounded-full">
        <Image
          crossOrigin="anonymous"
          width={100}
          height={100}
          alt={'User Pic'}
          src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
          placeholder="blur"
          blurDataURL={user.profilePicBlurHash || 'no-hash'}
          className="rounded-full w-11 h-11"
        />
        {user.isOrganization && (
          <div className="w-6 h-6 rounded-full absolute -top-2 -right-2 glassMorphism flex-center shadow-lg">
            <Buildings size={12} />
          </div>
        )}
      </div>

      <div className="w-[calc(100%-44px)]">
        <div className="w-full flex items-center gap-2">
          <UserHoverCard
            trigger={<div className="font-medium hover:underline underline-offset-2">{user.name}</div>}
            user={user}
          />
          <div className="text-sm">@{user.username}</div>
        </div>

        <div className="w-full text-sm">{user.tagline}</div>
      </div>
    </Link>
  );
};

export default UserSideCard;
