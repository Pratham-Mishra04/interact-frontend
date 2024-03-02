import { MEMBERSHIP_URL, ORG_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import postHandler from '@/handlers/post_handler';
import { Invitation, Organization, Project, User } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';
import Loader from '@/components/common/loader';
import project from '@/screens/messaging/project';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import { useSelector } from 'react-redux';
import PrimaryButton from '@/components/buttons/primary_btn';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  organization: Organization;
  setOrganization?: React.Dispatch<React.SetStateAction<Organization>>;
}

interface InvitationSlice {
  userID: string;
  title: string;
}

const AddMembers = ({ setShow, organization, setOrganization }: Props) => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState(0);
  const [mutex, setMutex] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [invitationSlices, setInvitationSlices] = useState<InvitationSlice[]>([]);
  const [clickedInvitationSliceIndex, setClickedInvitationSliceIndex] = useState(-1);

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
    const URL = `${ORG_URL}/${currentOrgID}/membership/non_members?search=${key}`;
    const res = await getHandler(URL, abortController.signal);
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
    if (selectedUsers.includes(user)) {
      setSelectedUsers(prev => prev.filter(u => u.id != user.id));
      setInvitationSlices(prev => prev.filter(i => i.userID != user.id));
    } else {
      setSelectedUsers(prev => [...prev, user]);
      setInvitationSlices(prev => [...prev, { userID: user.id, title: '' }]);
    }
  };

  const currentOrgID = useSelector(currentOrgIDSelector);

  const handleSubmit = () => {
    if (invitationSlices.length == 0) return;
    let check = false;
    invitationSlices.forEach(el => {
      if (el.title.trim() == '') {
        Toaster.error('Title cannot be empty');
        check = true;
        return;
      } else if (el.userID == '') {
        Toaster.error('Something went wrong, please try again'); //TODO have an error message for this
        check = true;
        return;
      }
    });
    if (check) return;

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Sending Invitations');

    const URL = `${ORG_URL}/${currentOrgID}/membership`;

    let completeCount = 0;
    let attemptedCount = 0;

    invitationSlices.forEach(async invitation => {
      const formData = invitation;
      const res = await postHandler(URL, formData);
      attemptedCount++;
      if (res.statusCode === 201) {
        const invitation: Invitation = res.data.invitation;
        if (setOrganization)
          // setOrganization(prev => {
          //   return { ...prev, invitations: [...prev.invitations, invitation] };
          // });

          setOrganization(prev => {
            // Check if the invitation already exists in the array
            const existingInvitationIndex = prev.invitations.findIndex(inv => inv.id === invitation.id);

            if (existingInvitationIndex !== -1) {
              // If the invitation exists, update it in the array
              const updatedInvitations = [...prev.invitations];
              updatedInvitations[existingInvitationIndex] = invitation;

              updatedInvitations.unshift(updatedInvitations.splice(existingInvitationIndex, 1)[0]);

              return { ...prev, invitations: updatedInvitations };
            } else {
              // If the invitation doesn't exist, add it to the array
              return { ...prev, invitations: [invitation, ...prev.invitations] };
            }
          });
        completeCount++;
        if (completeCount == invitationSlices.length) {
          setSearch('');
          setShow(false);
          Toaster.stopLoad(toaster, 'Invitations sent!', 1);
        }
      } else {
        if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
        else {
          Toaster.stopLoad(toaster, SERVER_ERROR, 0);
        }
      }
      if (attemptedCount == invitationSlices.length) setMutex(false);
    });
  };

  return (
    <>
      <div className="fixed top-24 max-md:top-20 w-[640px] max-md:w-5/6 backdrop-blur-2xl bg-gray-100 dark:bg-[#ffe1fc22] flex flex-col gap-4 rounded-lg p-10 max-md:p-5 dark:text-white font-primary border-[1px] border-primary_btn  dark:border-dark_primary_btn right-1/2 translate-x-1/2 animate-fade_third z-30">
        <div className="text-3xl max-md:text-xl font-semibold">
          {status == 0 ? 'Select Users' : 'Confirm Invitations'}
        </div>
        <div className="w-full h-[420px] flex flex-col gap-4">
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
            </>
          ) : (
            <div className="w-full flex flex-col gap-2">
              {selectedUsers.map((user, index) => {
                return (
                  <div
                    key={user.id}
                    className="w-full flex gap-2 rounded-lg p-2 dark:bg-dark_primary_comp_hover cursor-default transition-ease-200"
                  >
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
                      {clickedInvitationSliceIndex == index ? (
                        <form
                          onSubmit={el => {
                            el.preventDefault();
                            setClickedInvitationSliceIndex(-1);
                          }}
                        >
                          <input
                            type="text"
                            maxLength={25}
                            autoFocus={true}
                            value={invitationSlices[index].title}
                            onChange={el => {
                              setInvitationSlices(prev =>
                                prev.map((invitationSlice, i) => {
                                  if (i == index) return { ...invitationSlice, title: el.target.value };
                                  return invitationSlice;
                                })
                              );
                            }}
                            className="p-2 mr-8 flex-center border-[1px] border-primary_btn  dark:border-dark_primary_btn dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active focus:outline-none transition-ease-300 cursor-pointer rounded-lg font-medium"
                          />
                        </form>
                      ) : (
                        <div
                          onClick={() => setClickedInvitationSliceIndex(index)}
                          className="p-2 mr-8 flex-center border-[1px] border-primary_btn  dark:border-dark_primary_btn dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active transition-ease-300 cursor-pointer rounded-lg font-medium"
                        >
                          {invitationSlices[index].title == '' ? 'Enter Title' : invitationSlices[index].title}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className={`w-full flex ${status == 0 ? 'justify-end' : 'justify-between'}`}>
          {status == 0 ? (
            <PrimaryButton onClick={() => setStatus(1)} label="Next" />
          ) : (
            <>
              <PrimaryButton onClick={() => setStatus(0)} label="Prev" />
              <PrimaryButton onClick={handleSubmit} label="Submit" />
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

export default AddMembers;
