import { USER_PROFILE_PIC_URL } from '@/config/routes';
import { Post } from '@/types';
import moment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import Editor from '../editor';

interface Props {
  post: Post;
}

const PostCard = ({ post }: Props) => {
  return (
    <Link
      href={`/explore/post/${post.id}`}
      target="_blank"
      className="w-full h-fit bg-white dark:bg-dark_primary_comp_hover font-primary flex gap-1 border-primary_btn dark:border-dark_primary_btn border-[1px] dark:text-white rounded-xl p-2 max-md:px-4 max-md:py-4"
    >
      <div className="h-full">
        <div className="rounded-full">
          <Image
            crossOrigin="anonymous"
            width={50}
            height={50}
            alt={'User Pic'}
            src={`${USER_PROFILE_PIC_URL}/${post.user.profilePic}`}
            className={'rounded-full w-8 h-8'}
          />
        </div>
      </div>
      <div className="w-[calc(100%-32px)] flex flex-col gap-1">
        <div className="w-full h-fit flex justify-between items-center">
          <div className="flex-center gap-1">
            <div className="font-semibold">{post.user.name}</div>
            <div className="text-xs font-normal text-gray-500">@{post.user.username}</div>
          </div>

          <div className="flex gap-2 font-light text-xxs">{moment(post.postedAt).fromNow()}</div>
        </div>
        <Editor className="w-full text-xs whitespace-pre-wrap line-clamp-8" content={post.content} editable={false} />
      </div>
    </Link>
  );
};

export default PostCard;
