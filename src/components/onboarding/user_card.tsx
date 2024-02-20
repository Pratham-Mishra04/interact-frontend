import React from 'react';
import Image from 'next/image';
import getIcon from '@/utils/funcs/get_icon';
import getDomainName from '@/utils/funcs/get_domain_name';
import Link from 'next/link';

interface Props {
  name: string;
  username: string;
  tagline: string;
  bio: string;
  profilePic: string;
  coverPic: string;
  tags: string[];
  links: string[];
}

const UserCard = ({ name, username, tagline, bio, profilePic, coverPic, tags, links }: Props) => (
  <div
    className={`w-full h-fit ${
      tagline ? 'pb-8' : 'pb-4'
    } bg-white gap-2 shadow-2xl font-primary flex flex-col items-center animate-fade_half backdrop-blur-xl max-md:hidden rounded-md`}
  >
    <div className="w-full relative">
      <Image
        crossOrigin="anonymous"
        width={500}
        height={500}
        alt={'User Pic'}
        src={coverPic}
        className="w-full h-44 rounded-t-md"
      />

      <div className="w-full flex items-center gap-2 absolute -translate-y-1/3 px-8">
        <Image
          crossOrigin="anonymous"
          className="w-32 h-32 rounded-full border-4 border-white"
          width={100}
          height={100}
          alt="Profile Pic"
          src={profilePic}
        />
        <div className="w-full flex flex-col gap-1 pt-8">
          <div className="text-3xl font-semibold line-clamp-1">{name}</div>
          <div className="text-sm font-medium text-gray-600">@{username}</div>
        </div>
      </div>
    </div>

    <div className="w-full flex flex-col items-center gap-4 pt-20 px-8">
      {tagline && <div className="font-medium text-lg text-center break-words">{tagline}</div>}

      {bio && (
        <>
          <div className="w-full border-t-[1px] border-dashed border-primary_black"></div>
          <div className="w-full text-sm text-center line-clamp-6">{bio}</div>
        </>
      )}

      {tags.length > 0 && (
        <>
          <div className="w-full border-t-[1px] border-dashed border-primary_black"></div>
          <div className="w-full gap-2 flex flex-wrap items-center justify-center">
            {tags.map(tag => {
              return (
                <div
                  className="flex-center text-xs text-primary_black px-2 py-1 border-[1px] border-primary_black  rounded-md"
                  key={tag}
                >
                  {tag}
                </div>
              );
            })}
          </div>
        </>
      )}
      {links.length > 0 && (
        <div className="w-full gap-2 flex flex-wrap items-center justify-center">
          {links.map((link, index) => {
            return (
              <Link
                href={link}
                target="_blank"
                key={index}
                className="w-fit h-8 border-[1px] text-primary_black border-primary_black rounded-lg text-sm px-2 py-4 flex items-center gap-2"
              >
                {getIcon(getDomainName(link), 24)}
                <div className="capitalize">{getDomainName(link)}</div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  </div>
);

export default UserCard;
