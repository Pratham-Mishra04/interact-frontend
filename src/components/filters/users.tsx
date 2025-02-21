import React, { useEffect, useRef, useState } from 'react';
import { FilterButton } from './common';
import { Backspace, UserCircle } from '@phosphor-icons/react';
import { User } from '@/types';
import Image from 'next/image';
import { USER_PROFILE_PIC_URL } from '@/config/routes';

interface Props {
  fieldName: string;
  users: User[];
  selectedUsers: User[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const Users = ({ fieldName, users, selectedUsers, setSelectedUsers }: Props) => {
  const [show, setShow] = useState(false);

  const [showUsers, setShowUsers] = useState<User[]>(users);

  const menuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setShow(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (el: React.ChangeEvent<HTMLInputElement>) => {
    const search = el.target.value;

    const matchedUsers: User[] = [];

    users.forEach(user => {
      if (user.username.match(new RegExp(search, 'i'))) matchedUsers.push(user);
      else if (user.name.match(new RegExp(search, 'i'))) matchedUsers.push(user);
    });

    setShowUsers(matchedUsers);
  };

  const handleClickUser = (user: User) => {
    setSelectedUsers(prev => {
      if (prev.map(u => u.id).includes(user.id)) return prev.filter(u => u.id != user.id);
      return [...prev, user];
    });
  };

  useEffect(() => {
    setShowUsers(users);
  }, [show]);

  return (
    <div ref={menuRef} className="relative z-10">
      <FilterButton
        fieldName={fieldName}
        filledText={selectedUsers.length == 0 ? '' : `${selectedUsers.length} Selected`}
        icon={<UserCircle size={20} />}
        setShow={setShow}
      />
      {show && (
        <div className="w-80 h-fit p-3 bg-white dark:bg-dark_primary_comp dark:border-dark_primary_btn flex flex-col gap-2 absolute -bottom-2 left-0 translate-y-full rounded-md border-[1px] border-gray-200 shadow-md animate-fade_third">
          <div className="w-full flex justify-between items-center">
            <div className="text-xl font-medium">{fieldName}</div>
            <Backspace
              onClick={() => {
                setSelectedUsers([]);
                setShow(false);
              }}
              className="cursor-pointer"
              size={20}
            />
          </div>
          <input
            onChange={handleSearch}
            maxLength={25}
            type="text"
            className="w-full text-sm bg-transparent focus:outline-none border-[1px] rounded-md p-2"
            placeholder="Search"
          />

          <div className="w-full max-h-40 overflow-y-auto flex flex-col gap-1">
            {showUsers.map((user, index) => (
              <div
                key={index}
                onClick={() => handleClickUser(user)}
                className={`w-full p-2 ${
                  selectedUsers.map(u => u.id).includes(user.id)
                    ? 'bg-primary_comp_hover dark:bg-dark_primary_comp_active'
                    : 'hover:bg-primary_comp dark:hover:bg-dark_primary_comp_hover'
                }  rounded-xl border-gray-400 flex text-primary_black dark:text-white transition-ease-300 cursor-pointer`}
              >
                <div className="w-full flex items-center gap-1">
                  <Image
                    crossOrigin="anonymous"
                    width={50}
                    height={50}
                    alt={'User Pic'}
                    src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
                    placeholder="blur"
                    blurDataURL={user.profilePicBlurHash || 'no-hash'}
                    className="w-6 h-6 rounded-full z-[1]"
                  />
                  <div className="flex-center gap-2">
                    <div className="font-medium line-clamp-1">{user.name}</div>
                    <div className="text-xs">@{user.username}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
