import { User } from '@/types';
import React from 'react';
import Image from 'next/image';
import { USER_PROFILE_PIC_URL } from '@/config/routes';

interface Props {
  users: User[];
  size?: number;
  gap?: number;
  showAll?: boolean;
  showMoreText?: boolean;
}

const PictureList = ({ users, size = 4, gap = 1, showAll = false, showMoreText = true }: Props) => {
  const variations = [
    'left-0',
    'left-1',
    'left-2',
    'left-3',
    'left-4',
    'left-5',
    'left-6',
    'left-7',
    'left-8',
    'left-9',
    'left-10',
  ];
  return users?.length > 0 ? (
    <div className="flex gap-1">
      {showAll ? (
        users.map((u, index) => {
          return (
            <Image
              key={index}
              crossOrigin="anonymous"
              width={50}
              height={50}
              alt={'User Pic'}
              src={`${USER_PROFILE_PIC_URL}/${u.profilePic}`}
              style={{ width: size * 4, height: size * 4 }}
              placeholder="blur"
              blurDataURL={u.profilePicBlurHash || 'no-hash'}
              className="rounded-full cursor-default shadow-md"
            />
          );
        })
      ) : (
        <>
          <div
            style={{
              width:
                (gap *
                  users.filter((_, index) => {
                    return index >= 0 && index < 3;
                  }).length +
                  size -
                  1) *
                4,
              height: size * 4,
            }}
            className="relative mr-1"
          >
            {users
              .filter((u, index) => {
                return index >= 0 && index < 3;
              })
              .map((u, index) => {
                return (
                  <Image
                    key={index}
                    crossOrigin="anonymous"
                    width={50}
                    height={50}
                    alt={'User Pic'}
                    src={`${USER_PROFILE_PIC_URL}/${u.profilePic}`}
                    style={{ width: size * 4, height: size * 4 }}
                    placeholder="blur"
                    blurDataURL={u.profilePicBlurHash || 'no-hash'}
                    className={`rounded-full cursor-default shadow-md absolute top-0 left-${index * gap}`}
                  />
                );
              })}
          </div>
          {users.length > 3 && showMoreText && (
            <>
              <div>+</div>
              <div>
                {users.length - 3} other{users.length - 3 != 1 ? 's' : ''}
              </div>
            </>
          )}
        </>
      )}
    </div>
  ) : (
    <></>
  );
};

export default PictureList;
