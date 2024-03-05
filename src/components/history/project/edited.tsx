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
          <div className="w-fit text-center flex-center gap-1">edited Project Details.</div>
        </ProjectHistoryWrapper>
      );
    case 4: //User edited opening details
      return (
        <ProjectHistoryWrapper history={history}>
          <div className="w-fit text-center flex-center gap-1">
            edited Opening Details -{' '}
            <Link href={`/explore?oid=${history.openingID}`} className="font-semibold">
              {history.opening.title}
            </Link>
            .
          </div>
        </ProjectHistoryWrapper>
      );
    default:
      return <></>;
  }
};

export default Edited;
