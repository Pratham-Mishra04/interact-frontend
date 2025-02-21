import { HackathonHistory } from '@/types';
import HackathonHistoryWrapper from '@/wrappers/hackathon_history';
import React from 'react';

interface Props {
  history: HackathonHistory;
}

const Edited = ({ history }: Props) => {
  switch (history.historyType) {
    case 1:
      return (
        <HackathonHistoryWrapper history={history}>
          <div className="w-fit bg-priority_mid px-1 rounded-md inline-flex items-center gap-1">
            <span>Hackathon details updated:</span> <span>{history.deletedText}</span>
          </div>
        </HackathonHistoryWrapper>
      );
    case 4:
      return (
        <HackathonHistoryWrapper history={history}>
          <div className="w-fit bg-priority_mid px-1 rounded-md inline-flex items-center gap-1">
            <span>Track updated!</span> <span>{history.hackathonTrack.title}</span>
          </div>
        </HackathonHistoryWrapper>
      );
    case 7:
      return (
        <HackathonHistoryWrapper history={history}>
          <div className="w-fit bg-priority_mid px-1 rounded-md inline-flex items-center gap-1">
            <span>Prize Updated!</span> <span>{history.hackathonPrize.title}</span>
            <span>{history.deletedText}</span>
          </div>
        </HackathonHistoryWrapper>
      );
    case 10:
      return (
        <HackathonHistoryWrapper history={history}>
          <div className="w-fit bg-priority_mid px-1 rounded-md inline-flex items-center gap-1">
            <span>Sponsor Updated:</span> <span>{history.hackathonSponsor.name}</span>
            <span>{history.deletedText}</span>
          </div>
        </HackathonHistoryWrapper>
      );
    case 13:
      return (
        <HackathonHistoryWrapper history={history}>
          <div className="w-fit bg-priority_mid px-1 rounded-md inline-flex items-center gap-1">
            <span>FAQ Updated:</span> <span>{history.hackathonFAQ.question}</span>
          </div>
        </HackathonHistoryWrapper>
      );
    case 16:
      return (
        <HackathonHistoryWrapper history={history}>
          <div className="w-fit bg-priority_mid px-1 rounded-md inline-flex items-center gap-1">
            <span>Round updated:</span> <span>{history.hackathonRound.index}</span>
          </div>
        </HackathonHistoryWrapper>
      );
    case 22:
      return (
        <HackathonHistoryWrapper history={history}>
          <div className="w-fit bg-priority_mid px-1 rounded-md inline-flex items-center gap-1">
            <span>{history.user.name}</span> <span>eliminated a Team:</span> <span>{history.hackathonTeam.title}</span>
          </div>
        </HackathonHistoryWrapper>
      );
    case 23:
      return (
        <HackathonHistoryWrapper history={history}>
          <div className="w-fit bg-priority_mid px-1 rounded-md inline-flex items-center gap-1">
            <span>{history.user.name}</span> <span>un-eliminated a Team:</span>{' '}
            <span>{history.hackathonTeam.title}</span>
          </div>
        </HackathonHistoryWrapper>
      );
    case 24:
      return (
        <HackathonHistoryWrapper history={history}>
          <div className="w-fit bg-priority_mid px-1 rounded-md inline-flex items-center gap-1">
            <span>{history.user.name}</span> <span>scored a Team (Overall):</span>{' '}
            <span className="font-semibold">{history.hackathonTeam.title}</span>
          </div>
        </HackathonHistoryWrapper>
      );
    case 25:
      return (
        <HackathonHistoryWrapper history={history}>
          <div className="w-fit bg-priority_mid px-1 rounded-md inline-flex items-center gap-1">
            <span>{history.user.name}</span> <span>scored a Team (Metric):</span>{' '}
            <span className="font-semibold">{history.hackathonTeam?.title}</span>
          </div>
        </HackathonHistoryWrapper>
      );
    default:
      return <></>;
  }
};

export default Edited;
