import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import postHandler from '@/handlers/post_handler';
import { currentOrgSelector } from '@/slices/orgSlice';
import { User, OrganizationMembership, Event } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import deleteHandler from '@/handlers/delete_handler';
import PrimaryButton from '@/components/buttons/primary_btn';
import isArrEdited from '@/utils/funcs/check_array_edited';

interface Props {
  event: Event;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
}

const EditCoordinators = ({ event, setShow, setEvents }: Props) => {
  const [step, setStep] = useState(0);

  const [memberships, setMemberships] = useState<OrganizationMembership[]>([]);

  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>(event.coordinators || []);

  const [mutex, setMutex] = useState(false);

  const currentOrg = useSelector(currentOrgSelector);

  const memberUserIDs = useMemo(() => memberships.map(m => m.userID), [memberships]);

  const getMemberships = async () => {
    const URL = `${ORG_URL}/${currentOrg.id}/membership`;
    const res = await getHandler(URL);

    if (res.statusCode === 200) {
      const membershipData: OrganizationMembership[] = res.data.organization?.memberships || [];
      setMemberships(membershipData);
      setUsers(membershipData.map(m => m.user));
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      }
    }
  };

  const addCoordinators = async () => {
    const toaster = Toaster.startLoad('Editing Coordinators');

    const URL = `${ORG_URL}/${currentOrg.id}/events/coordinators/${event.id}`;

    const res = await postHandler(URL, { userIDs: selectedUsers.map(user => user.id) });

    if (res.statusCode === 200) {
      setEvents(prev =>
        prev.map(e => {
          if (e.id == event.id)
            return {
              ...e,
              coordinators: selectedUsers,
            };
          else return e;
        })
      );
      Toaster.stopLoad(toaster, 'Coordinators Edited!', 1);
      setShow(false);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  const removeCoordinators = async () => {
    const toaster = Toaster.startLoad('Editing Coordinators');

    const URL = `${ORG_URL}/${currentOrg.id}/events/coordinators/${event.id}`;

    const res = await deleteHandler(URL);

    if (res.statusCode === 204) {
      setEvents(prev =>
        prev.map(e => {
          if (e.id == event.id)
            return {
              ...e,
              coordinators: [],
            };
          else return e;
        })
      );
      Toaster.stopLoad(toaster, 'Coordinators Edited!', 1);
      setShow(false);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  const handleSubmit = async () => {
    if (
      !isArrEdited(
        selectedUsers.map(u => u.id),
        event.coordinators.map(u => u.id)
      )
    ) {
      setShow(false);
      return;
    }

    if (mutex) return;
    setMutex(true);

    if (selectedUsers.length == 0) await removeCoordinators();
    else await addCoordinators();

    setMutex(false);
  };

  const fetchUsers = async (key: string) => {
    const matchedUsers: User[] = [];
    memberships.forEach(membership => {
      if (membership.user.username.match(new RegExp(key, 'i'))) matchedUsers.push(membership.user);
      else if (membership.user.name.match(new RegExp(key, 'i'))) matchedUsers.push(membership.user);
    });
    setUsers(matchedUsers);
  };

  const handleChange = (el: React.ChangeEvent<HTMLInputElement>) => {
    fetchUsers(el.target.value);
    setSearch(el.target.value);
  };

  const handleClickUser = (user: User) => {
    if (selectedUsers.map(u => u.id).includes(user.id)) {
      setSelectedUsers(prev => prev.filter(u => u.id != user.id));
    } else {
      setSelectedUsers(prev => [...prev, user]);
    }
  };

  useEffect(() => {
    getMemberships();

    document.documentElement.style.overflowY = 'hidden';
    document.documentElement.style.height = '100vh';

    return () => {
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.height = 'auto';
    };
  }, []);

  return (
    <>
      <div className="fixed top-10 max-lg:top-0 w-1/2 max-lg:w-screen h-[90%] max-lg:h-screen backdrop-blur-2xl bg-white dark:bg-[#ffe1fc22] flex flex-col justify-between rounded-lg px-12 py-8 gap-8 max-lg:gap-4 dark:text-white font-primary overflow-y-auto border-[1px] border-primary_btn  dark:border-dark_primary_btn right-1/2 translate-x-1/2 shadow-2xl animate-fade_third z-50">
        {step == 0 ? (
          <div className="w-full flex flex-col items-center gap-4 ">
            <div className="w-full text-3xl max-md:text-xl font-semibold">Select Coordinators</div>
            <div className="w-full h-[420px] flex flex-col gap-4">
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
                        onClick={() => handleClickUser(user)}
                        className={`w-full flex gap-2 rounded-lg p-2 ${
                          selectedUsers.map(u => u.id).includes(user.id)
                            ? 'bg-primary_comp_hover dark:bg-dark_primary_comp_active'
                            : 'hover:bg-primary_comp dark:bg-dark_primary_comp dark:hover:bg-dark_primary_comp_hover'
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
                        <div className="w-[calc(100%-48px)] flex flex-col">
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
              )}
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-4 ">
            <div className="text-3xl max-md:text-xl font-semibold">Confirm Coordinators</div>
            {selectedUsers.length == 0 ? (
              <div className="h-64 text-xl flex-center">Selected users will be shown here :)</div>
            ) : (
              <div className="w-full  h-[420px] flex flex-col gap-2">
                {selectedUsers.map((user, index) => {
                  return (
                    <div
                      key={user.id}
                      className="w-full flex justify-between items-center rounded-lg p-2 dark:bg-dark_primary_comp_hover cursor-default transition-ease-200"
                    >
                      <div className="w-fit flex gap-2 items-center">
                        <Image
                          crossOrigin="anonymous"
                          width={50}
                          height={50}
                          alt={'User Pic'}
                          src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
                          className={'rounded-full w-12 h-12 cursor-pointer border-[1px] border-black'}
                        />
                        <div className="grow flex flex-wrap justify-between items-center">
                          <div className="flex flex-col">
                            <div className="text-lg font-bold">{user.name}</div>
                            <div className="text-sm dark:text-gray-200">@{user.username}</div>
                          </div>
                        </div>
                      </div>
                      {memberUserIDs.includes(user.id) ? (
                        <X
                          onClick={() => {
                            setSelectedUsers(prev => prev.filter(u => u.id != user.id));
                          }}
                          className="cursor-pointer"
                          size={24}
                          weight="bold"
                        />
                      ) : (
                        <X className="cursor-not-allowed opacity-25" size={24} weight="bold" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="w-full flex items-end justify-between">
          {step != 0 ? <PrimaryButton label="Prev" onClick={() => setStep(prev => prev - 1)} /> : <div></div>}
          {step != 1 ? (
            <PrimaryButton label="Next" onClick={() => setStep(prev => prev + 1)} />
          ) : (
            <PrimaryButton label="Submit" onClick={handleSubmit} />
          )}
        </div>
      </div>
      <div
        onClick={() => setShow(false)}
        className="bg-backdrop w-screen h-screen max-lg:w-[105vw] max-lg:h-[105vh] fixed top-0 left-0 animate-fade_third z-20"
      ></div>
    </>
  );
};

export default EditCoordinators;
