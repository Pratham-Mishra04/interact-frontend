import { MESSAGING_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import postHandler from '@/handlers/post_handler';
import { Chat, User } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';
import Loader from '@/components/common/loader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from '@phosphor-icons/react';

interface Props {
  chat: Chat;
  setChat?: React.Dispatch<React.SetStateAction<Chat>>;
  setChats?: React.Dispatch<React.SetStateAction<Chat[]>>;
}

const AddGroupMembers = ({ chat, setChat, setChats }: Props) => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [mutex, setMutex] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  let oldAbortController: AbortController | null = null;

  const handleChange = (el: React.ChangeEvent<HTMLInputElement>) => {
    const abortController = new AbortController();
    if (oldAbortController) oldAbortController.abort();
    oldAbortController = abortController;
    fetchUsers(el.target.value, abortController);
    setSearch(el.target.value);
  };

  const fetchUsers = async (key: string, abortController: AbortController) => {
    setLoading(true);
    const URL = `${MESSAGING_URL}/group/non_members/${chat.id}?search=${key}`;
    const res = await getHandler(URL, abortController.signal, true);
    if (res.statusCode == 200) {
      setUsers(res.data.users || []);
      setLoading(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    oldAbortController = abortController;
    fetchUsers('', abortController);
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

    const toaster = Toaster.startLoad(chat.projectID || chat.organizationID ? 'Adding Members' : 'Sending Invitations');

    const URL = `${MESSAGING_URL}/group/members/${chat.projectID || chat.organizationID ? 'add' : 'invite'}/${chat.id}`;

    const userIDs = selectedUsers.map(user => user.id);
    const formData = {
      userIDs,
    };

    const res = await postHandler(URL, formData);
    if (res.statusCode === 200) {
      const invitations = res.data.invitations;
      if (chat.projectID || chat.organizationID) {
        if (setChats) {
          const memberships = res.data.memberships || [];
          setChats(prev =>
            prev.map(c => {
              if (c.id == chat.id) {
                return { ...c, memberships: [...c.memberships, ...memberships] };
              } else return c;
            })
          );
        }
      } else {
        if (setChat)
          setChat(prev => {
            return {
              ...prev,
              invitations: [...prev.invitations, ...(invitations || [])],
            };
          });
      }
      setIsDialogOpen(false);
      Toaster.stopLoad(toaster, chat.projectID || chat.organizationID ? 'Members Added' : 'Invitations Sent!', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }

    setMutex(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={val => setIsDialogOpen(val)}>
      <DialogTrigger>
        <div className="w-full h-12 p-4 bg-primary_comp_hover dark:bg-dark_primary_comp_hover rounded-md flex items-center justify-between cursor-pointer">
          <div className="">Add Members</div>
          <Plus size={24} />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Users</DialogTitle>
        </DialogHeader>
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
            {loading ? (
              <Loader />
            ) : (
              <>
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
                        {user.tagline && user.tagline != '' ? (
                          <div className="text-sm mt-2">{user.tagline}</div>
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
        <div className="w-full flex justify-end">
          <div
            onClick={handleSubmit}
            className="w-32 p-2 flex-center dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active transition-ease-300 cursor-pointer rounded-lg font-medium text-lg"
          >
            Invite
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddGroupMembers;
