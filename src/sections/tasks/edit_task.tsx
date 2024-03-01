/* eslint-disable react/no-children-prop */
import { ORG_URL, TASK_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import { Organization, PRIORITY, Project, Task, User } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { MagnifyingGlass, Pen } from '@phosphor-icons/react';
import { SERVER_ERROR } from '@/config/errors';
import Tags from '@/components/utils/edit_tags';
import moment from 'moment';
import patchHandler from '@/handlers/patch_handler';
import isArrEdited from '@/utils/funcs/check_array_edited';
import deleteHandler from '@/handlers/delete_handler';
import { Id } from 'react-toastify';
import { useSelector } from 'react-redux';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import { initialOrganization, initialProject } from '@/types/initials';
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  organization?: Organization;
  project?: Project;
  org: boolean;
  task: Task;
  setTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
  setFilteredTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
}

const EditTask = ({
  setShow,
  org,
  organization = initialOrganization,
  project = initialProject,
  task,
  setTasks,
  setFilteredTasks,
}: Props) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [tags, setTags] = useState<string[]>(task.tags || []);
  const [deadline, setDeadline] = useState(moment(task.deadline).format('YYYY-MM-DD'));
  const [priority, setPriority] = useState<PRIORITY>(task.priority);

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');

  const [status, setStatus] = useState(0);
  const [mutex, setMutex] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState<User[]>(task.users || []);

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

  const selectedUserIncludes = (userID: string) => {
    var check = false;
    selectedUsers.forEach(user => {
      if (user.id == userID) {
        check = true;
        return;
      }
    });
    return check;
  };

  const handleClickUser = (user: User) => {
    if (selectedUsers.length == 25) return;
    if (selectedUserIncludes(user.id)) {
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

    const toaster = Toaster.startLoad('Updating the task');

    const URL = org ? `${ORG_URL}/${currentOrgID}/tasks/${task.id}` : `${TASK_URL}/${task.id}`;

    const userIDs = selectedUsers.map(user => user.id);

    const formData = new FormData();

    if (title != task.title) formData.append('title', title);
    if (description != task.description) formData.append('description', description);
    if (!moment(deadline).isSame(moment(task.deadline), 'day')) {
      formData.append('deadline', moment(deadline).toISOString());
    }
    if (isArrEdited(tags, task.tags)) tags.forEach(tag => formData.append('tags', tag));
    if (priority != task.priority) formData.append('priority', priority);

    const res = await patchHandler(URL, formData);
    if (res.statusCode === 200) {
      if (
        isArrEdited(
          userIDs,
          task.users.map(user => user.id)
        )
      ) {
        const oldUserIDs = task.users.map(user => user.id);
        let addUsersSuccess = true;
        let removeUsersSuccess = true;

        const usersToAdd = userIDs.filter(userID => !oldUserIDs.includes(userID));
        const usersToRemove = oldUserIDs.filter(userID => !userIDs.includes(userID));

        for (const userID of usersToAdd) {
          const result = await addUser(userID, toaster);
          if (result !== 1) {
            addUsersSuccess = false;
            break;
          }
        }

        if (addUsersSuccess) {
          for (const userID of usersToRemove) {
            const result = await removeUser(userID, toaster);
            if (result !== 1) {
              removeUsersSuccess = false;
              break;
            }
          }
        }

        if (addUsersSuccess && removeUsersSuccess) {
          if (setTasks)
            setTasks(prev =>
              prev.map(t => {
                if (t.id == task.id)
                  return {
                    ...t,
                    title,
                    description,
                    tags,
                    priority,
                    users: selectedUsers,
                    deadline: new Date(deadline),
                  };
                else return t;
              })
            );
          if (setFilteredTasks)
            setFilteredTasks(prev =>
              prev.map(t => {
                if (t.id == task.id)
                  return {
                    ...t,
                    title,
                    description,
                    tags,
                    priority,
                    users: selectedUsers,
                    deadline: new Date(deadline),
                  };
                else return t;
              })
            );
          setShow(false);
          Toaster.stopLoad(toaster, 'Task Edited!', 1);
        } else {
          Toaster.stopLoad(toaster, 'Error While Editing User List', 0);
          setMutex(false);
        }
      } else {
        if (setTasks)
          setTasks(prev =>
            prev.map(t => {
              if (t.id == task.id) return { ...t, title, description, priority, tags, deadline: new Date(deadline) };
              else return t;
            })
          );
        if (setFilteredTasks)
          setFilteredTasks(prev =>
            prev.map(t => {
              if (t.id == task.id) return { ...t, title, description, priority, tags, deadline: new Date(deadline) };
              else return t;
            })
          );
        setShow(false);
        Toaster.stopLoad(toaster, 'Task Edited!', 1);
      }
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
      setMutex(false);
    }
  };

  const addUser = async (userID: string, toaster: Id) => {
    const URL = org ? `${ORG_URL}/${currentOrgID}/tasks/users/${task.id}` : `${TASK_URL}/users/${task.id}`;

    const res = await patchHandler(URL, { userID });
    if (res.statusCode === 200) {
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

  const removeUser = async (userID: string, toaster: Id) => {
    const URL = org
      ? `${ORG_URL}/${currentOrgID}/tasks/users/${task.id}/${userID}`
      : `${TASK_URL}/users/${task.id}/${userID}`;
    const res = await deleteHandler(URL);
    if (res.statusCode === 200) {
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

  return (
    <>
      <div className="fixed top-24 max-lg:top-20 w-[640px] max-lg:w-5/6 backdrop-blur-2xl bg-white dark:bg-[#ffe1fc22] flex flex-col gap-4 rounded-lg p-10 max-lg:p-5 dark:text-white font-primary border-[1px] border-primary_btn  dark:border-dark_primary_btn right-1/2 translate-x-1/2 animate-fade_third z-50 max-lg:z-[60]">
        <div className="text-3xl max-lg:text-xl font-semibold">
          {status == 0 ? 'Task Info' : status == 1 ? 'Select Users' : 'Review Details'}
        </div>
        <div className="w-full h-[420px] overflow-y-auto flex flex-col gap-4">
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
                    } else setDeadline(el.target.value);
                  }}
                />
              </div>
            </div>
          ) : status == 1 ? (
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
                        selectedUserIncludes(user.id)
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
                    } else setDeadline(el.target.value);
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
        className="bg-backdrop w-screen h-screen fixed top-0 left-0 animate-fade_third z-20 max-lg:z-[51]"
      ></div>
    </>
  );
};

export default EditTask;
