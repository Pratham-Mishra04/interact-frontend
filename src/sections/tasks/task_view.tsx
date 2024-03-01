import { USER_PROFILE_PIC_URL } from '@/config/routes';
import { SubTask, Task } from '@/types';
import {
  CheckSquare,
  CalendarX,
  ArrowArcLeft,
  Gear,
  Trash,
  PlusCircle,
  CheckCircle,
  Circle,
  XCircle,
} from '@phosphor-icons/react';
import moment from 'moment';
import React from 'react';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';

interface Props {
  task: Task;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
  setFilteredTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
  setClickedTaskID?: React.Dispatch<React.SetStateAction<number>>;
  setClickedOnEditTask: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedOnDeleteTask: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedOnNewSubTask: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedSubTask: React.Dispatch<React.SetStateAction<SubTask>>;
  setClickedOnViewSubTask: React.Dispatch<React.SetStateAction<boolean>>;
  toggleComplete: () => void;
  accessChecker: boolean;
}

const Task = ({
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

  const user = useSelector(userSelector);
  return (
    <>
      {task.isCompleted ? (
        <div className="absolute flex gap-1 items-center px-2 py-1 rounded-xl text-xs bg-[#bffbbe] max-lg:fixed top-[160px] max-lg:top-navbar right-16 max-lg:right-0 z-[11]">
          Task Completed
          <CheckSquare weight="bold" size={16} />
        </div>
      ) : (
        moment(task.deadline).isBefore(moment()) && (
          <div className="absolute flex gap-1 items-center px-2 py-1 rounded-xl text-xs bg-[#fbbebe] max-lg:fixed top-[160px] max-lg:top-navbar right-16 max-lg:right-0 z-[11]">
            Deadline Passed
            <CalendarX weight="bold" size={16} />
          </div>
        )
      )}

      <div className="sticky bg-white max-lg:fixed top-[158px] max-lg:top-navbar max-lg:right-0 w-[640px] max-lg:w-full max-h-[75vh] max-lg:max-h-screen max-lg:h-base max-lg:z-50 max-lg:backdrop-blur-2xl max-lg:backdrop-brightness-90 overflow-y-auto flex flex-col gap-8 p-8 pt-4 font-primary dark:text-white border-[1px] max-lg:border-0 border-primary_btn  dark:border-dark_primary_btn rounded-lg max-lg:rounded-none max-lg:animate-fade_third z-10">
        <div className="w-full flex flex-col gap-2">
          <ArrowArcLeft
            className="cursor-pointer"
            size={24}
            onClick={() => {
              if (setClickedTaskID) setClickedTaskID(-1);
              setShow(false);
            }}
          />
          <div className="w-full flex justify-between items-center">
            <div className="text-4xl font-semibold">{task.title}</div>
            {accessChecker && (
              <div className="flex gap-2">
                <Gear onClick={() => setClickedOnEditTask(true)} className="cursor-pointer" size={32} />
                <Trash onClick={() => setClickedOnDeleteTask(true)} className="cursor-pointer" size={32} />
              </div>
            )}
          </div>
        </div>
        <div className="w-full flex flex-col gap-4">
          <div className="text-lg">{task.description}</div>
          <div className="w-full flex flex-wrap gap-2">
            {task.tags.map(tag => {
              return (
                <div key={tag} className="text-xs border-black border-[1px] px-2 py-1 rounded-lg">
                  {tag}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <div>Deadline:</div>
          <div className="font-semibold">{moment(task.deadline).format('DD-MMM-YY')}</div>
          <div className="text-xs">({moment(task.deadline).fromNow()})</div>
        </div>
        <div className="flex gap-2 items-center">
          <div> Priority:</div>
          <div
            style={{
              backgroundColor: task.priority == 'high' ? '#fbbebe' : task.priority == 'medium' ? '#fbf9be' : '#bffbbe',
            }}
            className="uppercase px-3 py-1 rounded-lg text-sm font-medium"
          >
            {task.priority}
          </div>
        </div>
        {task.users.length > 0 ? (
          <div className="w-full flex flex-col gap-2">
            <div className="text-xl font-medium">Assigned To</div>
            <div className="w-full flex flex-wrap justify-around gap-2">
              {task.users.map(user => {
                return (
                  <div
                    key={user.id}
                    className="w-[45%] max-lg:w-[48%] max-md:w-full flex gap-4 border-[1px] border-gray-900 rounded-lg p-2"
                  >
                    <Image
                      crossOrigin="anonymous"
                      width={50}
                      height={50}
                      alt={'User Pic'}
                      src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
                      className={'rounded-full w-12 h-12'}
                    />
                    <div className="grow">
                      <div className="text-xl font-medium">{user.name}</div>
                      <div className="text-xs text-gray-600">@{user.username}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          accessChecker && (
            <div
              onClick={() => setClickedOnEditTask(true)}
              className="w-full text-base bg-gray-100 rounded-xl p-4 hover:scale-105 cursor-pointer transition-ease-300"
            >
              <span className="text-xl max-lg:text-lg text-gradient font-semibold">Your task is lonely! </span> and
              looking for a buddy. Don&apos;t leave it hanging, assign it to a team member and let the magic begin! 🚀
            </div>
          )
        )}

        {task.subTasks?.length > 0 ? (
          <div className="w-full flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <div className="text-xl font-medium">Subtasks</div>
              {isAssignedUser(user.id) && !task.isCompleted && (
                <PlusCircle
                  onClick={() => setClickedOnNewSubTask(true)}
                  className="bg-gray-50 rounded-full cursor-pointer"
                  size={24}
                  weight="bold"
                />
              )}
            </div>
            <div className="w-full flex flex-col gap-1">
              {task.subTasks.map(subtask => {
                return (
                  <div
                    key={subtask.id}
                    onClick={() => {
                      setClickedSubTask(subtask);
                      setClickedOnViewSubTask(true);
                    }}
                    className="w-full flex flex-col gap-1 p-2 rounded-xl border-dashed border-[1px] border-gray-600 cursor-pointer"
                  >
                    <div className="w-full flex justify-between items-center">
                      <div className="font-semibold text-xl">{subtask.title}</div>
                      {subtask.isCompleted ? (
                        <CheckCircle className="bg-[#bffbbe] rounded-full" size={24} weight="bold" />
                      ) : moment(subtask.deadline).isAfter(moment()) ? (
                        <Circle className="bg-[#f4f8af] rounded-full" size={24} weight="bold" />
                      ) : (
                        <XCircle className="bg-[#fbbebe] rounded-full" size={24} weight="bold" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{subtask.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          isAssignedUser(user.id) &&
          !task.isCompleted && (
            <div
              onClick={() => setClickedOnNewSubTask(true)}
              className="w-full text-base bg-gray-100 rounded-xl p-4 hover:scale-105 cursor-pointer transition-ease-300"
            >
              <span className="text-xl max-lg:text-lg text-gradient font-semibold">Divide and conquer! </span> Big tasks
              can be daunting! Break them down into bite-sized subtasks for smoother sailing. 📋
            </div>
          )
        )}

        {isAssignedUser(user.id) &&
          (task.isCompleted ? (
            <div className="w-full flex justify-center gap-2 border-t-[1px] pt-4 border-[#34343479]">
              <div className="w-fit text-xl font-semibold text-gradient">Not Completed?</div>
              <span
                onClick={toggleComplete}
                className="text-lg cursor-pointer hover-underline-animation after:bg-dark_primary_btn"
              >
                Mark incomplete
              </span>
            </div>
          ) : (
            <div className="w-full text-center flex flex-col gap-2 border-t-[1px] pt-4 border-[#34343479]">
              <div
                onClick={toggleComplete}
                className="w-fit mx-auto text-xl text-gradient font-semibold hover-underline-animation after:bg-dark_primary_btn cursor-pointer"
              >
                Mark Completed
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default Task;
