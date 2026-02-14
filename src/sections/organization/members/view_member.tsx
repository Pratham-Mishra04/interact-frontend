import React, { useState } from 'react';
import ColoredTag from '@/components/common/colored_tag';
import { USER_PROFILE_PIC_URL } from '@/config/routes';
import ModalWrapper from '@/wrappers/modal';
import Image from 'next/image';
import moment from 'moment';
import TasksTable from '@/components/tables/tasks'; 
import { Task } from '@/types';
import { OrganizationMembership } from '@/types';
import getCompletionPercentage, { getTaskStatusColor } from '@/utils/funcs/task';

interface Props {
  membership: OrganizationMembership;
  tasks: Task[];
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const ViewMember = ({ membership, tasks, setShow }: Props) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [clickedOnTask, setClickedOnTask] = useState<boolean>(false);
  const [clickedTaskID, setClickedTaskID] = useState<number>(-1); // Initialize with a default value that represents "not selected"

  const filteredTasks = tasks.filter((task: Task) => {
    if (selectedStatus === 'All') return true;
    if (selectedStatus === 'Completed' && task.isCompleted) return true;
    if (selectedStatus === 'Not Started' && !task.isCompleted && getCompletionPercentage(task) === 0) return true;
    if (selectedStatus === 'In Progress' && !task.isCompleted && getCompletionPercentage(task) > 0) return true;
    return false;
  });

  const fetcher = async () => {
    // Implement your fetch logic here
  };

  const hasMore = true; // Set this based on whether there are more tasks to load

  return (
    <ModalWrapper setShow={setShow} width={'1/3'} top={'1/3'}>
      <div className="flex flex-col items-center gap-4">
        <Image
          crossOrigin="anonymous"
          width={100}
          height={100}
          alt={'User Pic'}
          src={`${USER_PROFILE_PIC_URL}/${membership.user.profilePic}`}
          placeholder="blur"
          blurDataURL={membership.user.profilePicBlurHash || 'no-hash'}
          className="w-24 h-24 rounded-full"
        />
        <div className="text-2xl font-semibold">{membership.user.name}</div>
        <div className="text-lg text-gray-500">@{membership.user.username}</div>

        <div className="w-full flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Position in Team:</span>
            <span>{membership.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Position in Organisation:</span>
            <span>{membership.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Joined At:</span>
            <span>{moment(membership.createdAt).format('DD MMMM, YYYY')}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Teams:</span>
            <div className="flex gap-2">
              {membership.teams.map((team) => (
                <ColoredTag key={team.id} tag={team.title} color={team.color} />
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Tasks:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="ml-2 p-1 rounded bg-white border border-gray-300"
            >
              <option value="All">All</option>
              <option value="Completed" style={{ backgroundColor: getTaskStatusColor(tasks.find(task => task.isCompleted)!) }}>Completed</option>
              <option value="In Progress" style={{ backgroundColor: getTaskStatusColor(tasks.find(task => !task.isCompleted && getCompletionPercentage(task) > 0)!) }}>In Progress</option>
              <option value="Not Started" style={{ backgroundColor: getTaskStatusColor(tasks.find(task => !task.isCompleted && getCompletionPercentage(task) === 0)!) }}>Not Started</option>
            </select>
          </div>
        </div>

        <TasksTable
          tasks={filteredTasks}
          fetcher={fetcher}
          hasMore={hasMore}
          setClickedOnTask={setClickedOnTask}
          setClickedTaskID={setClickedTaskID}
        />
      </div>
    </ModalWrapper>
  );
};

export default ViewMember;
