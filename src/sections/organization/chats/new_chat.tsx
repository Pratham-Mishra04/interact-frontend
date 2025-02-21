import { GROUP_CHAT_PIC_URL, ORG_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import postHandler from '@/handlers/post_handler';
import { Chat, Organization, User } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { MagnifyingGlass, Pen } from '@phosphor-icons/react';
import { SERVER_ERROR } from '@/config/errors';
import { resizeImage } from '@/utils/resize_image';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import { useSelector } from 'react-redux';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  organization: Organization;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
}

const NewChat = ({ setShow, organization, setChats }: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');

  const [status, setStatus] = useState(0);
  const [mutex, setMutex] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const [groupPic, setGroupPic] = useState<File>();
  const [groupPicView, setGroupPicView] = useState<string>(`${GROUP_CHAT_PIC_URL}/default.jpg`);

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
    setUsers(matchedUsers);
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

  const currentOrgID = useSelector(currentOrgIDSelector);

  const handleSubmit = async () => {
    if (title.trim().length == 0) {
      Toaster.error('Title cannot be empty');
      return;
    }

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Creating a new group');

    const URL = `${ORG_URL}/${currentOrgID}/chats`;

    const userIDs = selectedUsers.map(user => user.id);

    const formData = new FormData();
    if (groupPic) formData.append('coverPic', groupPic);
    formData.append('title', title);
    formData.append('description', description);
    userIDs.forEach(userID => formData.append('userIDs', userID));

    const res = await postHandler(URL, formData, 'multipart/form-data');
    if (res.statusCode === 201) {
      const chat: Chat = res.data.chat;

      setChats(prev => [...prev, chat]);
      setShow(false);
      Toaster.stopLoad(toaster, 'New Group Created!', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
      setMutex(false);
    }
  };

  return (
    <>
      <div className="fixed top-24 max-md:top-20 w-[640px] max-md:w-5/6 backdrop-blur-2xl bg-white dark:bg-dark_primary_comp flex flex-col gap-4 rounded-lg p-10 max-md:p-5 dark:text-white font-primary border-[1px] border-primary_btn  dark:border-dark_primary_btn right-1/2 translate-x-1/2 animate-fade_third z-50">
        <div className="text-3xl max-md:text-xl font-semibold">{status == 0 ? 'Select Users' : 'Group Info'}</div>
        <div className="w-full h-[420px] overflow-y-auto flex flex-col gap-4">
          {status == 0 ? (
            <>
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
                          ? 'dark:bg-dark_primary_comp_active bg-primary_comp_hover'
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
                        {user.tagline && user.tagline != '' ? (
                          <div className="text-sm mt-2">{user.tagline}</div>
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="w-full flex flex-col gap-4">
              <div className="w-full flex gap-4 px-4 py-2 dark:bg-dark_primary_comp_hover rounded-lg ">
                <input
                  type="file"
                  className="hidden"
                  id="groupPic"
                  multiple={false}
                  onChange={async ({ target }) => {
                    if (target.files && target.files[0]) {
                      const file = target.files[0];
                      if (file.type.split('/')[0] == 'image') {
                        const resizedPic = await resizeImage(file, 500, 500);
                        setGroupPicView(URL.createObjectURL(resizedPic));
                        setGroupPic(resizedPic);
                      } else Toaster.error('Only Image Files can be selected');
                    }
                  }}
                />
                <label className="relative w-16 h-16 rounded-full cursor-pointer" htmlFor="groupPic">
                  <div className="w-16 h-16 absolute top-0 right-0 rounded-full flex-center bg-white transition-ease-200 opacity-0 hover:opacity-50">
                    <Pen color="black" size={24} />
                  </div>
                  <Image
                    crossOrigin="anonymous"
                    className="w-16 h-16 rounded-full object-cover"
                    width={50}
                    height={50}
                    alt="/"
                    src={groupPicView}
                  />
                </label>{' '}
                <input
                  type="text"
                  className="grow bg-transparent focus:outline-none text-xl"
                  placeholder="Group Title"
                  maxLength={25}
                  value={title}
                  onChange={el => setTitle(el.target.value)}
                />
              </div>
              <textarea
                className="w-full min-h-[64px] max-h-36 px-4 py-2 bg-primary_comp dark:bg-dark_primary_comp rounded-lg focus:outline-none"
                placeholder="Group Description"
                maxLength={250}
                value={description}
                onChange={el => setDescription(el.target.value)}
              ></textarea>
              <div className="w-full flex flex-col gap-2 px-4 py-2">
                <div>Members ({selectedUsers.length}/25)</div>
                <div className="w-full flex flex-wrap gap-4">
                  {selectedUsers.map((user, index) => {
                    return (
                      <div className="relative" key={user.id}>
                        <div
                          onClick={() => setSelectedUsers(prev => prev.filter((user, i) => i != index))}
                          className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/3 cursor-pointer"
                        >
                          X
                        </div>
                        <Image
                          crossOrigin="anonymous"
                          width={50}
                          height={50}
                          alt={'User Pic'}
                          src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
                          className={'rounded-full w-12 h-12 cursor-default'}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className={`w-full flex ${status == 0 ? 'justify-end' : 'justify-between'}`}>
          {status == 0 ? (
            <div
              onClick={() => setStatus(1)}
              className="w-32 p-2 flex-center dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active transition-ease-300 cursor-pointer rounded-lg font-medium text-lg"
            >
              Next
            </div>
          ) : (
            <>
              <div
                onClick={() => setStatus(0)}
                className="w-32 p-2 flex-center dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active transition-ease-300 cursor-pointer rounded-lg font-medium text-lg"
              >
                Prev
              </div>
              <div
                onClick={handleSubmit}
                className="w-32 p-2 flex-center dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active transition-ease-300 cursor-pointer rounded-lg font-medium text-lg"
              >
                Submit
              </div>
            </>
          )}
        </div>
      </div>

      <div
        onClick={() => setShow(false)}
        className="bg-backdrop w-screen h-screen fixed top-0 left-0 animate-fade_third z-20"
      ></div>
    </>
  );
};

export default NewChat;
