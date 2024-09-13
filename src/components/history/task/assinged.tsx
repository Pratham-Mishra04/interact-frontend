import { TaskHistory } from '@/types';
import TaskHistoryWrapper from '@/wrappers/task_history';
import React from 'react';

interface Props {
  history: TaskHistory;
}

const Assigned = ({ history }: Props) => {
  switch (history.historyType) {
    case 0: // User assigned task to user
      return (
        <TaskHistoryWrapper history={history}>
          <div className="w-fit text-center flex-center gap-1">
            assigned the task to <b>{history.assignee.name}</b>.
          </div>
        </TaskHistoryWrapper>
      );
    case 3: // User assigned subtask to user
      return (
        <TaskHistoryWrapper history={history}>
          <div className="w-fit text-center flex-center gap-1">
            assigned the subtask {history.subTask.title} to <b>{history.assignee.name}</b>.
          </div>
        </TaskHistoryWrapper>
      );
    case 8: // User removed user from task
      return (
        <TaskHistoryWrapper history={history}>
          <div className="w-fit text-center flex-center gap-1">
            removed <b>{history.assignee.name}</b> from the task.
          </div>
        </TaskHistoryWrapper>
      );
    case 9: // User removed user from subtask
      return (
        <TaskHistoryWrapper history={history}>
          <div className="w-fit text-center flex-center gap-1">
            removed <b>{history.assignee.name}</b> from the subtask {history.subTask.title}.
          </div>
        </TaskHistoryWrapper>
      );
    default:
      return null;
  }
};

export default Assigned;
