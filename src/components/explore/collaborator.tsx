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

// const Collaborators = ({ memberships, workspace = false }: Props) => {
//   const maxIndex = workspace ? 5 : 10;

//   return (
//     <>
//       {memberships && memberships.length > 0 && (
//         <div className="w-full flex flex-col gap-2">
//           <div className="text-lg font-semibold">Collaborators</div>
//           <div className={`grid ${workspace ? 'grid-cols-5' : 'grid-cols-10'} gap-4`}>
//             {memberships.map((membership, index) => {
//               return (
//                 <Link
//                   key={membership.id}
//                   href={`/explore/user/${membership.user.username}`}
//                   target="_blank"
//                   className="w-12 h-12 rounded-full relative group"
//                 >
//                   <div
//                     className={`${workspace ? 'w-36' : 'w-48'} absolute -top-24 ${
//                       (index + 1) % maxIndex == 0 || index % maxIndex == 0
//                         ? index == 0
//                           ? 'left-0'
//                           : 'right-0'
//                         : 'left-0'
//                     } scale-0 px-3 rounded-lg border-2  border-gray-300 bg-white py-2 text-sm font-semibold shadow-2xl transition-ease-300 capitalize group-hover:scale-100`}
//                   >
//                     <div className="font-bold text-base text-gradient line-clamp-1">{membership.user.name}</div>
//                     <div className="text-xs font-medium line-clamp-1">{membership.title}</div>
//                     {workspace ? (
//                       <div className="text-xs font-semibold mt-2">{membership.role}</div>
//                     ) : (
//                       <div className="flex gap-1 text-xs mt-2">
//                         <div className="font-bold">{membership.user.noFollowers}</div>
//                         <div>Follower{membership.user.noFollowers != 1 ? 's' : ''}</div>
//                       </div>
//                     )}
//                   </div>
//                   <div className="hover:scale-110 transition-ease-300">
//                     <Image
//                       crossOrigin="anonymous"
//                       width={100}
//                       height={100}
//                       alt={'User Pic'}
//                       src={`${USER_PROFILE_PIC_URL}/${membership.user.profilePic}`}
//                       className="w-12 h-12 rounded-full"
//                     />
//                   </div>
//                 </Link>
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

const Collaborators = ({ memberships, workspace = false }: Props) => {
  const user = useSelector(userSelector);

  interface UserProps {
    user: User;
    host?: boolean;
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
            className={`${workspace ? 'w-6 h-6' : 'w-10 h-10'} rounded-full cursor-pointer`}
          />
          <div className={`w-fit ${workspace ? 'text-base' : 'text-xl'} font-medium cursor-pointer`}>{user.name}</div>
        </div>

        {workspace ? (
          <div className="text-xs border-[1px] border-gray-300 rounded-full px-2 py-1">{role}</div>
        ) : (
          <FollowBtn toFollowID={user.id} />
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
