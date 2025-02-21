import React, { useEffect, useState } from 'react';
import { Project, Task } from '@/types';
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

interface Props {
  project: Project;
  org?: boolean;
}

const Tasks = ({ project, org = false }: Props) => {
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

  return (
    <SidePrimeWrapper>
      <div className="flex gap-2 items-center">
        <Gavel className="max-md:hidden" size={24} weight="duotone" />
        <div className="grow flex justify-between items-center text-lg font-medium">
          Tasks
          {tasks.length > 0 && (
            <Link href={`/${org ? 'organisation/projects' : 'workspace'}/tasks/${project.slug}`}>
              <div className="text-xs hover:underline underline-offset-2 cursor-pointer">view all</div>
            </Link>
          )}
        </div>
      </div>
      {loading ? (
        <TasksLoader />
      ) : tasks.length == 0 ? (
        checkProjectAccess(user, PROJECT_MANAGER, project.id) ? (
          <>
            <div className="text-center my-2">
              <span className="text-xl text-gradient font-semibold">Empty Here! </span>The to-do list 📝 is your canvas,
              time to paint it with tasks and turn this project into a masterpiece!
            </div>
            <NewTask
              org={false}
              project={project}
              setTasks={setTasks}
              trigger={
                <div className="w-fit mx-auto text-xl text-gradient font-medium hover-underline-animation after:bg-dark_primary_btn cursor-pointer">
                  Add a Task
                </div>
              }
            />
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
