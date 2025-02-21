import { USER_PROFILE_PIC_URL } from '@/config/routes';
import { Announcement } from '@/types';
import renderContentWithLinks from '@/utils/funcs/render_content_with_links';
import moment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface Props {
  announcement: Announcement;
}

const AnnouncementCard = ({ announcement }: Props) => {
  return (
    <Link
      href={`/explore/announcement/${announcement.id}`}
      target="_blank"
      className="w-full h-fit bg-white dark:bg-dark_primary_comp font-primary flex gap-1 border-primary_btn dark:border-dark_primary_btn border-[1px] dark:text-white rounded-xl p-2 max-md:px-4 max-md:py-4"
    >
      <div className="h-full">
        <div className="rounded-full">
          <Image
            crossOrigin="anonymous"
            width={50}
            height={50}
            alt={'User Pic'}
            src={`${USER_PROFILE_PIC_URL}/${announcement.organization?.user.profilePic}`}
            className={'rounded-full w-8 h-8'}
          />
        </div>
      </div>
      <div className="w-[calc(100%-32px)] flex flex-col gap-1">
        <div className="w-full h-fit flex justify-between items-center">
          <div className="text-sm font-medium">@{announcement.organization?.user.username}</div>
          <div className="flex gap-2 font-light text-xxs">{moment(announcement.createdAt).fromNow()}</div>
        </div>
        <div className="w-full text-xs font-medium">{announcement.title}</div>
        <div className="w-full text-xs  whitespace-pre-wrap mb-2 line-clamp-8">
          {renderContentWithLinks(announcement.content, announcement.taggedUsers)}
        </div>
      </div>
    </Link>
  );
};

export default AnnouncementCard;
