import React from 'react';
import Image from 'next/image';
import getIcon from '@/utils/funcs/get_icon';
import getDomainName from '@/utils/funcs/get_domain_name';
import Link from 'next/link';
import { USER_COVER_PIC_URL, USER_PROFILE_PIC_URL } from '@/config/routes';

const DummyUserCard = () => (
  <div className="w-[300px] relative bg-white gap-2 opacity-25 font-primary flex flex-col items-center pb-4 backdrop-blur-xl max-md:hidden rounded-md">
    <div className="w-full h-full backdrop-blur-sm absolute top-0 right-0 z-10"></div>
    <div className="w-full relative">
      <Image
        crossOrigin="anonymous"
        width={500}
        height={500}
        alt={'User Pic'}
        src={`${USER_COVER_PIC_URL}/default.jpg`}
        className="w-full rounded-t-md"
      />

      <div className="w-full flex items-center gap-2 absolute -translate-y-1/3 px-8">
        <Image
          crossOrigin="anonymous"
          className="w-16 h-16 rounded-full border-4 border-white"
          width={100}
          height={100}
          alt="Profile Pic"
          src={`${USER_PROFILE_PIC_URL}/default.jpg`}
        />
        <div className="w-full flex flex-col pt-6">
          <div className="font-semibold line-clamp-1">Interact User</div>
          <div className="text-xs font-medium text-gray-600">@interact_user</div>
        </div>
      </div>
    </div>

    <div className="w-full flex flex-col items-center gap-4 pt-12 px-4">
      <div className="font-medium text-sm text-center break-words">I am awesome!</div>

      <div className="w-full border-t-[1px] border-dashed border-primary_black"></div>
      <div className="w-full text-xs text-center line-clamp-6">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Suscipit consectetur, delectus nulla nostrum, aliquam
        fugiat aperiam voluptates dolores?
      </div>

      <div className="w-full border-t-[1px] border-dashed border-primary_black"></div>
      <div className="w-full gap-2 flex flex-wrap items-center justify-center">
        {['interact', 'student', 'awesome'].map(tag => {
          return (
            <div
              className="flex-center text-xxs text-primary_black px-2 py-1 border-[1px] border-primary_black  rounded-md"
              key={tag}
            >
              {tag}
            </div>
          );
        })}
      </div>

      <div className="w-full gap-2 flex flex-wrap items-center justify-center">
        {['https://www.google.com', 'https://www.linkedin.com', 'https://www.twitter.com'].map((link, index) => {
          return (
            <Link
              href={link}
              target="_blank"
              key={index}
              className="w-fit h-8 rounded-lg text-xs px-1 py-2 flex items-center gap-2"
            >
              {getIcon(getDomainName(link), 16)}
            </Link>
          );
        })}
      </div>
    </div>
  </div>
);

export default DummyUserCard;
