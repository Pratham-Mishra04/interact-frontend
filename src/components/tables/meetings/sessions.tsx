import { ORG_MEMBER } from '@/config/constants';
import { useOrgAccess } from '@/hooks/use-org-access';
import { Session } from '@/types';
import moment from 'moment';
import React from 'react';

interface Props {
  sessions: Session[];
  setClickedOnSession: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedSessionID: React.Dispatch<React.SetStateAction<string>>;
  org: boolean;
}

const SessionTable = ({ sessions, setClickedOnSession, setClickedSessionID, org }: Props) => {
  const isMember = useOrgAccess(ORG_MEMBER);

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="text-3xl font-semibold my-2">Sessions</div>
      <div className="w-full h-12 bg-white dark:bg-dark_primary_comp rounded-xl border-gray-400 dark:border-dark_primary_btn flex font-semibold text-primary_black dark:text-white">
        <div className="w-[30%] flex-center">ID</div>
        <div className="w-[30%] flex-center">Started At</div>
        <div className="w-[30%] flex-center">Ended At</div>
        <div className="w-[10%] flex-center"></div>
      </div>
      {sessions.map(session => (
        <div
          key={session.id}
          onClick={() => {
            if (!org || isMember) {
              setClickedSessionID(session.id);
              setClickedOnSession(true);
            }
          }}
          className={`w-full h-12 bg-white dark:bg-dark_primary_comp rounded-xl border-gray-400 dark:border-dark_primary_btn flex text-sm text-primary_black dark:text-white ${
            !org || isMember ? 'dark:hover:bg-dark_primary_comp_hover cursor-pointer' : 'cursor-default'
          } transition-ease-300`}
        >
          <div className="w-[30%] flex-center">{session.id}</div>
          <div className="w-[30%] flex-center">{moment(session.startedAt).format('hh:mm A, dddd DD MMMM')}</div>
          <div className="w-[30%] flex-center">
            {session.isLive ? (
              <div className="w-fit text-sm px-2 py-1 bg-priority_low rounded-full">Session is Live!</div>
            ) : (
              moment(session.endedAt).format('hh:mm A, dddd DD MMMM')
            )}
          </div>
          <div className="w-[10%] flex-center"></div>
        </div>
      ))}
    </div>
  );
};

export default SessionTable;
