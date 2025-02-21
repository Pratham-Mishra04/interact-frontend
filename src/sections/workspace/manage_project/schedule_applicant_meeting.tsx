import { Application, Meeting } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import { SERVER_ERROR } from '@/config/errors';
import { useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PencilSimple } from '@phosphor-icons/react';
import Checkbox from '@/components/form/checkbox';
import TextArea from '@/components/form/textarea';
import { APPLICATION_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import postHandler from '@/handlers/post_handler';
import { User } from '@/types';
import Image from 'next/image';
import { MagnifyingGlass } from '@phosphor-icons/react';
import moment from 'moment';
import PrimaryButton from '@/components/buttons/primary_btn';
import Input from '@/components/form/input';
import Time from '@/components/form/time';
import getHandler from '@/handlers/get_handler';
import Loader from '@/components/common/loader';
import { userIDSelector } from '@/slices/userSlice';
import { initialMeeting } from '@/types/initials';
import { getFormattedTime, getInputFieldFormatTime } from '@/utils/funcs/time';

interface Props {
  application: Application;
  setApplicationMeeting: React.Dispatch<React.SetStateAction<Meeting>>;
}

const ScheduleApplicantMeeting = ({ application, setApplicationMeeting }: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState(getInputFieldFormatTime(new Date()));
  const [endTime, setEndTime] = useState(getInputFieldFormatTime(new Date()));
  const [isOpenForMembers, setIsOpenForMembers] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');

  const [status, setStatus] = useState(0);
  const [mutex, setMutex] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const [meeting, setMeeting] = useState(initialMeeting);

  const userID = useSelector(userIDSelector);

  const fetchUsers = async (search: string, abortController?: AbortController) => {
    setLoading(true);
    const URL = `${APPLICATION_URL}/meeting/non-participants/${
      application.id
    }?search=${search}&limit=${10}&isOpenForMembers=${isOpenForMembers}&allowExternalParticipants=true&meetingID=${
      meeting.id
    }`;

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
  };

  const handleClickUser = (user: User) => {
    if (selectedUsers.map(user => user.id).includes(user.id)) {
      setSelectedUsers(prev => prev.filter(u => u.id != user.id));
    } else {
      setSelectedUsers(prev => [...prev, user]);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    if (meeting.id) fetchUsers(search, abortController);

    return () => {
      abortController.abort();
    };
  }, [search]);

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

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Creating a new meeting');

    const URL = `${APPLICATION_URL}/meeting/${application.id}`;

    const formData = {
      title,
      description,
      startTime: getFormattedTime(startTime),
      endTime: getFormattedTime(endTime),
      isOpenForMembers,
    };

    const res = await postHandler(URL, formData);
    if (res.statusCode === 201) {
      setApplicationMeeting(res.data.meeting);
      setMeeting(res.data.meeting);
      if (isOpenForMembers) setIsDialogOpen(false);
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

    const URL = `${APPLICATION_URL}/meeting/participants/${application.id}`;

    const formData = {
      userIDs: selectedUsers.map(u => u.id),
    };

    const res = await postHandler(URL, formData);
    if (res.statusCode === 200) {
      setIsDialogOpen(false);
      Toaster.stopLoad(toaster, 'Participants Added!', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={val => setIsDialogOpen(val)}>
      <DialogTrigger>
        <PencilSimple className="cursor-pointer" size={20} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md min-w-[40%]">
        <DialogHeader>
          <DialogTitle>{status == 0 ? 'Meeting Details' : status == 1 ? 'Select Users' : 'Review Details'}</DialogTitle>
        </DialogHeader>
        <div className="w-full flex flex-col gap-4">
          {status == 0 ? (
            <div className="w-full flex flex-col gap-4">
              <Input label="Meeting Title" val={title} setVal={setTitle} maxLength={50} required={true} />
              <TextArea label="Meeting Description" val={description} setVal={setDescription} maxLength={500} />
              <Checkbox
                label="Is the Meeting Open for all Members?"
                val={isOpenForMembers}
                setVal={setIsOpenForMembers}
              />
              <div className="w-full flex max-md:flex-col justify-between gap-4">
                <div className="w-1/2 max-md:w-full">
                  <Time label="Start Time" val={startTime} setVal={setStartTime} required={true} includeDate />
                </div>
                <div className="w-1/2 max-md:w-full">
                  <Time label="Expected End Time" val={endTime} setVal={setEndTime} required={true} includeDate />
                </div>
              </div>
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
                  users.map(user => {
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
                  })
                )}
              </div>
            </>
          )}
        </div>
        <div className="w-full flex justify-end">
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
        {/* <Button onClick={handleSubmit} variant="outline">Edit Opening</Button> */}
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleApplicantMeeting;
