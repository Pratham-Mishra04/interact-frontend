import { SERVER_ERROR } from '@/config/errors';
import { EXPLORE_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { userSelector } from '@/slices/userSlice';
import { User } from '@/types';
import TagUserUtils from '@/utils/funcs/tag_users';
import Toaster from '@/utils/toaster';
import { ArrowUpRight } from '@phosphor-icons/react';
import Image from 'next/image';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

interface Props {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: () => void;
  type: string;
  taggedUsernames: string[];
  setTaggedUsernames: React.Dispatch<React.SetStateAction<string[]>>;
  userFetchURL?: string;
}

const CommentInput = ({
  content,
  setContent,
  taggedUsernames,
  setTaggedUsernames,
  handleSubmit,
  type,
  userFetchURL,
}: Props) => {
  const [users, setUsers] = useState<User[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  const user = useSelector(userSelector);

  const fetchUsers = async (search: string) => {
    const URL = (userFetchURL ? userFetchURL : `${EXPLORE_URL}/users?order=trending`) + `?search=${search}&limit=${10}`;
    const res = await getHandler(URL, undefined, true);
    if (res.statusCode == 200) {
      const userData: User[] = res.data.users || [];
      setUsers(userData.filter(u => u.id != user.id));
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  const tagsUserUtils = new TagUserUtils(
    cursorPosition,
    content,
    showUsers,
    taggedUsernames,
    setCursorPosition,
    setContent,
    fetchUsers,
    setShowUsers,
    setTaggedUsernames
  );

  return (
    <div className="relative">
      <div className="w-full flex gap-2 border-[1px] border-primary_btn dark:border-dark_primary_btn p-3 rounded-[30px]">
        <Image
          crossOrigin="anonymous"
          className={`${type == 'comment' ? 'w-6 h-6' : 'w-8 h-8'} rounded-full`}
          width={50}
          height={50}
          alt="user"
          src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
        />
        <textarea
          value={content}
          onChange={tagsUserUtils.handleContentChange}
          onKeyDown={el => {
            if (el.key === 'Enter') handleSubmit();
          }}
          className={`${
            type == 'comment'
              ? `w-[calc(100%-48px)] min-h-[24px] h-[24px] ${content.length == 0 ? 'max-h-[24px]' : 'max-h-64'} text-sm`
              : `w-[calc(100%-64px)] min-h-[32px] h-[32px] ${
                  content.length == 0 ? 'max-h-[32px]' : 'max-h-64'
                } max-md:text-sm`
          } dark:text-white dark:bg-dark_primary_comp focus:outline-none max-md:w-full`}
          placeholder={`${type == 'comment' ? 'Reply to' : 'Comment on'} this ${type}`}
        />
        <ArrowUpRight
          className={`${
            type == 'comment' ? 'w-6 h-6 p-1' : 'w-8 h-8 p-2'
          } self-end dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active border-[1px] border-primary_btn dark:border-dark_primary_btn rounded-full flex-center cursor-pointer transition-ease-300`}
          onClick={handleSubmit}
        />
      </div>
      {showUsers && users.length > 0 && (
        <div
          className={`w-full absolute bg-gradient-to-b ${
            type == 'task'
              ? 'from-gray-50 dark:from-dark_primary_active via-[#ffffffca] dark:via-dark_primary_hover'
              : 'from-white dark:from-dark_primary_comp_active via-[#ffffffb2] dark:via-dark_primary_comp_hover'
          } via-[90%] flex flex-wrap justify-center gap-2 py-4 z-10`}
        >
          {users.map(user => (
            <div
              key={user.id}
              onClick={() => tagsUserUtils.handleTagUser(user.username)}
              className="w-1/3 hover:scale-105 flex items-center gap-1 rounded-md border-[1px] border-primary_btn p-2 hover:bg-primary_comp dark:hover:bg-dark_primary_comp_hover cursor-pointer transition-ease-300"
            >
              <Image
                crossOrigin="anonymous"
                width={50}
                height={50}
                alt={'User Pic'}
                src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
                className="rounded-full w-6 h-6"
              />
              <div className="flex-center gap-2">
                <div className="text-sm font-semibold line-clamp-1">{user.name}</div>
                <div className="text-xs text-gray-500">@{user.username}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentInput;
