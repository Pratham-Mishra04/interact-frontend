import React from 'react';
import Image from 'next/image';
import { Profile, Organization } from '@/types';
import renderContentWithLinks from '@/utils/funcs/render_content_with_links';
import { Buildings, CalendarBlank, Certificate, Envelope, MapPin, Phone } from '@phosphor-icons/react';
import { USER_PROFILE_PIC_URL } from '@/config/routes';
import Link from 'next/link';

interface Props {
  profile: Profile;
  org?: boolean;
  organizations?: Organization[];
}

const About = ({ profile, org = false, organizations }: Props) => {
  const hasBasicInfo = profile.email || profile.phoneNo || profile.location;
  const hasEducation = profile.school || profile.degree;
  const hasOrganizations = organizations && organizations.length > 0;
  const hasDescription = profile.description;
  const hasCollaborationAreas = profile.areasOfCollaboration && profile.areasOfCollaboration.length > 0;
  const hasHobbies = profile.hobbies && profile.hobbies.length > 0;

  return (
    <div className="w-full text-primary_black dark:text-white mx-auto flex flex-col gap-6 max-md:px-6 pb-8 animate-fade_third">
      {!org && (
        <>
          {hasOrganizations && (
            <>
              <div className="w-full flex flex-wrap items-center gap-2">
                <div className="whitespace-nowrap">Member of</div>
                <div className="flex flex-wrap gap-2">
                  {organizations.map((org, i) => (
                    <Link
                      key={i}
                      href={`/organisations/${org.user.username}`}
                      target="_blank"
                      className="flex items-center gap-1"
                    >
                      <Image
                        src={`${USER_PROFILE_PIC_URL}/${org.user.profilePic}`}
                        alt={org.title}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <div className="font-medium hover-underline-animation after:bg-gray-700 dark:after:bg-white">
                        {org.title}
                      </div>
                      {i < organizations.length - 1 && <span>,</span>}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="w-full h-[1px] border-t-[1px] border-gray-400 border-dashed"></div>
            </>
          )}
          <div className="w-full flex flex-col gap-4">
            {profile.school && (
              <div className="w-full flex justify-between items-center flex-wrap gap-4">
                <div className="flex gap-2 items-center text-xl font-medium">
                  <Buildings weight="bold" size={24} />
                  <div>{profile.school}</div>
                </div>
                {profile.yearOfGraduation != 0 && (
                  <div className="flex gap-1 items-center">
                    <div>{profile.yearOfGraduation}</div>
                    <CalendarBlank weight="bold" size={20} />
                  </div>
                )}
              </div>
            )}
            {profile.degree && (
              <div className="flex gap-2 items-center text-lg">
                <Certificate weight="bold" size={24} />
                <div>{profile.degree}</div>
              </div>
            )}
          </div>
          {hasEducation && <div className="w-full h-[1px] border-t-[1px] border-gray-400 border-dashed"></div>}
        </>
      )}
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-between items-center flex-wrap gap-4">
          {profile.email && (
            <div className="flex gap-2 items-center text-lg font-medium">
              <Envelope weight="regular" size={24} />
              <div>{profile.email}</div>
            </div>
          )}
          {profile.phoneNo && (
            <div className="flex gap-2 items-center text-lg font-medium">
              <Phone weight="regular" size={24} />
              <div>{profile.phoneNo}</div>
            </div>
          )}
        </div>

        {!org && profile.location && (
          <div className="flex gap-2 items-center text-lg">
            <MapPin weight="regular" size={24} />
            <div>{profile.location}</div>
          </div>
        )}
      </div>
      {(hasBasicInfo || profile.location) && (
        <div className="w-full h-[1px] border-t-[1px] border-gray-400 border-dashed"></div>
      )}
      {hasDescription && (
        <>
          <div className="w-full whitespace-pre-wrap break-words">{renderContentWithLinks(profile.description)}</div>
          <div className="w-full h-[1px] border-t-[1px] border-gray-400 border-dashed"></div>
        </>
      )}
      {hasCollaborationAreas && (
        <>
          <div className="w-full flex flex-col gap-2">
            <div className="text-sm font-medium uppercase">
              {org ? 'Areas of Work' : 'Preferred Areas of Collaboration'}
            </div>
            <div className="w-full flex flex-wrap gap-2">
              {profile.areasOfCollaboration.map((el, i) => (
                <div
                  key={i}
                  className="bg-white dark:text-primary_black p-3 py-2 text-xs rounded-lg cursor-default hover:scale-105 transition-ease-500"
                >
                  {el}
                </div>
              ))}
            </div>
          </div>
          <div className="w-full h-[1px] border-t-[1px] border-gray-400 border-dashed"></div>
        </>
      )}
      {hasHobbies && (
        <div className="w-full flex flex-col gap-2">
          <div className="text-sm font-medium uppercase">{org ? 'Message Board' : 'Hobbies and Interests'}</div>
          <div className="w-full flex flex-wrap gap-2">
            {profile.hobbies.map((el, i) => (
              <div
                key={i}
                className="bg-white dark:text-primary_black p-3 py-2 text-xs rounded-lg cursor-default hover:scale-105 transition-ease-500"
              >
                {el}
              </div>
            ))}
          </div>
        </div>
      )}
      {!hasCollaborationAreas &&
        !hasHobbies &&
        !hasEducation &&
        !hasDescription &&
        !profile.email &&
        !profile.phoneNo &&
        !profile.location && <div className="w-fit mx-auto font-medium text-xl">No Content Here</div>}
    </div>
  );
};

export default About;
