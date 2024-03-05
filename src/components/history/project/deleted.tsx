import { ProjectHistory } from '@/types';
import ProjectHistoryWrapper from '@/wrappers/project_history';
import React from 'react';

interface Props {
  history: ProjectHistory;
}

const Deleted = ({ history }: Props) => {
  switch (history.historyType) {
    case 5: //User deleted opening
      return (
        <ProjectHistoryWrapper history={history}>
          <div className="w-fit text-center flex-center gap-1">deleted an Opening - {history.deletedText}.</div>
        </ProjectHistoryWrapper>
      );
    default:
      return <></>;
  }
};

export default Deleted;
