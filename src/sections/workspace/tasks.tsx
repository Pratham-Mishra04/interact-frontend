import React, { useEffect, useState } from 'react';
import { Project, Task } from '@/types';
import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL, PROJECT_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import Gavel from '@phosphor-icons/react/dist/icons/Gavel';
import { userSelector } from '@/slices/userSlice';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { Share, Users } from '@phosphor-icons/react';
import Link from 'next/link';
import TasksLoader from '@/components/loaders/tasks';
import { currentOrgIDSelector } from '@/slices/orgSlice';

interface Props {
  project: Project;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedOnNewTask: React.Dispatch<React.SetStateAction<boolean>>;
  org?: boolean;
}

const Tasks = ({ project, setShow, setClickedOnNewTask, org = false }: Props) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const currentOrgID = useSelector(currentOrgIDSelector);

  const getTasks = () => {
    const URL = org
      ? `${ORG_URL}/${currentOrgID}/projects/tasks/${project.slug}`
      : `${PROJECT_URL}/tasks/${project.slug}`;
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

  const userInTask = (userID: string, task: Task) => {
    var check = false;
    task.users.forEach(user => {
      if (user.id == userID) {
        check = true;
        return;
      }
    });
    return check;
  };

  return (
    <>
      <div className="w-1/3 max-lg:w-5/6 max-h-[640px] overflow-y-auto fixed bg-white text-gray-800 z-30 translate-x-1/2 -translate-y-1/4 top-64 max-lg:top-1/4 max-md:top-56 right-1/2 flex flex-col p-8 max-md:px-4 max-md:py-8 gap-6 border-[1px] border-gray-600 shadow-xl dark:border-dark_primary_btn rounded-xl animate-fade_third">
        <div className="text-4xl max-md:text-5xl font-semibold flex gap-2 items-center">
          <Gavel className="max-md:hidden" size={40} weight="duotone" />
          <div className="grow flex justify-between items-center">
            Recent Tasks
            <Link href={`/${org ? 'organisation/projects' : 'workspace'}/tasks/${project.slug}`} target="_blank">
              <Share className="cursor-pointer" size={36} weight="duotone" />
            </Link>
          </div>
        </div>
        {loading ? (
          <TasksLoader />
        ) : (
          <>
            {tasks.length == 0 ? (
              <>
                {project.userID == user.id || user.managerProjects.includes(project.id) ? (
                  <>
                    <div className="text-lg max-md:text-base">
                      <span className="text-2xl max-md:text-xl text-gradient font-semibold">Empty Here! </span>The to-do
                      list 📝 is your canvas, time to paint it with tasks and turn this project into a masterpiece!
                    </div>
                    <div
                      onClick={() => {
                        setClickedOnNewTask(true);
                        setShow(false);
                      }}
                      className="mx-auto text-xl text-gradient font-medium hover-underline-animation after:bg-dark_primary_btn cursor-pointer"
                    >
                      Add a Task
                    </div>
                  </>
                ) : (
                  <div className="text-lg max-md:text-base">
                    <span className="text-2xl max-md:text-xl font-medium">Oops! </span>Looks like the task list is as
                    empty as a library during summer break.
                  </div>
                )}
              </>
            ) : (
              <>
                {tasks.slice(0, 4).map(task => {
                  return (
                    <Link
                      href={`/${org ? 'organisation/projects' : 'workspace'}/tasks/${project.slug}`}
                      key={task.id}
                      className="relative"
                    >
                      {userInTask(user.id, task) ? (
                        <div className="absolute right-2 top-0 -translate-y-1/2 text-xs bg-primary_comp_hover backdrop-blur-sm rounded-lg py-1 px-2">
                          assigned to you
                        </div>
                      ) : (
                        <></>
                      )}
                      <div className="w-full flex flex-col gap-2 rounded-lg p-4 border-gray-800 border-dotted border-2">
                        <div className="w-full flex justify-between items-center">
                          <div className="font-semibold text-xl">{task.title}</div>
                          <div className="flex items-center gap-2">
                            <Users size={32} weight="duotone" />
                            <div>{task.users.length}</div>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600">{task.description}</div>
                        <div className="flex gap-2 text-sm">
                          <div>Deadline: </div>
                          <div> {moment(task.deadline).format('DD-MMM-YY')}</div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </>
            )}
          </>
        )}
      </div>
      <div
        onClick={() => setShow(false)}
        className=" bg-backdrop w-screen h-screen backdrop-blur-sm fixed top-0 right-0 animate-fade_third z-20"
      ></div>
    </>
  );
};

export default Tasks;
