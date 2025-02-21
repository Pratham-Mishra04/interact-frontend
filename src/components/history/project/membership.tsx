import { ProjectHistory } from '@/types';
import ProjectHistoryWrapper from '@/wrappers/project_history';
import Link from 'next/link';
import React from 'react';

interface Props {
  history: ProjectHistory;
}

const Membership = ({ history }: Props) => {
  switch (history.historyType) {
    case 0: //User sent invitation to user
      return (
        <ProjectHistoryWrapper history={history}>
          <div className="w-fit inline items-center gap-1">
            <span>invited </span>
            <Link href={`/users/${history.user.username}`} className="font-semibold inline">
              {history.user.name}
            </Link>
            <span> to join this Project!</span>
          </div>
        </ProjectHistoryWrapper>
      );
    case 1: //User joined this project
      return (
        <ProjectHistoryWrapper history={history}>
          <div className="w-fit flex-center gap-1">joined this Project!🎉</div>
        </ProjectHistoryWrapper>
      );
    case 6: //User accepted application of user
      return (
        <ProjectHistoryWrapper history={history}>
          <div className="w-fit inline items-center gap-1">
            <span>accepted the application of </span>
            <Link href={`/users/${history.user.username}`} className="font-semibold inline">
              {history.user.name}
            </Link>
            <span>!</span>
          </div>
        </ProjectHistoryWrapper>
      );
    case 7: //User rejected application of user
      return (
        <ProjectHistoryWrapper history={history}>
          <div className="w-fit inline items-center gap-1">
            <span>rejected the application of </span>
            <Link href={`/users/${history.user.username}`} className="font-semibold inline">
              {history.user.name}
            </Link>
            <span>.</span>
          </div>
        </ProjectHistoryWrapper>
      );
    case 10: //User left the project
      return (
        <ProjectHistoryWrapper history={history}>
          <div className="w-fit flex-center gap-1">left this Project.</div>
        </ProjectHistoryWrapper>
      );
    case 11: //User removed user from the project
      return (
        <ProjectHistoryWrapper history={history}>
          <div className="w-fit inline items-center gap-1">
            <span>removed </span>
            <Link href={`/users/${history.user.username}`} className="font-semibold inline">
              {history.user.name}
            </Link>
            <span> from this Project.</span>
          </div>
        </ProjectHistoryWrapper>
      );
    default:
      return <></>;
  }
};

export default Membership;
