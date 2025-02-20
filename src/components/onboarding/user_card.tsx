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

const UserCard = ({ name, username, tagline, profilePic, coverPic, tags, links, location, school }: Props) => (
  <div className="w-full flex flex-col gap-2 rounded-xl bg-white dark:bg-dark_primary_comp_hover font-primary transition-ease-300 animate-fade_third">
    <div className="w-full relative">
      <Image
        crossOrigin="anonymous"
        width={200}
        height={200}
        alt={'User Pic'}
        src={coverPic}
        className="w-full h-40 rounded-xl fade-img2 absolute top-0"
      />
      <div className="w-full flex gap-4 p-4">
        <Image
          crossOrigin="anonymous"
          width={100}
          height={100}
          alt={'User Pic'}
          src={profilePic}
          className="w-24 h-24 rounded-full z-[1]"
        />
        <div className="w-full flex flex-col justify-center">
          <div className="w-full text-2xl font-semibold line-clamp-1">{name}</div>
          <div className="w-full text-sm text-gray-600 dark:text-gray-100 font-medium">@{username}</div>
        </div>
      </div>
    </div>
    {(tags.length > 0 || location || school || tagline) && (
      <div className="w-full h-full flex flex-col justify-between p-4 pt-0 gap-4">
        <div>{tags && <Tags tags={tags} limit={50} />}</div>
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex flex-col gap-4">
            {(school || location) && (
              <div className="w-full flex flex-col gap-2 px-2 font-medium text-xs text-gray-700 dark:text-gray-200">
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

            {tagline && (
              <>
                <div className="border-t-[1px] border-gray-500 border-dashed"></div>
                <div className="text-sm text-gray-600 dark:text-gray-100 text-center line-clamp-1">{tagline}</div>
              </>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);

export default UserCard;
