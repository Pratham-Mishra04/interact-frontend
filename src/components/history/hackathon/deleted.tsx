import { HackathonHistory } from '@/types';
import HackathonHistoryWrapper from '@/wrappers/hackathon_history';
import React from 'react';

interface Props {
  history: HackathonHistory;
}

const Deleted = ({ history }: Props) => {
  switch (history.historyType) {
    case 2:
      return (
        <HackathonHistoryWrapper history={history}>
          <div className="w-fit bg-priority_high px-1 rounded-md inline-flex items-center gap-1">
            <span>Deleted</span> an hackathon: <span className="font-semibold">{history.deletedText}</span>
          </div>
        </HackathonHistoryWrapper>
      );
    case 5:
      return (
        <HackathonHistoryWrapper history={history}>
          <div className="w-fit bg-priority_high px-1 rounded-md inline-flex items-center gap-1">
            <span>Deleted a Track:</span> <span className="font-semibold">{history.deletedText}</span>
          </div>
        </HackathonHistoryWrapper>
      );
    case 8:
      return (
        <HackathonHistoryWrapper history={history}>
          <div className="w-fit bg-priority_high px-1 rounded-md inline-flex items-center gap-1">
            <span>Deleted a prize:</span> <span className="font-semibold">{history.deletedText}</span>
          </div>
        </HackathonHistoryWrapper>
      );
    case 11:
      return (
        <HackathonHistoryWrapper history={history}>
          <div className="w-fit bg-priority_high px-1 rounded-md inline-flex items-center gap-1">
            <span>Deleted a sponsor:</span> <span className="font-semibold">{history.deletedText}</span>
          </div>
        </HackathonHistoryWrapper>
      );
    case 14:
      return (
        <HackathonHistoryWrapper history={history}>
          <div className="w-fit bg-priority_high px-1 rounded-md inline-flex items-center gap-1">
            <span>Deleted a FAQ:</span> <span className="font-semibold">{history.deletedText}</span>
          </div>
        </HackathonHistoryWrapper>
      );
    case 17:
      return (
        <HackathonHistoryWrapper history={history}>
          <div className="w-fit bg-priority_high px-1 rounded-md inline-flex items-center gap-1">
            <span>Deleted a round:</span> <span className="font-semibold">{history.deletedText}</span>
          </div>
        </HackathonHistoryWrapper>
      );
    case 19:
      return (
        <HackathonHistoryWrapper history={history}>
          <div className="w-fit bg-priority_high px-1 rounded-md inline-flex items-center gap-1">
            <span>Removed a coordinator:</span> <span className="font-semibold">{history.user.name}</span>
          </div>
        </HackathonHistoryWrapper>
      );
    case 21:
      return (
        <HackathonHistoryWrapper history={history}>
          <div className="w-fit bg-priority_high px-1 rounded-md inline-flex items-center gap-1">
            <span>Removed a judge:</span> <span className="font-semibold">{history.user.name}</span>
          </div>
        </HackathonHistoryWrapper>
      );
    default:
      return <></>;
  }
};

export default Deleted;
