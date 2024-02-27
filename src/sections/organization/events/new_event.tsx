import Links from '@/components/utils/edit_links';
import Tags from '@/components/utils/edit_tags';
import CoverPic from '@/components/utils/new_cover';
import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import postHandler from '@/handlers/post_handler';
import { currentOrgSelector } from '@/slices/orgSlice';
import { User, Event, OrganizationMembership } from '@/types';
import categories from '@/utils/categories';
import Toaster from '@/utils/toaster';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import getHandler from '@/handlers/get_handler';
import { Id } from 'react-toastify';
import Image from 'next/image';
import { EXPLORE_URL } from '@/config/routes';
import PrimaryButton from '@/components/buttons/primary_btn';
import BuildButton from '@/components/buttons/build_btn';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
}

const NewEvent = ({ setShow, setEvents }: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [image, setImage] = useState<File>();

  const [step, setStep] = useState(0);

  const [memberships, setMemberships] = useState<OrganizationMembership[]>([]);

  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const [mutex, setMutex] = useState(false);

  const [organizationalUsers, setOrganizationalUsers] = useState<User[]>([]);
  const [matchedOrgUsers, setMatchedOrgUsers] = useState<User[]>([]);
  const [orgSearch, setOrgSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrganizationalUsers, setSelectedOrganizationalUsers] = useState<User[]>([]);

  const currentOrg = useSelector(currentOrgSelector);

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

  const getOrganizations = async (search: string | null) => {
    const URL = `${EXPLORE_URL}/orgs/trending?page=${page}&limit=${10}`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      let orgUsers: User[] = res.data.users || [];
      orgUsers = orgUsers.filter(u => u.id != currentOrg.userID);
      if (search && search != '') {
        setOrganizationalUsers(orgUsers);
        setMatchedOrgUsers(orgUsers);
      } else {
        if (!search && page == 1) {
          setOrganizationalUsers(orgUsers);
          setMatchedOrgUsers(orgUsers);
        } else {
          const addedUsers = [...users, ...orgUsers];
          setOrganizationalUsers(addedUsers);
        }
        setPage(prev => prev + 1);
      }
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  const addCoordinators = async (toaster: Id, eventID: string) => {
    if (selectedUsers.length == 0) {
      Toaster.stopLoad(toaster, 'Event Added!', 1);
      return;
    }

    const URL = `${ORG_URL}/${currentOrg.id}/events/coordinators/${eventID}`;

    const res = await postHandler(URL, { userIDs: selectedUsers.map(user => user.id) });

    if (res.statusCode === 200) {
      Toaster.stopLoad(toaster, 'Event Added!', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  const addCohosts = async (eventID: string) => {
    if (selectedOrganizationalUsers.length == 0) {
      return;
    }

    const toaster = Toaster.startLoad('Sending Invitations..', 'cohost_invitations');

    const URL = `${ORG_URL}/${currentOrg.id}/events/${eventID}/cohost`;

    const res = await postHandler(URL, {
      organizationIDs: selectedOrganizationalUsers.map(user => user.organization?.id),
    });

    if (res.statusCode === 200) {
      Toaster.stopLoad(toaster, 'Invitations Sent!', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  const eventDetailsValidator = () => {
    if (title.trim() == '') {
      Toaster.error('Enter Title');
      return false;
    }
    if (tagline.trim() == '') {
      Toaster.error('Enter Tagline');
      return false;
    }
    if (description.trim() == '') {
      Toaster.error('Enter Description');
      return false;
    }
    if (category.trim() == '' || category == 'Select Category') {
      Toaster.error('Select Category');
      return false;
    }
    if (tags.length < 3) {
      Toaster.error('Add at least 3 tags');
      return false;
    }
    if (!image) {
      Toaster.error('Add a Cover Picture');
      return false;
    }

    const start = moment(startTime);
    const end = moment(endTime);

    if (start.isBefore(moment())) {
      Toaster.error('Enter A Valid Start Time');
      return false;
    }
    if (end.isBefore(start)) {
      Toaster.error('Enter A Valid End Time');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Adding the event...');

    const formData = new FormData();

    formData.append('title', title);
    formData.append('tagline', tagline);
    formData.append('description', description);
    tags.forEach(tag => formData.append('tags', tag));
    links.forEach(link => formData.append('links', link));
    formData.append('category', category);
    formData.append('location', location == '' ? 'Online' : location);
    formData.append('startTime', moment(startTime).format('YYYY-MM-DDTHH:mm:ss[Z]'));
    formData.append('endTime', moment(endTime).format('YYYY-MM-DDTHH:mm:ss[Z]'));
    if (image) formData.append('coverPic', image);

    const URL = `${ORG_URL}/${currentOrg.id}/events`;

    const res = await postHandler(URL, formData, 'multipart/form-data');

    if (res.statusCode === 201) {
      const event: Event = res.data.event;
      event.organization.title = currentOrg.title;
      setEvents(prev => [event, ...prev]);

      await addCoordinators(toaster, event.id);
      await addCohosts(event.id);

      setShow(false);
    } else if (res.statusCode == 413) {
      Toaster.stopLoad(toaster, 'Image too large', 0);
    } else {
      if (res.data.message) {
        Toaster.stopLoad(toaster, res.data.message, 0);
      } else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
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

  const fetchOrganizations = async (key: string) => {
    const matchedOrgUsers: User[] = [];
    organizationalUsers.forEach(organizationalUser => {
      if (organizationalUser.name.match(new RegExp(key, 'i'))) matchedOrgUsers.push(organizationalUser);
      else if (organizationalUser.username.match(new RegExp(key, 'i'))) matchedOrgUsers.push(organizationalUser);
    });
    setMatchedOrgUsers(matchedOrgUsers);
  };

  const handleChange = (el: React.ChangeEvent<HTMLInputElement>) => {
    fetchUsers(el.target.value);
    setSearch(el.target.value);
  };

  const handleOrgChange = (el: React.ChangeEvent<HTMLInputElement>) => {
    fetchOrganizations(el.target.value);
    setOrgSearch(el.target.value);
  };

  const handleClickUser = (user: User) => {
    if (selectedUsers.includes(user)) {
      setSelectedUsers(prev => prev.filter(u => u.id != user.id));
    } else {
      setSelectedUsers(prev => [...prev, user]);
    }
  };

  const handleClickOrganization = (orgUser: User) => {
    if (selectedOrganizationalUsers.includes(orgUser)) {
      setSelectedOrganizationalUsers(prev => prev.filter(u => u.id != orgUser.id));
    } else {
      setSelectedOrganizationalUsers(prev => [...prev, orgUser]);
    }
  };

  useEffect(() => {
    setPage(1);
    getMemberships();
    getOrganizations('');
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
          <div className="w-full flex flex-col gap-8 max-lg:gap-4 ">
            <div className="w-full">
              <CoverPic setSelectedFile={setImage} type="Event" />
            </div>
            <div className="w-full flex flex-col justify-between gap-2">
              <div className="w-full text-primary_black flex flex-col gap-6 pb-8 max-lg:pb-4">
                <input
                  value={title}
                  onChange={el => setTitle(el.target.value)}
                  maxLength={25}
                  type="text"
                  placeholder="Untitled Event"
                  className="w-full text-5xl max-lg:text-center max-lg:text-3xl font-bold bg-transparent focus:outline-none"
                />

                <select
                  onChange={el => setCategory(el.target.value)}
                  className="w-1/2 max-lg:w-full h-12 border-[1px] border-primary_btn  dark:border-dark_primary_btn dark:text-white bg-primary_comp dark:bg-[#10013b30] focus:outline-nonetext-sm rounded-lg block p-2"
                >
                  {categories.map((c, i) => {
                    return (
                      <option className="bg-primary_comp_hover dark:bg-[#10013b30]" key={i} value={c}>
                        {c}
                      </option>
                    );
                  })}
                </select>

                <div>
                  <div className="text-xs ml-1 font-medium uppercase text-gray-500">
                    Event Tagline ({tagline.trim().length}/50)
                  </div>
                  <input
                    value={tagline}
                    onChange={el => setTagline(el.target.value)}
                    maxLength={50}
                    type="text"
                    className="w-full font-medium bg-transparent focus:outline-none border-[1px] border-gray-400 rounded-lg p-2"
                    placeholder="Write your Tagline here..."
                  />
                </div>

                <div>
                  <div className="text-xs ml-1 font-medium uppercase text-gray-500">
                    Event Location ({location.trim().length}/25)
                  </div>
                  <input
                    value={location}
                    onChange={el => setLocation(el.target.value)}
                    maxLength={25}
                    type="text"
                    className="w-full bg-transparent focus:outline-none border-[1px] border-gray-400 rounded-lg p-2"
                    placeholder="Online"
                  />
                </div>

                <div className="w-full flex justify-between gap-4">
                  <div className="w-1/2">
                    <div className="text-xs ml-1 font-medium uppercase text-gray-500">Start Time</div>
                    <input
                      value={startTime}
                      onChange={el => setStartTime(el.target.value)}
                      type="datetime-local"
                      className="w-full bg-transparent focus:outline-none border-[1px] border-gray-400 rounded-lg p-2"
                    />
                  </div>
                  <div className="w-1/2">
                    <div className="text-xs ml-1 font-medium uppercase text-gray-500">End Time</div>
                    <input
                      value={endTime}
                      onChange={el => setEndTime(el.target.value)}
                      type="datetime-local"
                      className="w-full bg-transparent focus:outline-none border-[1px] border-gray-400 rounded-lg p-2"
                    />
                  </div>
                </div>

                <div>
                  <div className="text-xs ml-1 font-medium uppercase text-gray-500">
                    Event Description ({description.trim().length}/2500)
                  </div>
                  <textarea
                    value={description}
                    onChange={el => setDescription(el.target.value)}
                    maxLength={2500}
                    className="w-full min-h-[80px] max-h-80 bg-transparent focus:outline-none border-[1px] border-gray-400 rounded-lg p-2"
                    placeholder="Explain your event"
                  />
                </div>

                <div>
                  <div className="text-xs ml-1 font-medium uppercase text-gray-500">
                    Event Tags ({tags.length || 0}/10)
                  </div>
                  <Tags tags={tags} setTags={setTags} maxTags={10} />
                </div>

                <div>
                  <div className="text-xs ml-1 font-medium uppercase text-gray-500">
                    Event Links ({links.length || 0}/3)
                  </div>
                  <Links links={links} setLinks={setLinks} maxLinks={3} />
                </div>
              </div>
            </div>
          </div>
        ) : step == 1 ? (
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
                </div>
              )}
            </div>
          </div>
        ) : step === 2 ? (
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
                      <X
                        onClick={() => {
                          setSelectedUsers(prev => prev.filter(u => u.id != user.id));
                        }}
                        className="cursor-pointer"
                        size={24}
                        weight="bold"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : step === 3 ? (
          <div className="w-full flex flex-col gap-4 ">
            <div className="text-3xl max-md:text-xl font-semibold">Select Co-host</div>
            <div className="w-full h-[420px] flex flex-col gap-4">
              <div className="w-full h-12 flex items-center px-4 gap-4 dark:bg-dark_primary_comp_hover rounded-md">
                <MagnifyingGlass size={24} />
                <input
                  className="grow bg-transparent focus:outline-none font-medium"
                  placeholder="Search"
                  value={orgSearch}
                  onChange={handleOrgChange}
                />
              </div>
              {matchedOrgUsers.length == 0 ? (
                <div className="h-64 text-xl flex-center">No other Organisation found :(</div>
              ) : (
                <div className="w-full flex-1 flex flex-col gap-2 overflow-y-auto">
                  {matchedOrgUsers.map(org => {
                    return (
                      <div
                        key={org.id}
                        onClick={() => handleClickOrganization(org)}
                        className={`w-full flex gap-2 rounded-lg p-2 ${
                          selectedOrganizationalUsers.includes(org)
                            ? 'bg-primary_comp_hover dark:bg-dark_primary_comp_active'
                            : 'hover:bg-primary_comp dark:bg-dark_primary_comp dark:hover:bg-dark_primary_comp_hover'
                        } cursor-pointer transition-ease-200`}
                      >
                        <Image
                          crossOrigin="anonymous"
                          width={50}
                          height={50}
                          alt={'Org Pic'}
                          src={`${USER_PROFILE_PIC_URL}/${org.profilePic}`}
                          className={'rounded-full w-12 h-12 cursor-pointer border-[1px] border-black'}
                        />
                        <div className="w-5/6 flex flex-col">
                          <div className="text-lg font-bold">{org.name}</div>
                          <div className="text-sm dark:text-gray-200">@{org.username}</div>
                          {org.tagline && org.tagline != '' ? <div className="text-sm mt-2">{org.tagline}</div> : <></>}
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
            <div className="text-3xl max-md:text-xl font-semibold">Confirm Co-host&apos;s</div>
            {selectedOrganizationalUsers.length == 0 ? (
              <div className="h-64 text-xl flex-center">Selected Co-host&apos;s will be shown here :)</div>
            ) : (
              <div className="w-full  h-[420px] flex flex-col gap-2">
                {selectedOrganizationalUsers.map((org, index) => {
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
            )}
          </div>
        )}

        <div className="w-full flex items-end justify-between">
          {step != 0 ? <PrimaryButton label="Back" onClick={() => setStep(prev => prev - 1)} /> : <div></div>}
          {step != 4 ? (
            <PrimaryButton
              label="Next"
              onClick={() => {
                if (step == 0) {
                  const checker = eventDetailsValidator();
                  if (checker) setStep(prev => prev + 1);
                } else setStep(prev => prev + 1);
              }}
            />
          ) : (
            <BuildButton
              label="Build Event"
              loadingLabel="Building your event!"
              loading={mutex}
              onClick={handleSubmit}
            />
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

export default NewEvent;
