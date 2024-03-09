import Loader from '@/components/common/loader';
import OrgSidebar from '@/components/common/org_sidebar';
import AccessTree from '@/components/organization/access_tree';
import TaskCard from '@/components/workspace/task_card';
import { ORG_SENIOR } from '@/config/constants';
import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import TaskView from '@/sections/organization/tasks/task_view';
import { currentOrgSelector } from '@/slices/orgSlice';
import { Task } from '@/types';
import { initialOrganization } from '@/types/initials';
import checkOrgAccess from '@/utils/funcs/check_org_access';
import Toaster from '@/utils/toaster';
import OrgMembersOnlyAndProtect from '@/utils/wrappers/org_members_only';
import WidthCheck from '@/utils/wrappers/widthCheck';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import { Info, Plus } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Mascot from '@/components/fillers/mascot';
import NewTask from '@/sections/tasks/new_task';

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState(initialOrganization);

  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [filterStatus, setFilterStatus] = useState(false);

  const [clickedOnTask, setClickedOnTask] = useState(false);
  const [clickedTaskID, setClickedTaskID] = useState(-1);

  const [clickedOnNewTask, setClickedOnNewTask] = useState(false);
  const [clickedOnInfo, setClickedOnInfo] = useState(false);

  const currentOrg = useSelector(currentOrgSelector);

  const getTasks = () => {
    const URL = `${ORG_URL}/${currentOrg.id}/tasks`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          const taskData = res.data.tasks || [];
          setOrganization(res.data.organization);
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
    getTasks();
  }, []);

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
    <BaseWrapper title={`Tasks | ${currentOrg.title}`}>
      <OrgSidebar index={4} />
      <MainWrapper>
        {clickedOnNewTask && (
          <NewTask
            setShow={setClickedOnNewTask}
            organization={organization}
            setTasks={setTasks}
            setFilteredTasks={setFilteredTasks}
            org={true}
          />
        )}
        {clickedOnInfo && <AccessTree type="task" setShow={setClickedOnInfo} />}
        <div className="w-full flex flex-col">
          <div className="w-full flex justify-between items-center p-base_padding">
            <div className="text-6xl font-semibold dark:text-white font-primary">Tasks</div>

            <div className="flex items-center gap-2">
              {checkOrgAccess(ORG_SENIOR) && (
                <Plus
                  onClick={() => setClickedOnNewTask(true)}
                  size={42}
                  className="flex-center rounded-full hover:bg-white p-2 transition-ease-300 cursor-pointer"
                  weight="regular"
                />
              )}
              <Info
                onClick={() => setClickedOnInfo(true)}
                size={42}
                className="flex-center rounded-full hover:bg-white p-2 transition-ease-300 cursor-pointer"
                weight="regular"
              />
            </div>
          </div>
          <div className="w-full flex flex-col gap-6 px-2 pb-2">
            {loading ? (
              <Loader />
            ) : filteredTasks.length > 0 ? (
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
                {clickedOnTask && (
                  <TaskView
                    taskID={clickedTaskID}
                    tasks={filteredTasks}
                    organization={organization}
                    setShow={setClickedOnTask}
                    setTasks={setTasks}
                    setFilteredTasks={setFilteredTasks}
                    setClickedTaskID={setClickedTaskID}
                  />
                )}
              </div>
            ) : (
              <Mascot message="There are no tasks available at the moment." />
            )}
          </div>
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default WidthCheck(OrgMembersOnlyAndProtect(Tasks));
