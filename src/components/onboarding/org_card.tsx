import React from 'react';
import Image from 'next/image';
import { Buildings, MapPin } from '@phosphor-icons/react';
import Tags from '../common/tags';

interface Props {
  name: string;
  username: string;
  tagline: string;
  profilePic: string;
  coverPic: string;
  tags: string[];
  links: string[];
  location: string;
  school: string;
}

const OrgCard = ({ name, username, tagline, profilePic, coverPic, tags, links, location, school }: Props) => (
  <div className="w-full flex flex-col gap-2 rounded-xl bg-slate-50 dark:bg-dark_primary_comp font-primary shadow-md transition-ease-300 animate-fade_third">
    <div className="w-full relative">
      <Image
        crossOrigin="anonymous"
        width={100}
        height={100}
        alt={'User Pic'}
        src={coverPic}
        className="w-full h-32 rounded-t-xl fade-img"
      />
      <Image
        crossOrigin="anonymous"
        width={100}
        height={100}
        alt={'User Pic'}
        src={profilePic}
        className="w-32 h-32 rounded-full absolute bottom-6 right-1/2 translate-x-1/2 translate-y-1/2"
      />
    </div>
    <div className="w-full h-full flex flex-col justify-between gap-4 p-4 pt-12">
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex flex-col items-center">
          <div className="w-full text-center text-primary_black dark:text-white text-2xl font-semibold line-clamp-1">
            {name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">@{username}</div>
        </div>

        {(tags.length > 0 || location || school || tagline) && (
          <div className="w-full h-full flex flex-col justify-between gap-4">
            <div>{tags && <Tags tags={tags} limit={50} center />}</div>
            {(school || location) && (
              <div className="w-full flex flex-col gap-2 font-medium text-xs text-gray-700 dark:text-gray-200">
                <div className="w-full flex justify-between flex-wrap gap-2 font-medium text-xs text-gray-700 dark:text-gray-200">
                  {school && (
                    <div className="flex gap-1 items-center">
                      <Buildings /> <div className="text-xs">{school}</div>
                    </div>
                  )}

                  {location && (
                    <div className={`flex gap-1 items-center ${school == '' ? 'flex-row-reverse' : ''}`}>
                      <div className="text-xs">{location}</div>
                      <MapPin />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {tagline && <div className="border-t-[1px] border-gray-500 border-dashed"></div>}

        {tagline && <div className="text-sm text-gray-600 dark:text-white text-center">{tagline}</div>}
      </div>
    </div>
  </div>
);

export default OrgCard;
