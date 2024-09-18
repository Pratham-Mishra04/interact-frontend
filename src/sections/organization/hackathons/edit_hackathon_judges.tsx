import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { currentOrgSelector } from '@/slices/orgSlice';
import { User, OrganizationMembership, Event } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import patchHandler from '@/handlers/patch_handler';

interface Props {
  event: Event;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
}

const EditHackathonJudges = ({ event, setShow, setEvents }: Props) => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [judgeIDs, setJudgeIDs] = useState(event.hackathon?.judges?.map(u => u.id));

  const currentOrg = useSelector(currentOrgSelector);

  const handleChange = (el: React.ChangeEvent<HTMLInputElement>) => {
    const abortController = new AbortController();
    if (oldAbortController) oldAbortController.abort();
    oldAbortController = abortController;
    fetchUsers(el.target.value, abortController);
    setSearch(el.target.value);
  };

  const fetchUsers = async (key: string, abortController: AbortController) => {
    setLoading(true);
    const URL = `${ORG_URL}/${currentOrg.id}/membership/non_members?search=${key}`;
    const res = await getHandler(URL, abortController.signal);
    if (res.statusCode == 200) {
      setUsers(res.data.users || []);
      setLoading(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  const handleToggleCoordinator = async (user: User) => {
    const URL = `${ORG_URL}/${currentOrg.id}/hackathons/judge`;
    const formData = { userID: user.id, hackathonID: event.hackathonID };

    const res = await patchHandler(URL, formData);

    if (res.statusCode === 200) {
      setJudgeIDs(prev => {
        if (prev?.includes(user.id)) {
          return prev.filter(id => id !== user.id);
        } else {
          return [...(prev || []), user.id];
        }
      });

      Toaster.success('Judge status updated successfully', new Date().toISOString());
    } else {
      if (res.data?.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  let oldAbortController: AbortController | null = null;

  useEffect(() => {
    const abortController = new AbortController();
    oldAbortController = abortController;
    fetchUsers('', abortController);

    document.documentElement.style.overflowY = 'hidden';
    document.documentElement.style.height = '100vh';

    return () => {
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.height = 'auto';
    };
  }, []);

  return (
    <>
      <div className="fixed top-10 max-lg:top-0 w-1/2 max-lg:w-screen h-[90%] max-lg:h-screen backdrop-blur-2xl bg-white dark:bg-[#ffe1fc22] flex flex-col justify-between rounded-lg px-12 py-8 max-md:p-4 gap-8 max-lg:gap-4 dark:text-white font-primary overflow-y-auto border-[1px] border-primary_btn  dark:border-dark_primary_btn right-1/2 translate-x-1/2 shadow-2xl animate-fade_third z-50">
        <X onClick={() => setShow(false)} className="fixed top-5 right-2" size={24} weight="bold" />
        <div className="w-full flex flex-col items-center gap-4 ">
          <div className="w-full text-3xl max-md:text-xl font-semibold">Select Judges</div>
          <div className="w-full h-full flex flex-col gap-4">
            <div className="w-full h-12 flex items-center px-4 gap-4 dark:bg-dark_primary_comp_hover rounded-md">
              <MagnifyingGlass size={24} />
              <input
                className="grow bg-transparent focus:outline-none font-medium"
                placeholder="Search"
                value={search}
                onChange={handleChange}
              />
            </div>
            {users.length == 0 ? (
              <div className="h-64 text-xl flex-center">No other user in the Organisation :(</div>
            ) : (
              <div className="w-full flex-1 flex flex-col gap-2 overflow-y-auto">
                {users.map(user => {
                  return (
                    <div
                      key={user.id}
                      className={`w-full flex gap-2 rounded-lg p-2 ${
                        judgeIDs?.includes(user.id)
                          ? 'bg-primary_comp_hover dark:bg-dark_primary_comp_active'
                          : 'dark:bg-dark_primary_comp'
                      } transition-ease-200`}
                    >
                      <Image
                        crossOrigin="anonymous"
                        width={50}
                        height={50}
                        alt={'User Pic'}
                        src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
                        className={'rounded-full w-12 h-12 cursor-pointer border-[1px] border-black'}
                      />
                      <div className="w-[calc(100%-48px)] flex items-center justify-end">
                        <div className="w-full flex flex-col">
                          <div className="text-lg font-bold">{user.name}</div>
                          <div className="text-sm dark:text-gray-200">@{user.username}</div>
                          {user.tagline && user.tagline != '' && <div className="text-sm mt-2">{user.tagline}</div>}
                        </div>
                        <div onClick={() => handleToggleCoordinator(user)} className="px-4 py-2 text-sm cursor-pointer">
                          {judgeIDs?.includes(user.id) ? 'Remove' : 'Add'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <div
        onClick={() => setShow(false)}
        className="bg-backdrop w-screen h-screen max-lg:w-[105vw] max-lg:h-[105vh] fixed top-0 left-0 animate-fade_third z-20"
      ></div>
    </>
  );
};

export default EditHackathonJudges;
