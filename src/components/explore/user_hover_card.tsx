import React, { ReactNode } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import Image from 'next/image';
import { USER_PROFILE_PIC_URL } from '@/config/routes';
import { User } from '@/types';
import Link from 'next/link';

const UserHoverCard = ({ trigger, user }: { trigger: ReactNode; user: User }) => {
  return (
    <HoverCard>
      <HoverCardTrigger>{trigger}</HoverCardTrigger>
      <HoverCardContent className="w-80">
        <Link
          href={`/${user.isOrganization ? 'organisations' : 'users'}/${user.username}`}
          className="flex justify-between space-x-4"
        >
          <Image
            crossOrigin="anonymous"
            width={100}
            height={100}
            alt={'User Pic'}
            src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
            className="w-10 h-10 rounded-full mt-1"
          />
          <div className="w-[calc(100%-40px)]">
            <div className="w-fit flex-center gap-1">
              <h4 className="text-lg font-semibold">{user.name}</h4>
              <h4 className="text-xs font-medium text-gray-500">@{user.username}</h4>
            </div>
            <p className="text-sm">{user.tagline}</p>
            <div className="text-xs text-muted-foreground font-medium mt-2">
              {user.noFollowers} Follower{user.noFollowers !== 1 && 's'}
            </div>
          </div>
        </Link>
      </HoverCardContent>
    </HoverCard>
  );
};

export default UserHoverCard;
