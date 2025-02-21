import { ORG_URL, TASK_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import postHandler from '@/handlers/post_handler';
import { Organization, OrganizationMembership, PRIORITY, Project, Task, Team, User } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { MagnifyingGlass, Plus } from '@phosphor-icons/react';
import { SERVER_ERROR } from '@/config/errors';
import moment from 'moment';
import { currentOrgSelector } from '@/slices/orgSlice';
import { useSelector } from 'react-redux';
import { initialOrganization, initialProject } from '@/types/initials';
import PrimaryButton from '@/components/buttons/primary_btn';
import Input from '@/components/form/input';
import TextArea from '@/components/form/textarea';
import Tags from '@/components/form/tags';
import Select from '@/components/form/select';
import Time from '@/components/form/time';
import getHandler from '@/handlers/get_handler';
import { getInputFieldFormatTime } from '@/utils/funcs/time';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface Props {
  organization?: Organization;
  project?: Project;
  org?: boolean;
  setShowTasks?: React.Dispatch<React.SetStateAction<boolean>>;
  setTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
  setFilteredTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
  trigger?: React.ReactNode;
}

const NewTask = ({
  org = false,
  organization = initialOrganization,
  project = initialProject,
  setShowTasks,
  setTasks,
  setFilteredTasks,
  trigger,
}: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [deadline, setDeadline] = useState(getInputFieldFormatTime(new Date()));
  const [priority, setPriority] = useState<PRIORITY>('low');
  const [difficulty, setDifficulty] = useState('easy');
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [status, setStatus] = useState(0);
  const [mutex, setMutex] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);

  const handleChange = (el: React.ChangeEvent<HTMLInputElement>) => {
    fetchUsers(el.target.value);
    setSearch(el.target.value);
  };

  const fetchUsers = async (key: string) => {
    const matchedUsers: User[] = [];
    if (org) {
      organization?.memberships.forEach(membership => {
        if (membership.user.username.match(new RegExp(key, 'i'))) matchedUsers.push(membership.user);
        else if (membership.user.name.match(new RegExp(key, 'i'))) matchedUsers.push(membership.user);
      });

      const matchedTeams: Team[] = [];
      currentOrg.teams.forEach(t => {
        if (t.title.match(new RegExp(key, 'i'))) matchedTeams.push(t);
      });
      setTeams(matchedTeams);
    } else {
      if (project?.user.username.match(new RegExp(key, 'i'))) matchedUsers.push(project.user);
      else if (project?.user.name.match(new RegExp(key, 'i'))) matchedUsers.push(project.user);
      project?.memberships.forEach(membership => {
        if (membership.user.username.match(new RegExp(key, 'i'))) matchedUsers.push(membership.user);
        else if (membership.user.name.match(new RegExp(key, 'i'))) matchedUsers.push(membership.user);
      });
    }

    setUsers(matchedUsers);
  };

  useEffect(() => {
    fetchUsers('');
    if (org) setTeams(currentOrg.teams || []);
  }, []);

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

  const currentOrg = useSelector(currentOrgSelector);

  const taskDetailsValidator = () => {
    if (title.trim() == '') {
      Toaster.error('Enter Title');
      return false;
    }

    if (moment(deadline).isBefore(moment())) {
      Toaster.error('Deadline cannot be before current time.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (title.trim().length == 0) {
      Toaster.error('Title cannot be empty');
      return;
    }

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Creating a new task');

    const URL = org ? `${ORG_URL}/${currentOrg.id}/tasks` : `${TASK_URL}/${project.id}`;

    const userIDs = selectedUsers.map(user => user.id);

    const formData = {
      title,
      description,
      tags,
      users: userIDs,
      deadline: moment(deadline),
      priority,
      difficulty,
    };

    const res = await postHandler(URL, formData);
    if (res.statusCode === 201) {
      const task = res.data.task;
      if (setTasks) setTasks(prev => [task, ...prev]);
      if (setFilteredTasks) setFilteredTasks(prev => [task, ...prev]);

      setIsDialogOpen(false);
      if (setShowTasks) setShowTasks(true);
      Toaster.stopLoad(toaster, 'New Task Added!', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
      setMutex(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger>
        {trigger ? (
          trigger
        ) : (
          <Plus
            size={42}
            className="flex-center rounded-full hover:bg-white p-2 transition-ease-300 cursor-pointer"
            weight="regular"
          />
        )}
      </DialogTrigger>
      <DialogContent className="min-w-[40%]">
        <div className="w-full flex flex-col gap-4">
          <div className="text-3xl max-md:text-xl font-semibold">
            {status == 0 ? 'Task Info' : status == 1 ? 'Select Users' : 'Review Details'}
          </div>
          <div className="w-full h-[420px] overflow-y-auto flex flex-col gap-4">
            {status == 0 ? (
              <div className="w-full flex flex-col gap-4">
                <Input label="Task Title" val={title} setVal={setTitle} maxLength={50} required={true} />
                <TextArea label="Task Description" val={description} setVal={setDescription} maxLength={500} />
                <Tags label="Task Tags" tags={tags} setTags={setTags} maxTags={5} />
                <Select label="Task Priority" val={priority} setVal={setPriority} options={['low', 'medium', 'high']} />
                <Select
                  label="Task Difficulty"
                  val={difficulty}
                  setVal={setDifficulty}
                  options={['basic', 'proficient', 'expert']}
                />
                <Time
                  label="Task Deadline"
                  val={deadline}
                  setVal={setDeadline}
                  onChange={el => {
                    var selectedDate = moment(el.target.value);
                    var currentDate = moment();
                    if (selectedDate.isBefore(currentDate)) {
                      alert('Select a valid date');
                    } else setDeadline(el.target.value);
                  }}
                  required={true}
                />
              </div>
            ) : (
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
                  {org && teams && (
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
                </div>
              </>
            )}
          </div>
          <div className={`w-full flex ${status == 0 ? 'justify-end' : 'justify-between'}`}>
            {status == 0 ? (
              <PrimaryButton
                onClick={() => {
                  const checker = taskDetailsValidator();
                  if (checker) setStatus(prev => prev + 1);
                }}
                label="Next"
                animateIn={false}
              />
            ) : (
              <>
                <PrimaryButton onClick={() => setStatus(0)} label="Prev" animateIn={false} />
                <PrimaryButton onClick={handleSubmit} label="Submit" animateIn={false} />
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewTask;
