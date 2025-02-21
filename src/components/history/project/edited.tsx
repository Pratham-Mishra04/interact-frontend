import { ProjectHistory } from '@/types';
import ProjectHistoryWrapper from '@/wrappers/project_history';
import Link from 'next/link';
import React from 'react';

interface Props {
  history: ProjectHistory;
}

const Edited = ({ history }: Props) => {
  switch (history.historyType) {
    case 2: //User edited project details
      return (
        <ProjectHistoryWrapper history={history}>
          <div className="w-fit flex-center gap-1">edited Project Details: </div>
          <div>{history.deletedText}</div>
        </ProjectHistoryWrapper>
      );
    case 4: //User edited opening details
      return (
        <ProjectHistoryWrapper history={history}>
          <div className="w-fit inline gap-1">
            <span>edited Opening Details - </span>
            <Link href={`/openings?oid=${history.openingID}`} className="font-semibold inline">
              {history.opening.title}
            </Link>
            <span>: {history.deletedText}.</span>
          </div>
        </ProjectHistoryWrapper>
      );
    case 13: //User edited memberships details
      return (
        <ProjectHistoryWrapper history={history}>
          <div className="w-fit inline gap-1">
            <span>edited Memberships Details - </span>
            <Link href={`/projects?id=${history.membership.projectID}`} className="font-semibold inline">
              {history.membership.user.name}
            </Link>
            <span>.</span>
          </div>
        </ProjectHistoryWrapper>
      );
    default:
      return <></>;
  }
};

export default Edited;
