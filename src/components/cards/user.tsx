import { USER_PROFILE_PIC_URL } from '@/config/routes';
import { User } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface Props {
  user: User;
}

const UserCard = ({ user }: Props) => {
  return (
    <Link
      href={`/users/${user.username}?action=external`}
      target="_blank"
      className="w-full bg-white dark:bg-dark_primary_comp_hover font-primary border-[1px] border-primary_btn  dark:border-dark_primary_btn rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-ease-300"
    >
      <Image
        crossOrigin="anonymous"
        width={100}
        height={100}
        alt={'User Pic'}
        src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
        className="w-44 h-44 rounded-full"
      />
      <div className="text-2xl text-center font-bold text-gradient">{user.name}</div>
      <div className="text-sm text-center">{user.tagline}</div>
      <div className="w-full flex justify-around text-xs">
        <div className="flex gap-1">
          <div className="font-bold">{user.noFollowers}</div>
          <div>Follower{user.noFollowers != 1 ? 's' : ''}</div>
        </div>
        <div className="flex gap-1">
          <div className="font-bold">{user.noFollowing}</div>
          <div>Following</div>
        </div>
      </div>
    </Link>
  );
};

export default UserCard;
