import { MESSAGING_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import postHandler from '@/handlers/post_handler';
import { Chat, Organization, User } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { SERVER_ERROR } from '@/config/errors';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  chat: Chat;
  organization: Organization;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
}

const AddChatMembers = ({ setShow, chat, organization, setChats }: Props) => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [mutex, setMutex] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const memberUserIDs = chat.memberships.map(membership => membership.userID);

  const handleChange = (el: React.ChangeEvent<HTMLInputElement>) => {
    fetchUsers(el.target.value);
    setSearch(el.target.value);
  };

  const fetchUsers = async (key: string) => {
    const matchedUsers: User[] = [];
    organization.memberships.forEach(membership => {
      if (membership.user.username.match(new RegExp(key, 'i'))) matchedUsers.push(membership.user);
      else if (membership.user.name.match(new RegExp(key, 'i'))) matchedUsers.push(membership.user);
    });
    setUsers(matchedUsers.filter(u => !memberUserIDs.includes(u.id)));
  };

  useEffect(() => {
    fetchUsers('');
  }, []);

  const handleClickUser = (user: User) => {
    if (selectedUsers.length == 25) return;
    if (selectedUsers.includes(user)) {
      setSelectedUsers(prev => prev.filter(u => u.id != user.id));
    } else {
      setSelectedUsers(prev => [...prev, user]);
    }
  };

  const handleSubmit = async () => {
    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Adding users to chat');

    const URL = `${MESSAGING_URL}/group/project/members/add/${chat.id}`;

    const userIDs = selectedUsers.map(user => user.id);
    const formData = {
      userIDs,
    };

    const res = await postHandler(URL, formData);
    if (res.statusCode === 200) {
      const memberships = res.data.memberships || [];
      setChats(prev =>
        prev.map(c => {
          if (c.id == chat.id) {
            return { ...c, memberships: [...c.memberships, ...memberships] };
          } else return c;
        })
      );
      setShow(false);
      Toaster.stopLoad(toaster, 'Users added!', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }

    setMutex(false);
  };

  return (
    <>
      <div className="fixed top-24 max-md:top-20 w-[640px] max-md:w-5/6 backdrop-blur-2xl bg-white dark:bg-dark_primary_comp flex flex-col gap-4 rounded-lg p-10 max-md:p-5 dark:text-white font-primary border-[1px] border-primary_btn  dark:border-dark_primary_btn right-1/2 translate-x-1/2 animate-fade_third z-50">
        <div className="text-3xl max-md:text-xl font-semibold">Select Users</div>
        <div className="w-full h-[420px] overflow-y-auto flex flex-col gap-4">
          <div className="w-full h-12 flex items-center px-4 gap-4 dark:bg-dark_primary_comp_hover rounded-md">
            <MagnifyingGlass size={24} />
            <input
              className="grow bg-transparent focus:outline-none font-medium"
              placeholder="Search"
              value={search}
              onChange={handleChange}
            />
          </div>
          <div className="w-full flex-1 flex flex-col gap-2 overflow-y-auto">
            {users.map(user => {
              return (
                <div
                  key={user.id}
                  onClick={() => handleClickUser(user)}
                  className={`w-full flex gap-2 rounded-lg p-2 ${
                    selectedUsers.includes(user)
                      ? 'bg-primary_comp_hover dark:bg-dark_primary_comp_active'
                      : 'dark:bg-dark_primary_comp hover:bg-primary_comp dark:hover:bg-dark_primary_comp_hover'
                  } cursor-pointer transition-ease-200`}
                >
                  <Image
                    crossOrigin="anonymous"
                    width={50}
                    height={50}
                    alt={'User Pic'}
                    src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
                    className={'rounded-full w-12 h-12 cursor-pointer border-[1px] border-black'}
                  />
                  <div className="w-5/6 flex flex-col">
                    <div className="text-lg font-bold">{user.name}</div>
                    <div className="text-sm dark:text-gray-200">@{user.username}</div>
                    {user.tagline && user.tagline != '' ? <div className="text-sm mt-2">{user.tagline}</div> : <></>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="w-full flex justify-end">
          <div
            onClick={handleSubmit}
            className="w-32 p-2 flex-center dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active transition-ease-300 cursor-pointer rounded-lg font-medium text-lg"
          >
            Add
          </div>
        </div>
      </div>

      <div
        onClick={() => setShow(false)}
        className="bg-backdrop w-screen h-screen fixed top-0 left-0 animate-fade_third z-20"
      ></div>
    </>
  );
};

export default AddChatMembers;
