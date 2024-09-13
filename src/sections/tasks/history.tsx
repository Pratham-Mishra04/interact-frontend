import React from 'react';
import { TaskHistory } from '@/types';
import Created from '@/components/history/task/created';
import Assigned from '@/components/history/task/assinged';
import Edited from '@/components/history/task/edited';
import Commented from '@/components/history/task/commented';
import Deleted from '@/components/history/task/deleted';
import Completed from '@/components/history/task/completed';
interface Props {
  histories: TaskHistory[];
}

const TaskHistories: React.FC<Props> = ({ histories }) => {
  return (
    <div className="w-full flex flex-col gap-3">
      {histories.map(history => {
        switch (history.historyType) {
          case -1:
          case 2:
          case 12:
          case 16:
            return <Created key={history.id} history={history} />;
          case 0:
          case 3:
          case 8:
          case 9:
            return <Assigned key={history.id} history={history} />;
          case 1:
          case 4:
            return <Edited key={history.id} history={history} />;
          case 5:
            return <Commented key={history.id} history={history} />;
          case 10:
          case 11:
          case 14:
            return <Deleted key={history.id} history={history} />;
          case 6:
          case 7:
          case 13:
          case 15:
            return <Completed key={history.id} history={history} />;
          default:
            return null;
        }
      })}
    </div>
  );
};

export default TaskHistories;
