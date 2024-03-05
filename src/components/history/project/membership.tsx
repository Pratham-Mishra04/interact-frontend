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
          <div className="w-fit text-center flex-center gap-1">
            invited{' '}
            <Link href={`/explore/user/${history.user.username}`} className="font-semibold">
              {history.user.name}
            </Link>{' '}
            to join this Project!
          </div>
        </ProjectHistoryWrapper>
      );
    case 1: //User joined this project
      return (
        <ProjectHistoryWrapper history={history}>
          <div className="w-fit text-center flex-center gap-1">joined this Project!🎉</div>
        </ProjectHistoryWrapper>
      );
    case 6: //User accepted application of user
      return (
        <ProjectHistoryWrapper history={history}>
          <div className="w-fit text-center flex-center gap-1">
            accepted the application of{' '}
            <Link href={`/explore/user/${history.user.username}`} className="font-semibold">
              {history.user.name}
            </Link>
            !
          </div>
        </ProjectHistoryWrapper>
      );
    case 7: //User rejected application of user
      return (
        <ProjectHistoryWrapper history={history}>
          <div className="w-fit text-center flex-center gap-1">
            rejected the application of{' '}
            <Link href={`/explore/user/${history.user.username}`} className="font-semibold">
              {history.user.name}
            </Link>
            .
          </div>
        </ProjectHistoryWrapper>
      );
    case 10: //User left the project
      return (
        <ProjectHistoryWrapper history={history}>
          <div className="w-fit text-center flex-center gap-1">left this Project.</div>
        </ProjectHistoryWrapper>
      );
    case 11: //User removed user from the project
      return (
        <ProjectHistoryWrapper history={history}>
          <div className="w-fit text-center flex-center gap-1">
            removed{' '}
            <Link href={`/explore/user/${history.user.username}`} className="font-semibold">
              {history.user.name}
            </Link>{' '}
            from this Project.
          </div>
        </ProjectHistoryWrapper>
      );
    default:
      return <></>;
  }
};

export default Membership;
