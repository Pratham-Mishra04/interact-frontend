import { ORG_URL, TASK_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import postHandler from '@/handlers/post_handler';
import { Organization, PRIORITY, Project, Task, User } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { SERVER_ERROR } from '@/config/errors';
import Tags from '@/components/utils/edit_tags';
import moment from 'moment';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import { useSelector } from 'react-redux';
import { initialOrganization, initialProject } from '@/types/initials';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  organization?: Organization;
  project?: Project;
  org?: boolean;
  setShowTasks?: React.Dispatch<React.SetStateAction<boolean>>;
  setTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
  setFilteredTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
}

const NewTask = ({
  setShow,
  org = false,
  organization = initialOrganization,
  project = initialProject,
  setShowTasks,
  setTasks,
  setFilteredTasks,
}: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [deadline, setDeadline] = useState(new Date().toISOString());
  const [priority, setPriority] = useState<PRIORITY>('low');

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');

  const [status, setStatus] = useState(0);
  const [mutex, setMutex] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const handleChange = (el: React.ChangeEvent<HTMLInputElement>) => {
    fetchUsers(el.target.value);
    setSearch(el.target.value);
  };

  const fetchUsers = async (key: string) => {
    const matchedUsers: User[] = [];
    if (org)
      organization?.memberships.forEach(membership => {
        if (membership.user.username.match(new RegExp(key, 'i'))) matchedUsers.push(membership.user);
        else if (membership.user.name.match(new RegExp(key, 'i'))) matchedUsers.push(membership.user);
      });
    else {
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

    const toaster = Toaster.startLoad('Creating a new task');

    const URL = org ? `${ORG_URL}/${currentOrgID}/tasks` : `${TASK_URL}/${project.id}`;

    const userIDs = selectedUsers.map(user => user.id);

    const formData = {
      title,
      description,
      tags,
      users: userIDs,
      deadline: moment(deadline),
      priority,
    };

    const res = await postHandler(URL, formData);
    if (res.statusCode === 201) {
      const task = res.data.task;
      if (setTasks) setTasks(prev => [...prev, task]);
      if (setFilteredTasks) setFilteredTasks(prev => [...prev, task]);

      setShow(false);
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
    <>
      <div className="fixed top-24 max-md:top-20 w-[640px] max-md:w-5/6 backdrop-blur-2xl bg-white dark:bg-[#ffe1fc22] flex flex-col gap-4 rounded-lg p-10 max-md:p-5 dark:text-white font-primary border-[1px] border-primary_btn  dark:border-dark_primary_btn right-1/2 translate-x-1/2 animate-fade_third z-50">
        <div className="text-3xl max-md:text-xl font-semibold">
          {status == 0 ? 'Task Info' : status == 1 ? 'Select Users' : 'Review Details'}
        </div>
        <div className="w-full h-[420px] flex flex-col gap-4">
          {status == 0 ? (
            <div className="w-full flex flex-col gap-4">
              <div className="w-full flex gap-4 px-4 py-2 dark:bg-dark_primary_comp_hover rounded-lg ">
                <input
                  type="text"
                  className="grow bg-transparent focus:outline-none text-xl"
                  placeholder="Task Title"
                  maxLength={25}
                  value={title}
                  onChange={el => setTitle(el.target.value)}
                />
              </div>
              <textarea
                className="w-full min-h-[64px] max-h-36 px-4 py-2 bg-primary_comp dark:bg-dark_primary_comp rounded-lg focus:outline-none"
                placeholder="Task Description"
                maxLength={250}
                value={description}
                onChange={el => setDescription(el.target.value)}
              ></textarea>
              <div>
                <div className="text-xs ml-1 font-medium uppercase text-gray-500">Tags ({tags.length}/5)</div>
                <Tags tags={tags} setTags={setTags} maxTags={5} />
              </div>
              <div className="w-full flex justify-between items-center px-2">
                <div className="text-xl">Priority: </div>
                <select
                  onChange={el => {
                    if (el.target.value == 'low') setPriority(el.target.value);
                    else if (el.target.value == 'medium') setPriority(el.target.value);
                    else if (el.target.value == 'high') setPriority(el.target.value);
                  }}
                  value={priority}
                  className="w-fit h-12 border-[1px] border-primary_btn dark:border-dark_primary_btn dark:text-white bg-primary_comp dark:bg-[#10013b30] focus:outline-none text-sm rounded-lg block p-2"
                >
                  {['low', 'medium', 'high'].map((c, i) => {
                    return (
                      <option className="bg-primary_comp_hover dark:bg-[#10013b30]" key={i} value={c}>
                        {c}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="w-full flex justify-between items-center px-2">
                <div className="text-xl">Deadline: </div>
                <input
                  type="date"
                  className="bg-transparent focus:outline-none text-xl"
                  placeholder="Deadline"
                  value={deadline}
                  onChange={el => {
                    var selectedDate = moment(el.target.value);
                    var currentDate = moment();
                    if (selectedDate.isBefore(currentDate)) {
                      alert('Select a valid date');
                    }
                    setDeadline(el.target.value);
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              {status == 1 ? (
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
                      type="text"
                      className="grow bg-transparent focus:outline-none text-xl"
                      placeholder="Task Title"
                      maxLength={25}
                      value={title}
                      onChange={el => setTitle(el.target.value)}
                    />
                  </div>
                  <textarea
                    className="w-full min-h-[64px] max-h-36 px-4 py-2 bg-primary_comp dark:bg-dark_primary_comp rounded-lg focus:outline-none"
                    placeholder="Task Description"
                    maxLength={250}
                    value={description}
                    onChange={el => setDescription(el.target.value)}
                  ></textarea>
                  <div className="w-full flex justify-between items-center px-2">
                    <div className="text-xl">Priority: </div>
                    <select
                      onChange={el => {
                        if (el.target.value == 'low') setPriority(el.target.value);
                        else if (el.target.value == 'medium') setPriority(el.target.value);
                        else if (el.target.value == 'high') setPriority(el.target.value);
                      }}
                      value={priority}
                      className="w-fit h-12 border-[1px] border-primary_btn dark:border-dark_primary_btn dark:text-white bg-primary_comp dark:bg-[#10013b30] focus:outline-none text-sm rounded-lg block p-2"
                    >
                      {['low', 'medium', 'high'].map((c, i) => {
                        return (
                          <option className="bg-primary_comp_hover dark:bg-[#10013b30]" key={i} value={c}>
                            {c}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="w-full flex justify-between items-center px-2">
                    <div className="text-xl">Deadline: </div>
                    <input
                      type="date"
                      className="bg-transparent focus:outline-none text-xl"
                      placeholder="Deadline"
                      value={deadline}
                      onChange={el => {
                        var selectedDate = moment(el.target.value);
                        var currentDate = moment();
                        if (selectedDate.isBefore(currentDate)) {
                          alert('Select a valid date');
                        }
                        setDeadline(el.target.value);
                      }}
                    />
                  </div>
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
            </>
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
              {status == 1 ? (
                <>
                  {' '}
                  <div
                    onClick={() => setStatus(0)}
                    className="w-32 p-2 flex-center dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active transition-ease-300 cursor-pointer rounded-lg font-medium text-lg"
                  >
                    Prev
                  </div>{' '}
                  <div
                    onClick={() => setStatus(2)}
                    className="w-32 p-2 flex-center dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active transition-ease-300 cursor-pointer rounded-lg font-medium text-lg"
                  >
                    Next
                  </div>
                </>
              ) : (
                <>
                  <div
                    onClick={() => setStatus(1)}
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

export default NewTask;
