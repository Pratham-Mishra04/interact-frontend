import { Task } from '@/types';
import React from 'react';
import PictureList from '../common/picture_list';
import moment from 'moment';
import getCompletionPercentage, {
  getTaskDeadlineColor,
  getTaskPriorityColor,
  getTaskStatusColor,
} from '@/utils/funcs/task';
import InfiniteScroll from 'react-infinite-scroll-component';
import Loader from '../common/loader';

interface Props {
  tasks: Task[];
  fetcher: (abortController?: AbortController, initialPage?: number) => void;
  hasMore: boolean;
  setClickedOnTask: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedTaskID: React.Dispatch<React.SetStateAction<number>>;
}

const TasksTable = ({ tasks, fetcher, hasMore, setClickedOnTask, setClickedTaskID }: Props) => {
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="w-full h-12 bg-white rounded-xl border-gray-400 flex font-semibold text-primary_black max-md:text-sm">
        <div className="w-[35%] flex-center">Title</div>
        <div className="w-[20%] max-md:w-[25%] flex-center">Assigned To</div>
        <div className="w-[15%] max-md:hidden flex-center">Priority</div>
        <div className="w-[15%] max-md:w-[20%] flex-center">Deadline</div>
        <div className="w-[15%] max-md:w-[20%] flex-center">Status</div>
      </div>
      <InfiniteScroll
        dataLength={tasks.length}
        next={fetcher}
        hasMore={hasMore}
        loader={<Loader />}
        className="w-full flex flex-col gap-2"
      >
        {tasks.map((task, index) => (
          <div
            key={task.id}
            onClick={() => {
              setClickedTaskID(index);
              setClickedOnTask(true);
            }}
            className="w-full h-12 bg-white hover:bg-slate-100 rounded-xl border-gray-400 flex text-sm text-primary_black transition-ease-300 cursor-pointer"
          >
            <div className="w-[35%] flex-center font-medium max-md:text-sm">{task.title}</div>
            <div className="w-[20%] max-md:w-[25%] flex-center">
              <PictureList users={task.users} size={6} gap={2} />
            </div>
            <div className="w-[15%] max-md:hidden flex-center">
              <div
                className="flex-center px-3 py-1 rounded-full text-xs"
                style={{ backgroundColor: getTaskPriorityColor(task) }}
              >
                {task.priority}
              </div>
            </div>
            <div className="w-[15%] max-md:w-[20%] flex-center">
              <div
                className="flex-center px-3 max-md:px-2 py-1 rounded-full text-xs max-md:text-xxs"
                style={{ backgroundColor: getTaskDeadlineColor(task) }}
              >
                {moment(task.deadline).format('DD MMM YY')}
              </div>
            </div>
            <div className="w-[15%] max-md:w-[20%] flex-center">
              <div
                className="flex-center px-3 max-md:px-2 py-1 rounded-full text-xs max-md:text-xxs"
                style={{ backgroundColor: getTaskStatusColor(task) }}
              >
                {task.isCompleted
                  ? 'Completed'
                  : getCompletionPercentage(task) == 0
                  ? 'Not Started'
                  : `In Progress (${getCompletionPercentage(task)}%)`}
              </div>
            </div>
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default TasksTable;
