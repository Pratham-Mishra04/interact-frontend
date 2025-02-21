import { Task } from '@/types';
import moment from 'moment';
import Link from 'next/link';
import React from 'react';

const TaskCard = ({ task }: { task: Task }) => {
  return (
    <Link
      href={
        task.project?.title
          ? `/workspace/tasks/${task.project?.slug}?tid=${task.id}`
          : `/organisations?oid=${task.organizationID}&redirect_url=/tasks?tid=${task.id}`
      }
      key={task.id}
      className="w-full flex justify-between items-center flex-wrap hover:scale-105 hover:bg-primary_comp dark:hover:bg-dark_primary_comp_hover rounded-lg px-2 py-1 transition-ease-300"
    >
      <div className="w-[calc(100%-112px)]">
        <div className="font-medium line-clamp-1">{task.title}</div>
        <div className="text-xs line-clamp-1">
          @{task.project?.title ? task.project.title : task.organization?.title}
        </div>
      </div>
      <div
        className={`w-28 text-xs text-end ${
          !task.isCompleted && (moment(task.deadline).isBefore(moment()) ? 'text-primary_danger' : 'text-green-400')
        }`}
      >
        {moment(task.deadline).format('hh:mm A DD MMM')}
      </div>
    </Link>
  );
};

export default TaskCard;
