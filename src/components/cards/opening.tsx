import { USER_PROFILE_PIC_URL } from '@/config/routes';
import { Opening } from '@/types';
import { Buildings } from '@phosphor-icons/react';
import Image from 'next/image';
import React from 'react';
import Tags from '../common/tags';
import Link from 'next/link';
import { getProjectPicHash, getProjectPicURL } from '@/utils/funcs/safe_extract';

interface Props {
  opening: Opening;
}

const OpeningCard = ({ opening }: Props) => {
  return (
    <Link
      href={`openings?oid=${opening.id}&action=external`}
      target="_blank"
      className="w-full bg-white dark:bg-dark_primary_comp_hover font-primary border-[1px] border-primary_btn dark:border-dark_primary_btn rounded-lg flex items-center gap-3 p-2 transition-ease-300 animate-fade_third"
    >
      {opening.organizationID && opening.organization ? (
        <Image
          crossOrigin="anonymous"
          width={200}
          height={200}
          alt={'User Pic'}
          src={`${USER_PROFILE_PIC_URL}/${opening.organization?.user?.profilePic}`}
          placeholder="blur"
          blurDataURL={opening.organization?.user?.profilePicBlurHash || 'no-hash'}
          className="w-[90px] h-[90px] rounded-full object-cover"
        />
      ) : (
        <Image
          crossOrigin="anonymous"
          width={200}
          height={200}
          alt={'Project Pic'}
          src={getProjectPicURL(opening.project)}
          className="w-[90px] h-[90px] rounded-lg object-cover"
          placeholder="blur"
          blurDataURL={getProjectPicHash(opening.project)}
        />
      )}

      <div className="w-[calc(100%-90px)] flex flex-col gap-2">
        <div className="w-full flex flex-col gap-1">
          <div className="w-full font-semibold text-lg max-lg:text-lg line-clamp-1">{opening.title}</div>
          <div className="w-fit font-medium flex-center gap-1 text-sm line-clamp-1">
            @
            {opening.organizationID && opening.organization ? (
              <span className="w-fit flex-center gap-1">
                {opening.organization?.title} <Buildings />
              </span>
            ) : (
              <span className="line-clamp-1">{opening.project?.title}</span>
            )}
          </div>
        </div>
        {opening.tags.length > 0 && <Tags tags={opening.tags} limit={20} />}
      </div>
    </Link>
  );
};

export default OpeningCard;
