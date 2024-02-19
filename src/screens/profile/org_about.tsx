import FollowBtn from '@/components/common/follow_btn';
import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import Connections from '@/sections/explore/connections_view';
import { Organization, OrganizationMembership, Profile, User } from '@/types';
import getDomainName from '@/utils/funcs/get_domain_name';
import getIcon from '@/utils/funcs/get_icon';
import Toaster from '@/utils/toaster';
import { ArrowRight, Envelope, Phone } from '@phosphor-icons/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface Props {
  profile: Profile;
  organisation: Organization;
}

const About = ({ profile, organisation }: Props) => {
  const [memberships, setMemberships] = useState<OrganizationMembership[]>([]);
  const [clickedOnViewAllMembers, setClickedOnViewAllMembers] = useState(false);

  const fetchMemberships = () => {
    const URL = `${ORG_URL}/${organisation.id}/explore_memberships?limit=10`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          setMemberships(res.data.memberships);
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
  }

  const AboutUser = ({ user, host = false, role }: UserProps) => (
    <div className="relative">
      <div className="w-full flex gap-2 items-center justify-between">
        <div className="w-fit flex items-center gap-2 group">
          <UserHoverCard user={user} />
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

  const UserHoverCard = ({ user }: UserProps) => (
    //TODO add noFollowers
    <div className="w-2/3 bg-white flex flex-col gap-2 rounded-xl p-4 shadow-xl absolute -translate-y-3/4 -top-2 opacity-0 group-hover:opacity-100 group-hover:-translate-y-full z-[-1] group-hover:z-50 transition-ease-500">
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
      <div className="text-gray-600 text-sm">{user.tagline}</div>
      <div className="w-full flex flex-wrap gap-4">
        {user.links?.map(link => (
          <Link key={link} href={link} target="_blank">
            {getIcon(getDomainName(link), 22, 'regular')}
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-5/6 mx-auto flex gap-4 pb-base_padding">
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
      <div className="w-1/3 h-fit flex flex-col gap-2 bg-white border-gray-300 border-[1px] rounded-lg p-4">
        <div className="font-medium">Members of {organisation.title}</div>
        <div className="border-t-[1px] border-gray-200"></div>
        <div className="w-full flex flex-col gap-3">
          {memberships.map(membership => (
            <AboutUser key={membership.id} user={membership.user} role={membership.role} />
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
      </div>

      <div className="w-2/3 flex flex-col gap-4">
        <div className="w-full h-fit flex flex-col gap-2 bg-white border-gray-300 border-[1px] rounded-lg p-4">
          <div className="font-medium">About {organisation.title}</div>
          <div className="border-t-[1px] border-gray-200"></div>
          <div className="w-full flex flex-col gap-4">
            {profile.description ? (
              <div className="whitespace-pre-wrap text-sm">{profile.description}</div>
            ) : (
              <div className="font-medium">Organisation has no description</div>
            )}
            <div className="flex flex-wrap gap-2">
              {organisation.user?.tags.map(tag => (
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
