import React from 'react';
import Image from 'next/image';
import { USER_PROFILE_PIC_URL } from '@/config/routes';
import { Membership, User } from '@/types';
import Link from 'next/link';
import UserHoverCard from '../common/user_hover_card';
import { Lock } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import FollowBtn from '../common/follow_btn';

interface Props {
  memberships: Membership[];
  workspace?: boolean;
}

const Collaborators = ({ memberships, workspace = false }: Props) => {
  const user = useSelector(userSelector);

  interface UserProps {
    user: User;
    role?: string;
    title?: string;
  }

  const AboutUser = ({ user, role, title }: UserProps) => (
    <div className="relative">
      <div className="w-full flex gap-2 items-center justify-between">
        <div className="w-fit flex items-center gap-2 group">
          <UserHoverCard user={user} title={workspace ? title : role} scaleTransition={true} />
          <Image
            width={50}
            height={50}
            src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
            alt=""
            className={`${workspace ? 'w-6 h-6' : 'w-8 h-8'} rounded-full cursor-pointer`}
          />
          <div className={`w-fit ${workspace ? 'text-base' : 'text-lg'} font-medium cursor-pointer`}>{user.name}</div>
        </div>

        {workspace ? (
          <div className="text-xs border-[1px] border-gray-300 rounded-full px-2 py-1">{role}</div>
        ) : (
          <FollowBtn toFollowID={user.id} smaller={true} />
        )}
      </div>
    </div>
  );
  return (
    <>
      {memberships && memberships.length > 0 && (
        <div className={`w-full flex flex-col gap-3 relative ${user.id == '' && 'p-2'}`}>
          {user.id == '' && (
            <div className="w-full h-full flex-center flex-col gap-1 absolute top-0 right-0 backdrop-blur-sm">
              <div className="bg-white flex-center gap-1 border-primary_black border-[1px] rounded-lg px-2 py-1">
                <Lock /> Locked
              </div>
              <Link href={'/login'} className="font-medium hover-underline-animation after:bg-black">
                Sign up to see who&apos;s here
              </Link>
            </div>
          )}
          <div className="text-lg font-semibold">Collaborators</div>
          {memberships.map(membership => (
            <AboutUser key={membership.id} user={membership.user} role={membership.role} title={membership.title} />
          ))}
          {/* {memberships.length > 10 && (
                <div
                  onClick={() => setClickedOnViewAllMembers(true)}
                  className="w-fit mx-auto flex-center gap-1 text-sm cursor-pointer"
                >
                  View all <ArrowRight />
                </div>
              )} */}
        </div>
      )}
    </>
  );
};

export default Collaborators;
