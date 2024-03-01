import Loader from '@/components/common/loader';
import TaskCard from '@/components/workspace/task_card';
import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL, PROJECT_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import NewTask from '@/sections/tasks/new_task';
import TaskView from '@/sections/workspace/task_view';
import { userSelector } from '@/slices/userSlice';
import { Project, Task } from '@/types';
import { initialProject } from '@/types/initials';
import Protect from '@/utils/wrappers/protect';
import Toaster from '@/utils/toaster';
import WidthCheck from '@/utils/wrappers/widthCheck';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import { GetServerSidePropsContext } from 'next';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import OrgSidebar from '@/components/common/org_sidebar';
import checkOrgAccess from '@/utils/funcs/check_org_access';
import { ORG_SENIOR } from '@/config/constants';
import OrgMembersOnlyAndProtect from '@/utils/wrappers/org_members_only';

interface Props {
  slug: string;
}

const Tasks = ({ slug }: Props) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [project, setProject] = useState<Project>(initialProject);
  const [loading, setLoading] = useState(true);

  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [filterStatus, setFilterStatus] = useState(false);

  const [clickedOnTask, setClickedOnTask] = useState(false);
  const [clickedTaskID, setClickedTaskID] = useState(-1);

  const [clickedOnNewTask, setClickedOnNewTask] = useState(false);

  const user = useSelector(userSelector);

  const currentOrgID = useSelector(currentOrgIDSelector);

  const getProject = () => {
    const URL = `${ORG_URL}/${currentOrgID}/projects/${slug}`;

    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          setProject(res.data.project);
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

  const getTasks = () => {
    const URL = user.managerProjects.includes(project.id)
      ? `${PROJECT_URL}/tasks/populated/${slug}`
      : `${ORG_URL}/${currentOrgID}/projects/tasks/populated/${slug}`;

    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          const taskData = res.data.tasks || [];
          setTasks(taskData);
          setFilteredTasks(taskData);
          const tid = new URLSearchParams(window.location.search).get('tid');
          if (tid && tid != '') {
            taskData.forEach((task: Task, i: number) => {
              if (tid == task.id) {
                setClickedTaskID(i);
                setClickedOnTask(true);
              }
            });
          }

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
    getProject();
  }, [slug]);

  useEffect(() => {
    if (!checkOrgAccess(ORG_SENIOR) && !user.managerProjects.includes(project.id)) window.history.back();
    getTasks();
  }, [project]);

  const filterAssigned = (status: boolean) => {
    setFilterStatus(status);
    if (status) {
      const assignedTasks: Task[] = [];
      tasks.forEach(task => {
        var check = false;
        task.users.forEach(user => {
          if (user.id == user.id) {
            check = true;
            return;
          }
        });
        if (check) {
          assignedTasks.push(task);
        }
      });
      setFilteredTasks(assignedTasks);
    } else setFilteredTasks(tasks);
  };

  return (
    <BaseWrapper title="Tasks">
      <OrgSidebar index={3} />

      <MainWrapper>
        {clickedOnNewTask ? (
          <NewTask
            setShow={setClickedOnNewTask}
            project={project}
            setTasks={setTasks}
            setFilteredTasks={setFilteredTasks}
          />
        ) : (
          <></>
        )}
        <div className="w-full flex flex-col">
          <div className="w-full flex justify-between p-base_padding">
            <div className="flex gap-3">
              {/* <ArrowArcLeft
            onClick={() => router.back()}
            className="w-10 h-10 p-2 dark:bg-dark_primary_comp_hover rounded-full cursor-pointer"
            size={40}
          /> */}
              <div className="text-6xl font-semibold dark:text-white font-primary">Tasks</div>
            </div>
            <div className="flex gap-8 items-center">
              {project.userID == user.id || user.managerProjects.includes(project.id) ? (
                <div
                  onClick={() => setClickedOnNewTask(true)}
                  className="text-xl text-gradient font-semibold hover-underline-animation after:bg-dark_primary_btn cursor-pointer"
                >
                  <span className="max-md:hidden">Create a</span> New Task
                </div>
              ) : (
                <></>
              )}
              {/* <div onClick={() => filterAssigned(!filterStatus)} className="">
                Show Assigned To Me
              </div> */}
            </div>
          </div>
          <div className="w-full flex flex-col gap-6 px-2 py-2">
            {loading ? (
              <Loader />
            ) : (
              <>
                {filteredTasks.length > 0 ? (
                  <div className="flex justify-evenly px-4">
                    <div className={`${clickedOnTask ? 'w-[40%]' : 'w-[720px]'} max-lg:w-[720px] flex flex-col gap-4`}>
                      {filteredTasks.map((task, i) => {
                        return (
                          <TaskCard
                            key={task.id}
                            task={task}
                            index={i}
                            clickedTaskID={clickedTaskID}
                            clickedOnTask={clickedOnTask}
                            setClickedOnTask={setClickedOnTask}
                            setClickedTaskID={setClickedTaskID}
                          />
                        );
                      })}
                    </div>
                    {clickedOnTask ? (
                      <TaskView
                        taskID={clickedTaskID}
                        tasks={filteredTasks}
                        project={project}
                        setShow={setClickedOnTask}
                        setTasks={setTasks}
                        setFilteredTasks={setFilteredTasks}
                        setClickedTaskID={setClickedTaskID}
                      />
                    ) : (
                      <></>
                    )}
                  </div>
                ) : (
                  <div className="mx-auto font-medium text-xl mt-8">No Tasks found :)</div>
                )}
              </>
            )}
          </div>
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default WidthCheck(OrgMembersOnlyAndProtect(Tasks));

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { slug, org } = context.query;

  return {
    props: { slug },
  };
}
