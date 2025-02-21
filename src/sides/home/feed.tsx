import { EXPLORE_URL, USER_URL } from '@/config/routes';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import { ChartLineUp, Lock } from '@phosphor-icons/react';
import { SERVER_ERROR } from '@/config/errors';
import { Meeting, Project, Task, User } from '@/types';
import { userSelector } from '@/slices/userSlice';
import UserCard from '@/components/explore/user_card';
import { SidePrimeWrapper } from '@/wrappers/side';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SideLoader from '@/components/loaders/side';
import Tasks from './tasks';
import TaskCard from '@/components/home/task_card';
import MeetingCard from '@/components/home/meeting_card';

const FeedSide = () => {
  const [searches, setSearches] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meetingProject, setMeetingProject] = useState<(Project | undefined)[]>([]);
  const [loading, setLoading] = useState(true);

  const user = useSelector(userSelector);

  const fetchSearches = () => {
    const URL = `${EXPLORE_URL}/trending_searches`;
    getHandler(URL, undefined, true)
      .then(res => {
        if (res.statusCode === 200) {
          const searchData: string[] = res.data.searches || [];
          setSearches(searchData.splice(0, 10));
          setLoading(false);
        } else {
          if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
          else {
            Toaster.error(SERVER_ERROR, 'error_toaster');
          }
        }
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  const fetchProfiles = () => {
    const URL = `${EXPLORE_URL}/users?order=trending&limit=5`;
    getHandler(URL, undefined, true)
      .then(res => {
        if (res.statusCode === 200) {
          const profileData: User[] = res.data.users || [];
          setUsers(profileData.filter(u => u.id != user.id));
          setLoading(false);
        } else {
          if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
          else {
            Toaster.error(SERVER_ERROR, 'error_toaster');
          }
        }
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  const fetchTasks = () => {
    const URL = `${USER_URL}/me/tasks?limit=5&is_completed=false`;
    getHandler(URL, undefined, true)
      .then(res => {
        if (res.statusCode === 200) {
          setTasks(res.data.tasks || []);
          setLoading(false);
        } else {
          if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
          else {
            Toaster.error(SERVER_ERROR, 'error_toaster');
          }
        }
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  const fetchMeetings = () => {
    const URL = `${USER_URL}/me/meetings?limit=5`;
    getHandler(URL, undefined, true)
      .then(res => {
        if (res.statusCode === 200) {
          setMeetings(res.data.meetings || []);
          setMeetingProject(res.data.projects || []);
          setLoading(false);
        } else {
          if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
          else {
            Toaster.error(SERVER_ERROR, 'error_toaster');
          }
        }
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  useEffect(() => {
    fetchProfiles();
    fetchSearches();

    if (user.id) {
      fetchTasks();
      fetchMeetings();
    }
  }, []);

  return loading ? (
    <>
      <SideLoader boxes={3} />
      <SideLoader boxes={1} />
      <SideLoader boxes={5} />
    </>
  ) : (
    <>
      {meetings && meetings.length > 0 && (
        <SidePrimeWrapper title="Upcoming Meetings">
          <div className="w-full flex flex-col gap-1">
            {meetings.map((meeting, index) => (
              <MeetingCard key={index} meeting={meeting} meetingProject={meetingProject[index]} />
            ))}
          </div>
        </SidePrimeWrapper>
      )}
      {tasks && tasks.length > 0 && (
        <SidePrimeWrapper>
          <div className="w-full flex items-center justify-between">
            <div className="w-fit text-2xl font-bold text-gradient">Pending Tasks</div>
            <Tasks />
          </div>

          <div className="w-full flex flex-col gap-1">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </SidePrimeWrapper>
      )}
      {searches && searches.length > 0 && (
        <SidePrimeWrapper title="Trending Now">
          <div className="w-full gap-2 mt-2 flex flex-wrap">
            {searches.map((str, i) => {
              return (
                <DropdownMenu key={i}>
                  <DropdownMenuTrigger>
                    <div className="w-fit flex items-center gap-2 bg-slate-100 dark:bg-dark_primary_comp_hover rounded-lg px-4 py-1 hover:scale-105 transition-ease-300">
                      <div>{str}</div>
                      {i < 3 && <ChartLineUp />}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel className="w-full text-center">Search For</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {['user', 'project', 'opening', 'event', 'organisation'].map((type, i) => (
                      <Link
                        className="px-2 hover:underline underline-offset-2 text-sm font-medium"
                        key={i}
                        href={`/${type}s?search=${str}`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Link>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
          </div>
        </SidePrimeWrapper>
      )}
      {users && users.length > 0 && (
        <SidePrimeWrapper stickTop>
          <div className="w-full flex items-center justify-between">
            <div className="w-fit text-2xl font-bold text-gradient">Profiles to Follow</div>
            <Link
              href="/users"
              className="w-fit text-xs font-medium hover-underline-animation after:bg-gray-700 dark:after:bg-white"
            >
              view all
            </Link>
          </div>
          {user.id == '' && (
            <div className="w-full h-[calc(100%-48px)] flex-center flex-col gap-1 absolute top-12 right-0 backdrop-blur-sm rounded-lg z-10">
              <div className="bg-white dark:bg-dark_primary_comp flex-center gap-1 border-primary_black border-[1px] rounded-lg px-2 py-1">
                <Lock /> Locked
              </div>
              <Link
                href={'/login'}
                className="font-medium hover-underline-animation after:bg-black dark:after:bg-white"
              >
                Sign up to see who&apos;s here
              </Link>
            </div>
          )}

          <div className="w-full flex flex-col gap-2">
            {users.map(user => (
              <UserCard key={user.id} user={user} forTrending />
            ))}
          </div>
        </SidePrimeWrapper>
      )}
    </>
  );
};

export default FeedSide;
