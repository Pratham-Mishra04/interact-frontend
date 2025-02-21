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
          <div className="w-fit inline items-center gap-1">
            <span>deleted an Opening - </span>
            <span>{history.deletedText}</span>
            <span>.</span>
          </div>
        </ProjectHistoryWrapper>
      );
    case 12: //User withdrew invitation
      return (
        <ProjectHistoryWrapper history={history}>
          <div className="w-fit inline items-center gap-1">
            <span>withdrew an Invitation - </span>
            <span>{history.deletedText}</span>
            <span>.</span>
          </div>
        </ProjectHistoryWrapper>
      );
    default:
      return <></>;
  }
};

export default Deleted;
