import { ORG_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import postHandler from '@/handlers/post_handler';
import { Meeting, OrganizationMembership, Team, User } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { SERVER_ERROR } from '@/config/errors';
import moment from 'moment';
import { currentOrgSelector } from '@/slices/orgSlice';
import { useSelector } from 'react-redux';
import PrimaryButton from '@/components/buttons/primary_btn';
import Input from '@/components/form/input';
import TextArea from '@/components/form/textarea';
import Tags from '@/components/form/tags';
import Time from '@/components/form/time';
import Checkbox from '@/components/form/checkbox';
import getHandler from '@/handlers/get_handler';
import Loader from '@/components/common/loader';
import { userIDSelector } from '@/slices/userSlice';
import { initialMeeting } from '@/types/initials';
import Select from '@/components/form/select';
import { getFormattedTime, getInputFieldFormatTime } from '@/utils/funcs/time';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setMeetings?: React.Dispatch<React.SetStateAction<Meeting[]>>;
}

const NewMeeting = ({ setShow, setMeetings }: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [startTime, setStartTime] = useState(getInputFieldFormatTime(new Date()));
  const [endTime, setEndTime] = useState(getInputFieldFormatTime(new Date()));
  const [isOnline, setIsOnline] = useState(true);
  const [isOpenForMembers, setIsOpenForMembers] = useState(false);
  const [allowExternalParticipants, setAllowExternalParticipants] = useState(false);
  const [frequency, setFrequency] = useState('daily');
  const [date, setDate] = useState(1);
  const [day, setDay] = useState('Monday');
  const [isReoccurring, setIsReoccurring] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);

  const [status, setStatus] = useState(0);
  const [mutex, setMutex] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);

  const [meeting, setMeeting] = useState(initialMeeting);

  const userID = useSelector(userIDSelector);

  const fetchUsers = async (search: string, abortController?: AbortController) => {
    setLoading(true);
    const URL = `${ORG_URL}/${
      currentOrg.id
    }/meetings/non-participants/?search=${search}&limit=${10}&isOpenForMembers=${isOpenForMembers}&allowExternalParticipants=${allowExternalParticipants}`;

    const res = await getHandler(URL, abortController?.signal, true);
    if (res.statusCode == 200) {
      const userData: User[] = res.data.users || [];
      setUsers(userData.filter(u => u.id != userID));
      setLoading(false);
    } else {
      if (res.status != -1) {
        if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
        else Toaster.error(SERVER_ERROR, 'error_toaster');
      }
    }

    const matchedTeams: Team[] = [];
    currentOrg.teams?.forEach(t => {
      if (t.title.match(new RegExp(search, 'i'))) matchedTeams.push(t);
    });
    setTeams(matchedTeams);
  };

  const handleClickUser = (user: User) => {
    if (selectedUsers.map(user => user.id).includes(user.id)) {
      setSelectedUsers(prev => prev.filter(u => u.id != user.id));
    } else {
      setSelectedUsers(prev => [...prev, user]);
    }
  };

  const handleClickTeam = async (team: Team) => {
    const users = await getTeamUsers(team);
    if (selectedTeams.includes(team)) {
      setSelectedTeams(prev => prev.filter(t => t.id !== team.id));
      setSelectedUsers(prev => prev.filter(user => !users.some(u => u.id === user.id)));
    } else {
      setSelectedTeams(prev => [...prev, team]);
      setSelectedUsers(prev => {
        const newUsers = users.filter(user => !prev.some(u => u.id === user.id));
        return [...prev, ...newUsers];
      });
    }
  };

  const getTeamUsers = async (team: Team) => {
    const URL = `${ORG_URL}/${currentOrg.id}/teams/${team.id}`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      const memberships: OrganizationMembership[] = res.data.team?.memberships;
      return memberships.map(m => m.user);
    } else {
      if (res.status != -1) {
        if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
        else Toaster.error(SERVER_ERROR, 'error_toaster');
      }
      return [];
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchUsers(search, abortController);

    return () => {
      abortController.abort();
    };
  }, [search]);

  const currentOrg = useSelector(currentOrgSelector);

  const meetingDetailsValidator = () => {
    if (title.trim() == '') {
      Toaster.error('Enter Title');
      return false;
    }

    const start = moment(startTime);
    const end = moment(endTime);

    if (start.isBefore(moment())) {
      Toaster.error('Start Time cannot be before current time.');
      return false;
    }
    if (end.isSameOrBefore(start)) {
      Toaster.error('End Time cannot be before Start Time');
      return false;
    }

    const duration = moment.duration(end.diff(start));
    const hours = duration.asHours();

    if (hours > 5) {
      Toaster.error('Meetings cannot be longer than 5 hours');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (title.trim().length == 0) {
      Toaster.error('Title cannot be empty');
      return;
    }

    if (tags.length == 0) {
      Toaster.error('Tags cannot be empty');
      return;
    }

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Creating a new meeting');

    const URL = `${ORG_URL}/${currentOrg.id}/meetings`;

    const formData = {
      title,
      description,
      tags,
      startTime: isReoccurring ? startTime : getFormattedTime(startTime),
      endTime: isReoccurring ? endTime : getFormattedTime(endTime),
      frequency: isReoccurring ? frequency : 'none',
      day: isReoccurring ? day : '',
      date: isReoccurring ? date : -1,
      isOnline,
      isOpenForMembers,
      allowExternalParticipants,
    };

    const res = await postHandler(URL, formData);
    if (res.statusCode === 201) {
      if (setMeetings) setMeetings(prev => [res.data.meeting, ...prev]);
      setMeeting(res.data.meeting);
      if (!isOnline || (isOpenForMembers && !allowExternalParticipants)) setShow(false);
      else fetchUsers('');
      Toaster.stopLoad(toaster, 'New Meeting Added!', 1);
      return 1;
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
      setMutex(false);
      return 0;
    }
  };

  const handleAddParticipants = async () => {
    const toaster = Toaster.startLoad('Adding Participants');

    const URL = `${ORG_URL}/${currentOrg.id}/meetings/participants/${meeting.id}`;

    const formData = {
      userIDs: selectedUsers.map(u => u.id),
    };

    const res = await postHandler(URL, formData);
    if (res.statusCode === 200) {
      setShow(false);
      Toaster.stopLoad(toaster, 'Participants Added!', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
  };

  useEffect(() => {
    document.documentElement.style.overflowY = 'hidden';
    document.documentElement.style.height = '100vh';

    return () => {
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.height = 'auto';
    };
  }, []);

  return (
    <>
      <div className="fixed top-12 max-md:top-20 w-[640px] max-md:w-5/6 backdrop-blur-2xl bg-white dark:bg-dark_primary_comp flex flex-col gap-6 rounded-lg px-2 py-10 max-md:p-5 font-primary border-[1px] border-primary_btn right-1/2 translate-x-1/2 animate-fade_third z-50">
        <div className="text-3xl max-md:text-xl font-semibold px-8 max-md:px-0">
          {status == 0 ? 'Meeting Details' : status == 1 ? 'Select Users' : 'Review Details'}
        </div>
        <div className="w-full max-h-[540px] overflow-y-auto flex flex-col gap-4 px-8 max-md:px-0">
          {status == 0 ? (
            <div className="w-full flex flex-col gap-4">
              <Input label="Meeting Title" val={title} setVal={setTitle} maxLength={50} required={true} />
              <TextArea label="Meeting Description" val={description} setVal={setDescription} maxLength={500} />
              <Tags label="Meeting Tags" tags={tags} setTags={setTags} maxTags={5} required={true} />
              <Checkbox label="Is the Meeting Reoccurring?" val={isReoccurring} setVal={setIsReoccurring} />
              {isReoccurring && (
                <Select
                  label="Frequency"
                  val={frequency}
                  setVal={setFrequency}
                  options={['daily', 'weekly', 'monthly']}
                />
              )}
              <div className="w-full flex max-md:flex-col justify-between gap-4">
                <div className="w-1/2 max-md:w-full">
                  <Time
                    label="Start Time"
                    val={startTime}
                    setVal={setStartTime}
                    required={true}
                    includeDate={!isReoccurring}
                  />
                </div>
                <div className="w-1/2 max-md:w-full">
                  <Time
                    label="Expected End Time"
                    val={endTime}
                    setVal={setEndTime}
                    required={true}
                    includeDate={!isReoccurring}
                  />
                </div>
              </div>
              {isReoccurring && frequency == 'weekly' && (
                <Select
                  label="Day of Week"
                  val={day}
                  setVal={setDay}
                  options={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']}
                />
              )}
              {isReoccurring && frequency == 'monthly' && (
                <Select
                  label="Day of Month"
                  val={date}
                  setVal={setDate}
                  options={Array.from({ length: 30 }, (_, i) => i + 1)}
                />
              )}
              {/* <Checkbox label="Is the Meeting Online?" val={isOnline} setVal={setIsOnline} /> */}
              {isOnline && (
                <>
                  <Checkbox
                    label="Is the Meeting Open for all Members?"
                    val={isOpenForMembers}
                    setVal={setIsOpenForMembers}
                  />
                  <Checkbox
                    label="Do you want to allow External Participants?"
                    val={allowExternalParticipants}
                    setVal={setAllowExternalParticipants}
                  />
                </>
              )}
            </div>
          ) : (
            <>
              <div className="w-full h-12 flex items-center px-4 gap-4 dark:bg-dark_primary_comp_hover rounded-md">
                <MagnifyingGlass size={24} />
                <input
                  className="grow bg-transparent focus:outline-none font-medium"
                  placeholder="Search"
                  value={search}
                  onChange={el => setSearch(el.target.value)}
                />
              </div>
              <div className="w-full flex-1 flex flex-col gap-2 overflow-y-auto">
                {loading ? (
                  <Loader />
                ) : (
                  <>
                    {teams && (
                      <div className="w-full flex items-center flex-wrap gap-2">
                        {teams.map(team => (
                          <div
                            style={{ backgroundColor: team.color }}
                            onClick={() => handleClickTeam(team)}
                            className={`w-fit flex flex-col border-2 ${
                              selectedTeams.includes(team)
                                ? 'shadow-sm opacity-50 border-primary_text'
                                : 'hover:opacity-70 border-white'
                            } rounded-lg px-4 py-2 cursor-pointer transition-ease-300`}
                            key={team.id}
                          >
                            <div className="text-sm font-medium">{team.title}</div>
                            <div className="text-xs">{team.noUsers} Members</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {users.map(user => {
                      return (
                        <div
                          key={user.id}
                          onClick={() => handleClickUser(user)}
                          className={`w-full flex gap-2 rounded-lg p-2 ${
                            selectedUsers.map(user => user.id).includes(user.id)
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
                            {user.tagline && user.tagline != '' && <div className="text-sm mt-2">{user.tagline}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </>
          )}
        </div>
        <div className="w-full flex justify-end px-8">
          {status == 0 ? (
            <PrimaryButton
              onClick={async () => {
                const checker = meetingDetailsValidator();
                if (checker) {
                  const res = await handleSubmit();
                  if (res == 1) setStatus(prev => prev + 1);
                }
              }}
              label="Submit"
              animateIn={false}
              disabled={mutex}
            />
          ) : (
            <PrimaryButton onClick={handleAddParticipants} label="Submit" animateIn={false} />
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

export default NewMeeting;
