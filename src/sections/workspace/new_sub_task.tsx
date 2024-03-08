import { TASK_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import postHandler from '@/handlers/post_handler';
import { PRIORITY, Task, User } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { SERVER_ERROR } from '@/config/errors';
import moment from 'moment';
import Input from '@/components/form/input';
import TextArea from '@/components/form/textarea';
import Tags from '@/components/form/tags';
import Select from '@/components/form/select';
import Time from '@/components/form/time';
import PrimaryButton from '@/components/buttons/primary_btn';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  task: Task;
  setTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
  setFilteredTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
}

const NewSubTask = ({ setShow, task, setTasks, setFilteredTasks }: Props) => {
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
    task.users.forEach(user => {
      if (user.username.match(new RegExp(key, 'i'))) matchedUsers.push(user);
      else if (user.name.match(new RegExp(key, 'i'))) matchedUsers.push(user);
    });
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

  const handleSubmit = async () => {
    if (title.trim().length == 0) {
      Toaster.error('Title cannot be empty');
      return;
    }

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Creating a new sub task');

    const URL = `${TASK_URL}/sub/${task.id}`;

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
      const subtask = res.data.task;
      if (setTasks)
        setTasks(prev =>
          prev.map(t => {
            if (t.id == task.id) return { ...t, subTasks: [...(t.subTasks || []), subtask] };
            else return t;
          })
        );
      if (setFilteredTasks)
        setFilteredTasks(prev =>
          prev.map(t => {
            if (t.id == task.id) return { ...t, subTasks: [...(t.subTasks || []), subtask] };
            else return t;
          })
        );

      setShow(false);
      Toaster.stopLoad(toaster, 'New Sub Task Added!', 1);
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
      <div className="fixed top-24 max-md:top-20 w-[640px] max-md:w-5/6 backdrop-blur-2xl bg-white dark:bg-[#ffe1fc22] flex flex-col gap-4 rounded-lg p-10 max-md:p-5 dark:text-white font-primary border-[1px] border-primary_btn  dark:border-dark_primary_btn right-1/2 translate-x-1/2 animate-fade_third z-50 max-md:z-[60]">
        <div className="text-3xl max-md:text-xl font-semibold">
          {status == 0 ? 'Sub Task Info' : status == 1 ? 'Select Users' : 'Review Sub Task Details'}
        </div>
        <div className="w-full h-[420px] flex flex-col gap-4">
          {status == 0 ? (
            <div className="w-full flex flex-col gap-4">
              <Input label="Sub Task Title" val={title} setVal={setTitle} maxLength={25} required={true} />
              <TextArea label="Sub Task Description" val={description} setVal={setDescription} maxLength={500} />
              <Tags label="Sub Task Tags" tags={tags} setTags={setTags} maxTags={5} />
              <Select
                label="Sub Task Priority"
                val={priority}
                setVal={setPriority}
                options={['low', 'medium', 'high']}
              />
              <Time
                label="Sub Task Deadline"
                val={deadline}
                setVal={setDeadline}
                onChange={el => {
                  var selectedDate = moment(el.target.value);
                  var currentDate = moment();
                  // var taskDeadline = moment(task.deadline);
                  if (selectedDate.isBefore(currentDate)) {
                    Toaster.error('Select a valid date');
                  }
                  // else if (selectedDate.isAfter(taskDeadline)) {
                  //   Toaster.error('Deadline cannot be after Task Deadline');
                  // }
                  else setDeadline(el.target.value);
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
            <PrimaryButton onClick={() => setStatus(1)} label="Next" animateIn={false} />
          ) : (
            <>
              <PrimaryButton onClick={() => setStatus(0)} label="Prev" animateIn={false} />
              <PrimaryButton onClick={handleSubmit} label="Submit" animateIn={false} />
            </>
          )}
        </div>
      </div>

      <div
        onClick={() => setShow(false)}
        className="bg-backdrop w-screen h-screen fixed top-0 left-0 animate-fade_third z-20 max-md:z-[51]"
      ></div>
    </>
  );
};

export default NewSubTask;
