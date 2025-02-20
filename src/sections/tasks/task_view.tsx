import { SubTask, Task } from '@/types';
import { ArrowArcLeft, Gear, Trash, PlusCircle } from '@phosphor-icons/react';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import ToolTip from '@/components/utils/tooltip';
import {
  getPRStatusColor,
  getTaskDeadlineColor,
  getTaskPriorityColor,
  getTaskDifficultyColor,
} from '@/utils/funcs/task';
import UsersList from '@/components/common/users_list';
import PictureList from '@/components/common/picture_list';
import Tags from '@/components/common/tags';
import SubTasksTable from '@/components/tables/subtasks';
import CommentBox from '@/components/comment/comment_box';
import renderContentWithLinks from '@/utils/funcs/render_content_with_links';
import CopyClipboardButton from '@/components/buttons/copy_clipboard_btn';
import TaskHistories from './history';
import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import { navbarOpenSelector } from '@/slices/feedSlice';

interface Props {
  task: Task;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedTaskID?: React.Dispatch<React.SetStateAction<number>>;
  setClickedOnEditTask: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedOnDeleteTask: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedOnNewSubTask: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedSubTask: React.Dispatch<React.SetStateAction<SubTask>>;
  setClickedOnViewSubTask: React.Dispatch<React.SetStateAction<boolean>>;
  toggleComplete: () => void;
  accessChecker: boolean;
  userFetchURL?: string;
}

const TaskComponent = ({
  task,
  setShow,
  setClickedTaskID,
  setClickedOnEditTask,
  setClickedOnDeleteTask,
  setClickedOnNewSubTask,
  setClickedSubTask,
  setClickedOnViewSubTask,
  toggleComplete,
  accessChecker,
  userFetchURL,
}: Props) => {
  const isAssignedUser = (userID: string) => {
    var check = false;
    task.users.forEach(user => {
      if (user.id == userID) {
        check = true;
        return;
      }
    });
    return check;
  };

  const [clickedOnUsers, setClickedOnUsers] = useState(false);
  const [noComments, setNoComments] = useState(task.noComments);

  const user = useSelector(userSelector);

  useEffect(() => {
    document.documentElement.style.overflowY = 'hidden';
    document.documentElement.style.height = '100vh';

    return () => {
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.height = 'auto';
    };
  }, []);

  const isOpen = useSelector(navbarOpenSelector);

  return (
    <>
      {clickedOnUsers && <UsersList title="Task Users" users={task.users} setShow={setClickedOnUsers} />}
      <div
        className={`${
          isOpen ? 'w-no_side_base_open' : 'w-no_side_base_close'
        } max-md:w-screen h-base fixed bg-gray-50 dark:bg-dark_primary_comp border-white border-t-[1px] border-l-[1px] top-navbar overflow-y-auto flex flex-col gap-4 p-8 pt-4 max-md:px-4 font-primary animate-fade_third z-10 max-md:z-20`}
      >
        <div className="w-full flex flex-col gap-2">
          <ArrowArcLeft
            className="cursor-pointer"
            size={24}
            onClick={() => {
              if (setClickedTaskID) setClickedTaskID(-1);
              setShow(false);
            }}
          />
          <div className="w-full flex max-md:flex-col gap-4 justify-between items-center">
            <div className="flex-center gap-2">
              <div className="w-fit flex-center text-4xl font-semibold">
                {task.prID && `${task.prID}: `}
                {task.title}
              </div>
              <div className="relative group">
                <ToolTip
                  content="Copy Task Link"
                  styles={{
                    fontSize: '10px',
                    padding: '2px',
                    width: '120px',
                    top: '-60%',
                    left: '50%',
                    translate: '-50% 0',
                    border: 'none',
                  }}
                />
                <CopyClipboardButton
                  url={
                    task.organizationID != ''
                      ? `organisations?oid=${task.organizationID}&redirect_url=/tasks?tid=${task.id}`
                      : `workspace/tasks/${task.project?.title}?tid=${task.id}`
                  }
                  iconOnly={true}
                  size={28}
                />
              </div>
            </div>
            <div className="max-md:w-full max-md:justify-between flex-center gap-2">
              {accessChecker && (
                <div className="flex-center gap-2">
                  <Gear onClick={() => setClickedOnEditTask(true)} className="cursor-pointer" size={32} />
                  <Trash onClick={() => setClickedOnDeleteTask(true)} className="cursor-pointer" size={32} />
                </div>
              )}
              {(isAssignedUser(user.id) || accessChecker) && (
                <div
                  className={`${
                    task.isCompleted
                      ? 'bg-priority_low hover:bg-priority_high'
                      : 'bg-primary_comp hover:bg-priority_low'
                  } font-semibold px-4 py-2 rounded-md transition-ease-300`}
                >
                  {task.isCompleted ? (
                    <span onClick={toggleComplete} className="relative group cursor-pointer">
                      <ToolTip content="Mark Incomplete" />
                      <div className="font-semibold">Completed</div>
                    </span>
                  ) : (
                    <div onClick={toggleComplete} className="cursor-pointer">
                      Mark Completed
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col gap-4">
          <div>{renderContentWithLinks(task.description)}</div>
          <Tags tags={task.tags} displayAll={true} />
        </div>
        <div className="w-fit flex-center max-md:flex-col gap-16 max-md:text-sm">
          <div className="flex gap-2 items-center">
            <div>Priority:</div>
            <div
              style={{ backgroundColor: getTaskPriorityColor(task) }}
              className="uppercase px-3 py-1 rounded-lg text-sm font-medium dark:text-primary_black"
            >
              {task.priority}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div>Difficulty:</div>
            <div
              style={{ backgroundColor: getTaskDifficultyColor(task) }}
              className="uppercase px-3 py-1 rounded-lg text-sm font-medium dark:text-primary_black"
            >
              {task.difficulty}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div>Deadline:</div>
            <div
              style={{ backgroundColor: getTaskDeadlineColor(task) }}
              className="w-fit px-3 py-1 rounded-lg text-sm font-medium dark:text-primary_black"
            >
              <div className="font-semibold">{moment(task.deadline).format('DD-MMM-YY')}</div>
            </div>
            <div className="text-xs max-md:hidden">({moment(task.deadline).fromNow()})</div>
          </div>
        </div>

        {task.users.length > 0 ? (
          <div onClick={() => setClickedOnUsers(true)} className="w-fit h-fit flex-center gap-2 cursor-pointer">
            <div className="text-xl font-medium">Assigned To: </div>
            <PictureList users={task.users} size={8} gap={2} />
          </div>
        ) : (
          accessChecker && (
            <div
              onClick={() => setClickedOnEditTask(true)}
              className="w-full text-base bg-gray-100 dark:bg-dark_primary_comp_hover rounded-xl p-4 cursor-pointer transition-ease-300"
            >
              <span className="text-xl max-lg:text-lg text-gradient font-semibold">Your task is lonely! </span> and
              looking for a buddy. Don&apos;t leave it hanging, assign it to a team member and let the magic begin! 🚀
            </div>
          )
        )}

        <div className="w-full border-[#34343479] border-t-[1px] my-2"></div>

        {task.subTasks?.length > 0 ? (
          <div className="w-full flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <div className="text-xl font-medium">Subtasks</div>
              {(isAssignedUser(user.id) || accessChecker) && (
                <PlusCircle
                  onClick={() => setClickedOnNewSubTask(true)}
                  className="bg-gray-50 dark:bg-dark_primary_comp rounded-full cursor-pointer"
                  size={24}
                  weight="bold"
                />
              )}
            </div>
            <SubTasksTable
              subtasks={task.subTasks}
              setClickedOnTask={setClickedOnViewSubTask}
              setClickedSubTask={setClickedSubTask}
            />
          </div>
        ) : (
          (isAssignedUser(user.id) || accessChecker) && (
            <div
              onClick={() => setClickedOnNewSubTask(true)}
              className="w-full text-base bg-gray-100 dark:bg-dark_primary_comp_hover rounded-xl p-4 cursor-pointer transition-ease-300"
            >
              <span className="text-xl max-lg:text-lg text-gradient font-semibold">Divide and conquer! </span> Big tasks
              can be daunting! Break them down into bite-sized subtasks for smoother sailing. 📋
            </div>
          )
        )}
        {task.histories && task.histories.length > 0 && (
          <div className="w-full flex flex-col gap-2 mt-4">
            <div className="text-xl font-medium">Activity</div>
            <TaskHistories histories={task.histories} />
          </div>
        )}
        {task.prLink && (
          <div className="w-full h-full flex flex-col gap-2 mt-4">
            <div className="w-fit flex-center gap-2">
              Pull Request Status:{' '}
              <div
                style={{ backgroundColor: getPRStatusColor(task) }}
                className="text-sm font-medium px-2 py-1 rounded-lg"
              >
                {task.prStatus == 0
                  ? 'Created'
                  : task.prStatus == 1
                  ? 'Review Requested'
                  : task.prStatus == 2
                  ? 'Closed'
                  : 'Merged'}
              </div>
            </div>

            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5">
              <div
                style={{ width: `${((task.prStatus + 1) / 4) * 100}% ` }}
                className="bg-blue-600 h-2.5 rounded-full"
              ></div>
            </div>
            <Link
              href={task.prLink}
              target="_blank"
              // onClick={handleSubmit}
              className="w-full group flex justify-center items-center gap-2 hover:gap-4 group-hover:before:duration-500 group-hover:after:duration-500 after:duration-500 hover:border-neutral-900 duration-500 hover:duration-500 underline underline-offset-2 hover:underline hover:underline-offset-4 origin-left hover:decoration-2 hover:text-neutral-300 relative bg-neutral-900 px-10 py-3 border text-left p-3 text-gray-50 text-base font-bold rounded-lg overflow-hidden after:absolute after:z-10 after:w-12 after:h-12 after:content[''] after:bg-sky-900 after:-left-8 after:top-8 after:rounded-full after:blur-lg hover:after:animate-pulse"
            >
              <div className="flex-center gap-2">
                <svg
                  className="w-6 h-6 fill-neutral-50"
                  height="100"
                  preserveAspectRatio="xMidYMid meet"
                  viewBox="0 0 100 100"
                  width="100"
                  x="0"
                  xmlns="http://www.w3.org/2000/svg"
                  y="0"
                >
                  <path
                    className="svg-fill-primary"
                    d="M50,1.23A50,50,0,0,0,34.2,98.68c2.5.46,3.41-1.09,3.41-2.41s0-4.33-.07-8.5c-13.91,3-16.84-6.71-16.84-6.71-2.28-5.77-5.55-7.31-5.55-7.31-4.54-3.1.34-3,.34-3,5,.35,7.66,5.15,7.66,5.15C27.61,83.5,34.85,81.3,37.7,80a10.72,10.72,0,0,1,3.17-6.69C29.77,72.07,18.1,67.78,18.1,48.62A19.34,19.34,0,0,1,23.25,35.2c-.52-1.26-2.23-6.34.49-13.23,0,0,4.19-1.34,13.75,5.13a47.18,47.18,0,0,1,25,0C72.07,20.63,76.26,22,76.26,22c2.72,6.89,1,12,.49,13.23a19.28,19.28,0,0,1,5.14,13.42c0,19.21-11.69,23.44-22.83,24.67,1.8,1.55,3.4,4.6,3.4,9.26,0,6.69-.06,12.08-.06,13.72,0,1.34.9,2.89,3.44,2.4A50,50,0,0,0,50,1.23Z"
                  ></path>
                </svg>
                Checkout the Pull Request
              </div>
              <ArrowUpRight size={20} weight="bold" />
            </Link>
          </div>
        )}
        <div className="mt-4">
          <div className="text-xl font-medium">Conversations ({noComments})</div>
          <CommentBox type="task" item={task} userFetchURL={userFetchURL} setNoComments={setNoComments} />
        </div>
      </div>
    </>
  );
};

export default TaskComponent;
