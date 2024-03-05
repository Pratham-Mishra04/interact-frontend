import { ProjectHistory } from '@/types';
import ProjectHistoryWrapper from '@/wrappers/project_history';
import Link from 'next/link';
import React from 'react';

interface Props {
  history: ProjectHistory;
}

const Created = ({ history }: Props) => {
  switch (history.historyType) {
    case -1: //User created this project
      return (
        <ProjectHistoryWrapper history={history}>
          <div className="w-fit text-center flex-center gap-1">created this Project! 🎉</div>
        </ProjectHistoryWrapper>
      );
    case 3: //User created an opening
      return (
        <ProjectHistoryWrapper history={history}>
          <div className="w-fit text-center flex-center gap-1">
            created an Opening{' '}
            <Link href={`/explore?oid=${history.openingID}`} className="font-semibold">
              {history.opening.title}
            </Link>
            .
          </div>
        </ProjectHistoryWrapper>
      );
    case 8: //User created a new group chat
      return (
        <ProjectHistoryWrapper history={history}>
          <div className="w-fit text-center flex-center gap-1">created a New Group Chat.</div>
        </ProjectHistoryWrapper>
      );
    case 9: //User created a new task
      return (
        <ProjectHistoryWrapper history={history}>
          <div className="w-fit text-center flex-center gap-1">
            added a New Task - <b>{history.task.title}</b>.
          </div>
        </ProjectHistoryWrapper>
      );
    default:
      return <></>;
  }
};

export default Created;
