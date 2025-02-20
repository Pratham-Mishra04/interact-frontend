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
import Input from '@/components/form/input';
import Select from '@/components/form/select';
import Time from '@/components/form/time';
import TextArea from '@/components/form/textarea';
import Tags from '@/components/form/tags';
import Links from '@/components/form/links';
import { getFormattedTime } from '@/utils/funcs/time';
import Checkbox from '@/components/form/checkbox';
import EditorInput from '@/components/form/editor-input';

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
  const [haveSession, setHaveSession] = useState(false);

  const [step, setStep] = useState(0);

  const [memberships, setMemberships] = useState<OrganizationMembership[]>([]);

  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const [mutex, setMutex] = useState(false);

  const [organizationalUsers, setOrganizationalUsers] = useState<User[]>([]);
  const [orgSearch, setOrgSearch] = useState('');
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

  const getOrganizations = async () => {
    var URL = `${EXPLORE_URL}/orgs?page=1&limit=${10}`;
    if (orgSearch != '') URL += `&search=${orgSearch}`;
    const res = await getHandler(URL, undefined, true);
    if (res.statusCode == 200) {
      let orgUsers: User[] = res.data.users || [];
      orgUsers = orgUsers.filter(u => u.id != currentOrg.userID);

      setOrganizationalUsers(orgUsers);
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

  const addCoHosts = async (eventID: string) => {
    if (selectedOrganizationalUsers.length == 0) {
      return;
    }

    const toaster = Toaster.startLoad('Sending Invitations..', 'cohost_invitations');

    const URL = `${ORG_URL}/${currentOrg.id}/events/${eventID}/cohost`;

    const res = await postHandler(URL, {
      userIDs: selectedOrganizationalUsers.map(user => user.id),
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
      Toaster.error('Start Time cannot be before current time.');
      return false;
    }
    if (end.isBefore(start)) {
      Toaster.error('End Time cannot be before Start Time');
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
    formData.append('startTime', getFormattedTime(startTime));
    formData.append('endTime', getFormattedTime(endTime));
    if (image) formData.append('coverPic', image);
    if (haveSession) formData.append('haveSession', String(haveSession));

    const URL = `${ORG_URL}/${currentOrg.id}/events`;

    const res = await postHandler(URL, formData, 'multipart/form-data');

    if (res.statusCode === 201) {
      const event: Event = res.data.event;
      event.organization.title = currentOrg.title;
      setEvents(prev => [event, ...prev]);

      await addCoordinators(toaster, event.id);
      await addCoHosts(event.id);

      setShow(false);
    } else if (res.statusCode == 413) {
      Toaster.stopLoad(toaster, 'Image too large', 0);
    } else {
      Toaster.stopLoad(toaster, res.data.message || SERVER_ERROR, 0);
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

  const handleChange = (el: React.ChangeEvent<HTMLInputElement>) => {
    fetchUsers(el.target.value);
    setSearch(el.target.value);
  };

  const handleOrgChange = (el: React.ChangeEvent<HTMLInputElement>) => {
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
    getMemberships();

    document.documentElement.style.overflowY = 'hidden';
    document.documentElement.style.height = '100vh';

    return () => {
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.height = 'auto';
    };
  }, []);

  useEffect(() => {
    getOrganizations();
  }, [orgSearch]);

  return (
    <>
      <div className="fixed top-10 max-lg:top-0 w-1/2 max-lg:w-screen h-[90%] max-lg:h-screen backdrop-blur-2xl bg-white dark:bg-dark_primary_comp flex flex-col justify-between rounded-lg p-8 gap-8 max-lg:gap-4 dark:text-white font-primary overflow-y-auto border-[1px] border-primary_btn  dark:border-dark_primary_btn right-1/2 translate-x-1/2 shadow-2xl animate-fade_third z-50">
        <X onClick={() => setShow(false)} className="fixed top-5 right-2" size={24} weight="bold" />
        {step == 0 ? (
          <div className="w-full flex flex-col gap-8 max-lg:gap-4 ">
            <div className="w-full">
              <CoverPic setSelectedFile={setImage} picType="Event" />
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
                <Select
                  label="Event Category"
                  val={category}
                  setVal={setCategory}
                  options={categories}
                  required={true}
                />
                <Input label="Event Tagline" val={tagline} setVal={setTagline} maxLength={50} required={true} />
                <Input label="Event Location" val={location} setVal={setLocation} maxLength={25} placeholder="Online" />
                <div className="w-full flex justify-between gap-4">
                  <div className="w-1/2">
                    <Time label="Start Time" val={startTime} setVal={setStartTime} required={true} />
                  </div>
                  <div className="w-1/2">
                    <Time label="End Time" val={endTime} setVal={setEndTime} required={true} />
                  </div>
                </div>
                <EditorInput label="Event Description" val={description} setVal={setDescription} maxLength={2500} />
                <Tags label="Event Tags" tags={tags} setTags={setTags} maxTags={10} required={true} />
                <Links label="Event Links" links={links} setLinks={setLinks} maxLinks={3} />
              </div>
            </div>
          </div>
        ) : step == 1 ? (
          <div className="w-full flex flex-col items-center gap-4 ">
            <div className="w-full text-3xl max-md:text-xl font-semibold">Select Coordinators</div>
            <div className="w-full h-[540px] overflow-y-auto flex flex-col gap-4">
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
                <div className="w-full flex flex-col gap-2">
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
                          {user.tagline && user.tagline != '' && <div className="text-sm mt-2">{user.tagline}</div>}
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
            <div className="text-3xl max-md:text-xl font-semibold">Select Co-host</div>
            <div className="w-full h-[540px] overflow-y-auto flex flex-col gap-4">
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
                  {organizationalUsers.map(org => {
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
          step === 3 && (
            <div className="w-full flex flex-col gap-4 ">
              <div className="text-3xl max-md:text-xl font-semibold">Create a Session on Interact</div>
              <div className="">
                <Checkbox
                  label="Conduct the event on Interact?"
                  val={haveSession}
                  setVal={setHaveSession}
                  disabled={false}
                />
              </div>
              <ul className="list-disc ml-4 flex flex-col gap-4 text-gray-700">
                <li>
                  By checking this option, a <b>parallel session on Interact</b> will be created, active during the
                  event timings, allowing registered participants to join freely.
                </li>
                <li>
                  To host the session on Interact, the event duration (and therefore the meeting duration){' '}
                  <b>must not exceed 5 hours</b>.
                </li>
                <li>
                  The session will be <b>open to all members</b> of the host and co-host organisations, with
                  registrations available for non-members.
                </li>
                <li>
                  Session details (including participation information, recordings, and transcripts) will be accessible
                  <b> exclusively to members of the host organisation</b>.
                </li>
                <li>
                  Managers and Event Coordinators from the host and co-host organisations will act as meeting hosts,
                  retaining full control over the session.
                </li>
                <li>
                  Any changes to the event details will automatically reflect in the parallel meeting on Interact;
                  however, <b>direct editing of the parallel meeting details is not possible</b>.
                </li>
                <li>
                  Once unchecked, <b>this option cannot be selected again</b>, so consider carefully before opting out.
                </li>
              </ul>
            </div>
          )
        )}

        <div className="w-full flex items-end justify-between">
          {step != 0 ? <PrimaryButton label="Back" onClick={() => setStep(prev => prev - 1)} /> : <div></div>}
          {step != 3 ? (
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
