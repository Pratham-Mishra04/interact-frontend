import React, { useEffect, useState } from 'react';
import { PermissionConfig, Project, Task } from '@/types';
import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL, PROJECT_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import { Gavel } from '@phosphor-icons/react';
import moment from 'moment';
import Link from 'next/link';
import TasksLoader from '@/components/loaders/tasks';
import { checkProjectAccess } from '@/utils/funcs/access';
import { PROJECT_MANAGER } from '@/config/constants';
import PictureList from '@/components/common/picture_list';
import { SidePrimeWrapper } from '@/wrappers/side';
import NewTask from '../tasks/new_task';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import Image from 'next/image';
interface Props {
  project: Project;
  org?: boolean;
  permissionConfig?: PermissionConfig;
}

const Tasks = ({ project, org = false, permissionConfig }: Props) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const getTasks = () => {
    const URL = org
      ? `${ORG_URL}/${project.organizationID}/projects/tasks/${project.slug}?limit=5`
      : `${PROJECT_URL}/tasks/${project.slug}?limit=5`;
    getHandler(URL)
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

  useEffect(() => {
    getTasks();
  }, []);

  const user = useSelector(userSelector);
  <style>
    @import
    url('https://fonts.googleapis.com/css2?family=Birthstone&family=Birthstone+Bounce:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Outfit:wght@100..900&display=swap');
  </style>;
  return (
    <SidePrimeWrapper>
      {loading ? (
        <TasksLoader />
      ) : tasks.length == 0 ? (
        checkProjectAccess(user, 'manage_tasks', permissionConfig, project.id) ? (
          <>
            <div className="flex flex-row justify-between items-center">
              <span className="text-xl">Tasks</span>
              <NewTask
                org={false}
                project={project}
                setTasks={setTasks}
                trigger={
                  <div className="w-fit mx-auto text-md text-white font-medium bg-light_blue_button  cursor-pointer rounded-lg px-3 py-1">
                    Add Task
                  </div>
                }
              />
            </div>
            <Image
              src="/assets/new_task.svg"
              alt="new task"
              width={300}
              height={300}
              layout="fixed"
              className="mx-auto"
            />
            <div className="flex flex-col items-center mt-2 space-y-1">
              <div className="text-text_neutral text-md font-semibold font-['DM Sans']">
                No tasks Assigned Right now
              </div>
              <div className="text-white/70 text-4xl font-normal mangaka">Don’t Lack</div>
              <div className="text-center text-text_neutral text-md font-semibold">Behind</div>
            </div>
          </>
        ) : (
          <div className="text-lg max-md:text-base">
            <span className="text-2xl max-md:text-xl font-medium">Oops! </span>Looks like the task list is as empty as a
            library during summer break.
          </div>
        )
      ) : (
        tasks.map(task => (
          <Link
            href={`/${org ? 'organisation/projects' : 'workspace'}/tasks/${project.slug}?tid=${task.id}`}
            key={task.id}
            className="w-full flex justify-between items-center flex-wrap hover:scale-105 hover:bg-primary_comp dark:hover:bg-dark_primary_comp_hover rounded-lg p-2 transition-ease-300"
          >
            <div className="w-[calc(100%-112px)] flex flex-col gap-2">
              <div className="font-medium line-clamp-1">{task.title}</div>
              <PictureList users={task.users} gap={24} showAll size={5} />
            </div>
            <div
              className={`w-28 text-xs text-end ${
                moment(task.deadline).isBefore(moment()) ? 'text-primary_danger' : 'text-green-400'
              }`}
            >
              {moment(task.deadline).format('hh:mm A DD MMM')}
            </div>
          </Link>
        ))
      )}
    </SidePrimeWrapper>
  );
};

export default Tasks;
