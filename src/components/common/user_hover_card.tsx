import { USER_PROFILE_PIC_URL } from '@/config/routes';
import { User } from '@/types';
import getDomainName from '@/utils/funcs/get_domain_name';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import getIcon from '@/utils/funcs/get_icon';

interface Props {
  user: User;
  title?: string;
  scaleTransition?: boolean;
}

const UserHoverCard = ({ user, title, scaleTransition = false }: Props) => {
  return (
    <div
      className={`w-2/3 bg-white flex flex-col gap-2 rounded-xl p-4 shadow-xl absolute -translate-y-3/4 -top-2 opacity-0 group-hover:opacity-100 group-hover:-translate-y-full ${
        scaleTransition && 'scale-0 group-hover:scale-100'
      } -z-10 group-hover:z-50 transition-ease-500`}
    >
      <Image
        width={50}
        height={50}
        src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
        alt=""
        className="w-12 h-12 rounded-full"
      />
      <Link href={'/explore/user/' + user.username} target="_blank" className="w-fit flex flex-wrap items-center gap-2">
        <div className="text-xl font-semibold">{user.name}</div>
        <div className="text-gray-400 text-xs">@{user.username}</div>
      </Link>
      <div className="text-gray-600 text-sm">{title}</div>
      <div className="flex items-center gap-1 text-xs font-medium text-gray-600">
        {user.noFollowers} Follower{user.noFollowers != 1 && 's'}
      </div>
      <div className="w-full flex flex-wrap gap-4">
        {user.links?.map(link => (
          <Link key={link} href={link} target="_blank">
            {getIcon(getDomainName(link), 22, 'regular')}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default UserHoverCard;
