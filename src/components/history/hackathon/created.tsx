import { HackathonHistory } from '@/types';
import HackathonHistoryWrapper from '@/wrappers/hackathon_history';
import React from 'react';

interface Props {
  history: HackathonHistory;
}

const Created = ({ history }: Props) => {
  switch (history.historyType) {
    case 0:
      return (
        <HackathonHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md inline-flex items-center gap-1">
            <span>created a Hackathon: 🎉</span>
          </div>
        </HackathonHistoryWrapper>
      );
    case 3:
      return (
        <HackathonHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md inline-flex items-center gap-1">
            <span>Added a Track: {history.hackathonTrack.title} 🎉</span>
          </div>
        </HackathonHistoryWrapper>
      );
    case 6:
      return (
        <HackathonHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md inline-flex items-center gap-1">
            <span>Added Prize: {history.hackathonPrize.title} 🎉</span>
          </div>
        </HackathonHistoryWrapper>
      );
    case 9:
      return (
        <HackathonHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md inline-flex items-center gap-1">
            <span>Added a Sponsor: {history.hackathonSponsor.name} 🎉</span>
          </div>
        </HackathonHistoryWrapper>
      );
    case 12:
      return (
        <HackathonHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md inline-flex items-center gap-1">
            <span>Added a FAQ: {history.hackathonFAQ.question} 🎉</span>
          </div>
        </HackathonHistoryWrapper>
      );
    case 15:
      return (
        <HackathonHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md inline-flex items-center gap-1">
            <span>Added a Round: {history.hackathonRound.index} 🎉</span>
          </div>
        </HackathonHistoryWrapper>
      );
    case 18:
      return (
        <HackathonHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md inline-flex items-center gap-1">
            <span>Added a Coordinator: {history.user.name} 🎉</span>
          </div>
        </HackathonHistoryWrapper>
      );
    case 20:
      return (
        <HackathonHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md inline-flex items-center gap-1">
            <span>Added a Judge: {history.user.name} 🎉</span>
          </div>
        </HackathonHistoryWrapper>
      );
    default:
      return <></>;
  }
};

export default Created;
