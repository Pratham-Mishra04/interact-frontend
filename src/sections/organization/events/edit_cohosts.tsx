import { SERVER_ERROR } from '@/config/errors';
import { EXPLORE_URL, ORG_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import postHandler from '@/handlers/post_handler';
import { currentOrgSelector } from '@/slices/orgSlice';
import { User, Event, Organization, Invitation } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import { EnvelopeSimple, MagnifyingGlass, X } from '@phosphor-icons/react';
import deleteHandler from '@/handlers/delete_handler';
import PrimaryButton from '@/components/buttons/primary_btn';

interface Props {
  event: Event;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
}

const EditCoHosts = ({ event, setShow, setEvents }: Props) => {
  const [step, setStep] = useState(0);

  const [selectedOrganizationalUsers, setSelectedOrganizationalUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const [organizationalUsers, setOrganizationalUsers] = useState<User[]>([]);
  const [orgSearch, setOrgSearch] = useState('');

  const [clickedOnInvitations, setClickedOnInvitations] = useState(false);
  const [mutex, setMutex] = useState(false);

  const [coHostUserIDs, setCoHostUserIDs] = useState(event.coHosts.map(coHost => coHost.userID));

  const usersToAdd = useMemo(
    () => selectedOrganizationalUsers.filter(user => !coHostUserIDs.includes(user.id)),
    [selectedOrganizationalUsers]
  );

  const unchangedUsers = useMemo(
    () => selectedOrganizationalUsers.filter(user => coHostUserIDs.includes(user.id)),
    [selectedOrganizationalUsers]
  );

  const usersToRemove = useMemo(() => {
    const selectedOrganizationalUserIDs = selectedOrganizationalUsers.map(user => user.id);
    return event.coHosts.filter(coHost => !selectedOrganizationalUserIDs.includes(coHost.user.id)).map(org => org.user);
  }, [selectedOrganizationalUsers]);

  const currentOrg = useSelector(currentOrgSelector);

  const fetchCoHosts = async () => {
    const URL = `${ORG_URL}/${currentOrg.id}/events/${event.id}/cohost`;
    const res = await getHandler(URL);
    if (res.statusCode === 200) {
      const coHosts: Organization[] = res.data.coHosts || [];
      setSelectedOrganizationalUsers(coHosts.map(o => o.user));
      setCoHostUserIDs(coHosts.map(o => o.userID));

      const invitations: Invitation[] = res.data.invitations || [];
      setInvitations(invitations.filter(i => i.status == 0));
    } else {
      if (res.data.message) Toaster.error(res.data.message);
      else Toaster.error(SERVER_ERROR);
    }
  };

  const getOrganizations = async () => {
    var URL = `${EXPLORE_URL}/orgs/trending?page=1&limit=${10}`;
    if (orgSearch != '') URL += `&search=${orgSearch}`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      let orgUsers: User[] = res.data.users || [];
      orgUsers = orgUsers.filter(u => u.id != currentOrg.userID);

      setOrganizationalUsers(orgUsers);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  const addCoHosts = async () => {
    if (usersToAdd.length == 0) {
      return;
    }

    const toaster = Toaster.startLoad('Sending Invitations..', 'cohost_invitations');

    const URL = `${ORG_URL}/${currentOrg.id}/events/${event.id}/cohost`;

    const res = await postHandler(URL, {
      userIDs: usersToAdd.map(u => u.id),
    });

    if (res.statusCode === 200) {
      Toaster.stopLoad(toaster, 'Invitations Sent!', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  const removeCoHosts = async () => {
    if (usersToRemove.length == 0) {
      return;
    }

    const toaster = Toaster.startLoad('Removing Selected Co Hosts..', 'cohost_invitations');

    const URL = `${ORG_URL}/${currentOrg.id}/events/${event.id}/cohost`;

    const userIDs = usersToRemove.map(u => u.id);

    const res = await deleteHandler(URL, {
      userIDs,
    });

    if (res.statusCode === 200) {
      setEvents(prev =>
        prev.map(e => {
          if (e.id == event.id) return { ...e, coHosts: e.coHosts.filter(o => !userIDs.includes(o.userID)) };
          else return e;
        })
      );
      Toaster.stopLoad(toaster, 'Co Hosts Removed', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  const handleSubmit = async () => {
    if (usersToAdd.length == 0 && usersToRemove.length == 0) {
      setShow(false);
      return;
    }
    if (mutex) return;
    setMutex(true);

    await addCoHosts();
    await removeCoHosts();

    setShow(false);

    setMutex(false);
  };

  const handleOrgChange = (el: React.ChangeEvent<HTMLInputElement>) => {
    setOrgSearch(el.target.value);
  };

  const handleClickOrganization = (orgUser: User) => {
    if (!invitations.map(i => i.userID).includes(orgUser.id))
      if (selectedOrganizationalUsers.map(u => u.id).includes(orgUser.id)) {
        setSelectedOrganizationalUsers(prev => prev.filter(u => u.id != orgUser.id));
      } else {
        setSelectedOrganizationalUsers(prev => [...prev, orgUser]);
      }
  };

  const handleWithdrawInvitation = async (invitationID: string) => {
    const toaster = Toaster.startLoad('Withdrawing Invitation...');

    const URL = `${ORG_URL}/${currentOrg.id}/events/invitations/${invitationID}?action=event_cohost`;

    const res = await deleteHandler(URL);

    if (res.statusCode === 204) {
      setInvitations(prev => prev.filter(i => i.id != invitationID));
      Toaster.stopLoad(toaster, 'Invitation Withdrawn', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  useEffect(() => {
    fetchCoHosts();

    document.documentElement.style.overflowY = 'hidden';
    document.documentElement.style.height = '100vh';

    return () => {
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.height = 'auto';
    };
  }, [orgSearch]);

  useEffect(() => {
    getOrganizations();
  }, [orgSearch]);

  return (
    <>
      <div className="fixed top-10 max-lg:top-0 w-1/2 max-lg:w-screen h-[90%] max-lg:h-screen backdrop-blur-2xl bg-white dark:bg-[#ffe1fc22] flex flex-col justify-between rounded-lg px-12 py-8 gap-8 max-lg:gap-4 dark:text-white font-primary overflow-y-auto border-[1px] border-primary_btn  dark:border-dark_primary_btn right-1/2 translate-x-1/2 shadow-2xl animate-fade_third z-50">
        {step == 0 ? (
          <div className="w-full flex flex-col gap-4 ">
            <div className="w-full flex items-center justify-between">
              <div className="text-3xl max-md:text-xl font-semibold">
                {clickedOnInvitations ? 'Invitations' : 'Add/Remove Co-hosts'}
              </div>
              <div
                onClick={() => setClickedOnInvitations(prev => !prev)}
                className={`w-fit h-full max-lg:text-sm text-gray-400 dark:text-gray-200 ${
                  clickedOnInvitations
                    ? 'bg-primary_comp_hover text-primary_text shadow-md'
                    : 'bg-white hover:shadow-md'
                } px-4 max-lg:px-2 py-3 rounded-lg cursor-pointer border-gray-300 border-[1px] transition-ease-300 dark:hover:shadow-outer dark:shadow-outer flex justify-between items-center`}
              >
                <EnvelopeSimple size={24} />
              </div>
            </div>

            <div className="w-full h-[420px] flex flex-col gap-4">
              {clickedOnInvitations ? (
                <>
                  {invitations.length == 0 ? (
                    <div className="h-64 text-xl flex-center">No Invitations found :(</div>
                  ) : (
                    <div className="w-full flex-1 flex flex-col gap-2 overflow-y-auto">
                      {invitations.map(invitation => {
                        return (
                          <div key={invitation.id} className="w-full flex gap-2 rounded-lg p-2 transition-ease-200">
                            <Image
                              crossOrigin="anonymous"
                              width={50}
                              height={50}
                              alt={'Org Pic'}
                              src={`${USER_PROFILE_PIC_URL}/${invitation.user.profilePic}`}
                              className="rounded-full w-12 h-12 border-[1px] border-black"
                            />
                            <div className="w-[calc(100%-48px)] flex items-center justify-between">
                              <div className="w-fit flex flex-col">
                                <div className="text-lg font-bold">{invitation.user.name}</div>
                                <div className="text-sm dark:text-gray-200">@{invitation.user.username}</div>
                                {invitation.user.tagline && invitation.user.tagline != '' && (
                                  <div className="text-sm mt-2">{invitation.user.tagline}</div>
                                )}
                              </div>
                              <div
                                onClick={() => handleWithdrawInvitation(invitation.id)}
                                className="text-sm text-primary_danger cursor-pointer"
                              >
                                Withdraw Invitation
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="w-full h-12 flex items-center px-4 gap-4 dark:bg-dark_primary_comp_hover rounded-md">
                    <MagnifyingGlass size={24} />
                    <input
                      className="grow bg-transparent focus:outline-none font-medium"
                      placeholder="Search"
                      value={orgSearch}
                      onChange={handleOrgChange}
                    />
                  </div>
                  {organizationalUsers.length == 0 ? (
                    <div className="h-64 text-xl flex-center">No other Organisation found :(</div>
                  ) : (
                    <div className="w-full flex-1 flex flex-col gap-2 overflow-y-auto">
                      {organizationalUsers.map(user => {
                        return (
                          <div
                            key={user.id}
                            onClick={() => handleClickOrganization(user)}
                            className={`w-full flex gap-2 rounded-lg p-2 ${
                              selectedOrganizationalUsers.map(u => u.id).includes(user.id)
                                ? 'bg-primary_comp_hover dark:bg-dark_primary_comp_active'
                                : 'hover:bg-primary_comp dark:bg-dark_primary_comp dark:hover:bg-dark_primary_comp_hover'
                            } cursor-pointer transition-ease-200`}
                          >
                            <Image
                              crossOrigin="anonymous"
                              width={50}
                              height={50}
                              alt={'Org Pic'}
                              src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
                              className={'rounded-full w-12 h-12 cursor-pointer border-[1px] border-black'}
                            />
                            <div className="w-[calc(100%-48px)] flex items-center justify-between">
                              <div className="w-fit flex flex-col">
                                <div className="text-lg font-bold">{user.name}</div>
                                <div className="text-sm dark:text-gray-200">@{user.username}</div>
                                {user.tagline && user.tagline != '' && (
                                  <div className="text-sm mt-2">{user.tagline}</div>
                                )}
                              </div>
                              {invitations.map(i => i.userID).includes(user.id) && (
                                <div className="text-sm">Invitation Pending</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-4 ">
            <div className="text-3xl max-md:text-xl font-semibold">Confirm Co-hosts</div>
            {usersToAdd.length > 0 && (
              <>
                <div className="text-2xl font-medium">Organisations to Invite</div>
                <div className="w-full  h-[420px] flex flex-col gap-2">
                  {usersToAdd.map(org => {
                    return (
                      <div
                        key={org.id}
                        className="w-full flex justify-between items-center rounded-lg p-2 dark:bg-dark_primary_comp_hover cursor-default transition-ease-200"
                      >
                        <div className="w-fit flex gap-2 items-center">
                          <Image
                            crossOrigin="anonymous"
                            width={50}
                            height={50}
                            alt={'User Pic'}
                            src={`${USER_PROFILE_PIC_URL}/${org.profilePic}`}
                            className={'rounded-full w-12 h-12 cursor-pointer border-[1px] border-black'}
                          />
                          <div className="grow flex flex-wrap justify-between items-center">
                            <div className="flex flex-col">
                              <div className="text-lg font-bold">{org.name}</div>
                              <div className="text-sm dark:text-gray-200">@{org.username}</div>
                            </div>
                          </div>
                        </div>
                        <X
                          onClick={() => {
                            setSelectedOrganizationalUsers(prev => prev.filter(u => u.id != org.id));
                          }}
                          className="cursor-pointer"
                          size={24}
                          weight="bold"
                        />
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {usersToRemove.length > 0 && (
              <>
                <div className="text-2xl font-medium">Organisations to Remove</div>
                <div className="w-full  h-[420px] flex flex-col gap-2">
                  {usersToRemove.map(user => {
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
                        <X
                          onClick={() => handleClickOrganization(user)}
                          className="cursor-pointer"
                          size={24}
                          weight="bold"
                        />
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {unchangedUsers.length > 0 && (
              <>
                <div className="text-2xl font-medium">Unchanged Co Hosts</div>
                <div className="w-full  h-[420px] flex flex-col gap-2">
                  {unchangedUsers.map(user => {
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
                          <div className="flex flex-col">
                            <div className="text-lg font-bold">{user.name}</div>
                            <div className="text-sm dark:text-gray-200">@{user.username}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {!clickedOnInvitations && (
          <div className="w-full flex items-end justify-between">
            {step != 0 ? <PrimaryButton label="Prev" onClick={() => setStep(prev => prev - 1)} /> : <div></div>}
            {usersToAdd.length == 0 && usersToRemove.length == 0 ? (
              <div></div>
            ) : step != 1 ? (
              <PrimaryButton label="Next" onClick={() => setStep(prev => prev + 1)} />
            ) : (
              <PrimaryButton label="Submit" onClick={handleSubmit} />
            )}
          </div>
        )}
      </div>
      <div
        onClick={() => setShow(false)}
        className="bg-backdrop w-screen h-screen max-lg:w-[105vw] max-lg:h-[105vh] fixed top-0 left-0 animate-fade_third z-20"
      ></div>
    </>
  );
};

export default EditCoHosts;
