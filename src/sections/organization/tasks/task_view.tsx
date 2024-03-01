import { Organization, Task } from '@/types';
import React, { useState } from 'react';
import { ORG_URL, TASK_URL } from '@/config/routes';
import Toaster from '@/utils/toaster';
import { SERVER_ERROR } from '@/config/errors';
import deleteHandler from '@/handlers/delete_handler';
import ConfirmDelete from '@/components/common/confirm_delete';
import { useSelector } from 'react-redux';
import patchHandler from '@/handlers/patch_handler';
import NewSubTask from '@/sections/workspace/new_sub_task';
import { initialSubTask, initialTask } from '@/types/initials';
import SubTaskView from '@/sections/workspace/sub_task_view';
import EditSubTask from '@/sections/workspace/edit_sub_task';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import TaskComponent from '@/sections/tasks/task_view';
import checkOrgAccess from '@/utils/funcs/check_org_access';
import { ORG_MANAGER } from '@/config/constants';
import EditTask from '@/sections/tasks/edit_task';

interface Props {
  taskID: number;
  tasks: Task[];
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
  setFilteredTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
  setClickedTaskID?: React.Dispatch<React.SetStateAction<number>>;
  organization: Organization;
}

const TaskView = ({ taskID, tasks, setShow, setTasks, setFilteredTasks, organization, setClickedTaskID }: Props) => {
  const [clickedOnEditTask, setClickedOnEditTask] = useState(false);
  const [clickedOnDeleteTask, setClickedOnDeleteTask] = useState(false);
  const [clickedOnNewSubTask, setClickedOnNewSubTask] = useState(false);
  const [clickedOnViewSubTask, setClickedOnViewSubTask] = useState(false);
  const [clickedOnEditSubTask, setClickedOnEditSubTask] = useState(false);
  const [clickedSubTask, setClickedSubTask] = useState(initialSubTask);
  const [clickedOnDeleteSubTask, setClickedOnDeleteSubTask] = useState(false);

  const task = tasks[taskID] || initialTask;

  const currentOrgID = useSelector(currentOrgIDSelector);

  const handleDelete = async () => {
    const toaster = Toaster.startLoad('Deleting the task...');

    const URL = `${ORG_URL}/${currentOrgID}/tasks/${task.id}`;

    const res = await deleteHandler(URL);

    if (res.statusCode === 204) {
      if (setTasks) setTasks(prev => prev.filter(t => t.id != task.id));
      if (setFilteredTasks) setFilteredTasks(prev => prev.filter(t => t.id != task.id));
      setShow(false);
      Toaster.stopLoad(toaster, 'Task Deleted', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  const handleDeleteSubTask = async () => {
    const toaster = Toaster.startLoad('Deleting the sub task...');

    const URL = `${TASK_URL}/sub/${clickedSubTask.id}`;

    const res = await deleteHandler(URL);

    if (res.statusCode === 204) {
      if (setTasks)
        setTasks(prev =>
          prev.map(t => {
            if (t.id == task.id)
              return {
                ...t,
                subTasks: t.subTasks.filter(s => s.id != clickedSubTask.id),
              };
            else return t;
          })
        );
      if (setFilteredTasks)
        setFilteredTasks(prev =>
          prev.map(t => {
            if (t.id == task.id)
              return {
                ...t,
                subTasks: t.subTasks.filter(s => s.id != clickedSubTask.id),
              };
            else return t;
          })
        );
      setShow(false);
      Toaster.stopLoad(toaster, 'Sub Task Deleted', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  const toggleComplete = async () => {
    const toaster = Toaster.startLoad(task.isCompleted ? 'Marking Incomplete' : 'Marking Completed');

    const URL = `${TASK_URL}/completed/${task.id}`;

    const res = await patchHandler(URL, { isCompleted: !task.isCompleted });

    if (res.statusCode === 200) {
      if (setTasks)
        setTasks(prev =>
          prev.map(t => {
            if (t.id == task.id) return { ...t, isCompleted: !task.isCompleted };
            else return t;
          })
        );
      if (setFilteredTasks)
        setFilteredTasks(prev =>
          prev.map(t => {
            if (t.id == task.id) return { ...t, isCompleted: !task.isCompleted };
            else return t;
          })
        );
      setShow(false);
      Toaster.stopLoad(toaster, task.isCompleted ? 'Task Marked Incomplete' : 'Task Completed', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  return (
    <>
      {clickedOnEditTask && (
        <EditTask
          org={true}
          organization={organization}
          task={task}
          setShow={setClickedOnEditTask}
          setTasks={setTasks}
          setFilteredTasks={setFilteredTasks}
        />
      )}
      {clickedOnEditSubTask && (
        <EditSubTask
          subTask={clickedSubTask}
          task={task}
          setShow={setClickedOnEditSubTask}
          setTasks={setTasks}
          setFilteredTasks={setFilteredTasks}
        />
      )}
      {clickedOnDeleteTask && <ConfirmDelete setShow={setClickedOnDeleteTask} handleDelete={handleDelete} />}
      {clickedOnDeleteSubTask && (
        <ConfirmDelete setShow={setClickedOnDeleteSubTask} handleDelete={handleDeleteSubTask} />
      )}
      {clickedOnNewSubTask && (
        <NewSubTask
          setShow={setClickedOnNewSubTask}
          task={task}
          setTasks={setTasks}
          setFilteredTasks={setFilteredTasks}
        />
      )}
      {clickedOnViewSubTask && (
        <SubTaskView
          setShow={setClickedOnViewSubTask}
          subTask={clickedSubTask}
          task={task}
          setClickedOnEditSubTask={setClickedOnEditSubTask}
          setClickedOnDeleteSubTask={setClickedOnDeleteSubTask}
          setTasks={setTasks}
          setFilteredTasks={setFilteredTasks}
        />
      )}
      <TaskComponent
        task={task}
        accessChecker={checkOrgAccess(ORG_MANAGER)}
        setClickedTaskID={setClickedTaskID}
        setClickedOnEditTask={setClickedOnEditTask}
        setClickedOnDeleteTask={setClickedOnDeleteTask}
        setClickedOnNewSubTask={setClickedOnNewSubTask}
        setClickedSubTask={setClickedSubTask}
        setClickedOnViewSubTask={setClickedOnViewSubTask}
        toggleComplete={toggleComplete}
        setShow={setShow}
      />
    </>
  );
};

export default TaskView;
