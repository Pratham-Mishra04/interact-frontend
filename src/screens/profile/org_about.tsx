import FollowBtn from '@/components/common/follow_btn';
import Loader from '@/components/common/loader';
import UserHoverCard from '@/components/common/user_hover_card';
import Mascot from '@/components/empty_fillers/mascot';
import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import Connections from '@/sections/explore/connections_view';
import { userSelector } from '@/slices/userSlice';
import { Organization, OrganizationMembership, Profile, User } from '@/types';
import getDomainName from '@/utils/funcs/get_domain_name';
import getIcon from '@/utils/funcs/get_icon';
import Toaster from '@/utils/toaster';
import { ArrowRight, Envelope, Lock, Phone } from '@phosphor-icons/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

interface Props {
  profile: Profile;
  organisation: Organization;
}

const About = ({ profile, organisation }: Props) => {
  const [memberships, setMemberships] = useState<OrganizationMembership[]>([]);
  const [loading, setLoading] = useState(true);

  const [clickedOnViewAllMembers, setClickedOnViewAllMembers] = useState(false);

  const user = useSelector(userSelector);

  const fetchMemberships = () => {
    const URL = `${ORG_URL}/${organisation.id}/explore_memberships?limit=10`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          setMemberships(res.data.memberships);
          setLoading(false);
        } else Toaster.error(res.data.message, 'error_toaster');
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  useEffect(() => {
    fetchMemberships();
  }, [organisation.id]);

  interface UserProps {
    user: User;
    host?: boolean;
    role?: string;
    title?: string;
  }

  const AboutUser = ({ user, host = false, role, title }: UserProps) => (
    <div className="relative">
      <div className="w-full flex gap-2 items-center justify-between">
        <div className="w-fit flex items-center gap-2 group">
          <UserHoverCard user={user} title={title} />
          <Image
            width={50}
            height={50}
            src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
            alt=""
            className={`${host ? 'w-8 h-8' : 'w-6 h-6'} rounded-full cursor-pointer`}
          />
          <div className={`w-fit ${host ? 'text-xl' : 'text-base'} font-medium cursor-pointer`}>{user.name}</div>
        </div>

        <div className="text-xs border-[1px] border-gray-300 rounded-full px-2 py-1">{role}</div>
        {/* <FollowBtn toFollowID={user.id} smaller={true} /> */}
        {/* <div className="w-20 h-8 bg-gray-100 flex-center rounded-2xl text-sm">Follow</div> */}
      </div>
    </div>
  );

  return (
    <div className="w-5/6 max-md:w-full mx-auto flex max-md:flex-col gap-4 pb-base_padding max-md:px-2">
      {clickedOnViewAllMembers ? (
        <Connections
          type="members"
          user={organisation.user}
          setShow={setClickedOnViewAllMembers}
          org={true}
          orgID={organisation.id}
        />
      ) : (
        <></>
      )}
      <div className="w-1/3 max-md:w-full h-fit flex flex-col gap-2 bg-white border-gray-300 border-[1px] rounded-lg p-4">
        <div className="font-medium">Members of {organisation.title}</div>
        <div className="border-t-[1px] border-gray-200"></div>
        {loading ? (
          <Loader />
        ) : memberships.length > 0 ? (
          <div className={`w-full flex flex-col gap-3 relative ${user.id == '' && 'p-2'}`}>
            {user.id == '' && (
              <div className="w-full h-full flex-center flex-col gap-1 absolute top-0 right-0 backdrop-blur-sm z-10">
                <div className="bg-white flex-center gap-1 border-primary_black border-[1px] rounded-lg px-2 py-1">
                  <Lock /> Locked
                </div>
                <Link href={'/login'} className="font-medium hover-underline-animation after:bg-black">
                  Sign up to see who&apos;s here
                </Link>
              </div>
            )}
            {memberships.map(membership => (
              <AboutUser key={membership.id} user={membership.user} role={membership.role} title={membership.title} />
            ))}
            {memberships.length > 10 && (
              <div
                onClick={() => setClickedOnViewAllMembers(true)}
                className="w-fit mx-auto flex-center gap-1 text-sm cursor-pointer"
              >
                View all <ArrowRight />
              </div>
            )}
          </div>
        ) : (
          <Mascot
            message={
              <div className="w-full flex flex-col justify-center">
                <div className="text-center text-2xl">Starting from scratch!</div>
                <div className="text-center text-sm">No members in this organization yet.</div>
              </div>
            }
          />
        )}
      </div>

      <div className="w-2/3 max-md:w-full flex flex-col gap-4">
        <div className="w-full h-fit flex flex-col gap-2 bg-white border-gray-300 border-[1px] rounded-lg p-4">
          <div className="font-medium">About {organisation.title}</div>
          <div className="border-t-[1px] border-gray-200"></div>
          {profile.description || organisation.user?.tags || profile.email || profile.phoneNo ? (
            <div className="w-full flex flex-col gap-4">
              {profile.description && <div className="whitespace-pre-wrap text-sm">{profile.description}</div>}
              <div className="flex flex-wrap gap-2">
                {organisation.user?.tags?.map(tag => (
                  <Link
                    key={tag}
                    href={'/explore?search=' + tag}
                    target="_blank"
                    className="flex-center bg-gray-100 px-2 py-1 border-[1px] border-dashed border-gray-400 text-xs rounded-lg"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
              {(profile.email || profile.phoneNo) && (
                <div className="w-full flex flex-col gap-2">
                  <div className="font-medium">Contact Info</div>
                  <div className="w-full flex items-center gap-8">
                    {profile.email && (
                      <div className="flex gap-2 items-center text-sm">
                        <Envelope weight="regular" size={24} />
                        <div>{profile.email}</div>
                      </div>
                    )}
                    {profile.phoneNo && (
                      <div className="flex gap-2 items-center text-sm">
                        <Phone weight="regular" size={24} />
                        <div>{profile.phoneNo}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Mascot message="This organization has not shared any details." />
          )}
        </div>
        {(profile.areasOfCollaboration || profile.hobbies) && (
          <div className="w-full flex gap-4">
            {profile.areasOfCollaboration && (
              <div className="w-1/2 h-fit flex flex-col gap-2 bg-white border-gray-300 border-[1px] rounded-lg p-4">
                <div className="font-medium">Areas of Work</div>
                <div className="border-t-[1px] border-gray-200"></div>
                <div className="w-full flex flex-wrap gap-2">
                  {profile.areasOfCollaboration?.map((el, i) => (
                    <div
                      key={i}
                      className="flex-center bg-gray-50 px-2 py-1 border-[1px] border-dashed border-gray-400 text-xs rounded-lg"
                    >
                      {el}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {profile.hobbies && (
              <div className="w-1/2 h-fit flex flex-col gap-2 bg-white border-gray-300 border-[1px] rounded-lg p-4">
                <div className="font-medium">Message Board</div>
                <div className="border-t-[1px] border-gray-200"></div>
                <div className="w-full flex flex-wrap">
                  {profile.hobbies?.map((el, i) => (
                    <div
                      key={i}
                      className="text-sm hover:bg-gray-200 p-3 py-2 rounded-lg cursor-default hover:scale-105 transition-ease-500"
                    >
                      {el}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default About;
