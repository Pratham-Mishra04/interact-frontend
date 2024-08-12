import React, { useEffect, useState } from 'react';
import { Meeting } from '@/types';
import Link from 'next/link';
import moment from 'moment';
import { getNextSessionTime } from '@/utils/funcs/session_details';
import Tags from '../common/tags';

interface Props {
  meeting: Meeting;
}

const MeetingCard = ({ meeting }: Props) => {
  const [status, setStatus] = useState('Ended');
  useEffect(() => {
    const now = moment();
    setStatus(
      meeting.isLive
        ? 'Live'
        : moment(meeting.startTime).isBefore(now) && moment(meeting.endTime).isAfter(now)
        ? 'Idle'
        : meeting.frequency == 'none'
        ? moment(meeting.startTime).isBefore(now)
          ? 'Ended'
          : 'Scheduled'
        : 'Scheduled'
    );
  }, []);

  return (
    <Link
      href={'/organisation/meetings/' + meeting.id}
      className="w-full flex gap-1 bg-white py-4 rounded-lg hover:shadow-xl transition-ease-out-500 animate-fade_third p-2"
    >
      <div className="w-1/6 max-md:w-1/3 line-clamp-1 flex-center max-md:text-sm">{meeting.title}</div>
      <div className="w-1/6 max-md:w-1/3 flex-center">
        <div
          className={`text-xs px-2 py-1 ${
            status == 'Live' ? 'bg-priority_low' : status == 'Ended' ? 'bg-priority_high' : 'bg-priority_mid'
          } rounded-full `}
        >
          {status}
        </div>
      </div>
      <div className="w-1/6 max-md:hidden flex-center">
        <Tags tags={meeting.tags} limit={20} center={true} />
      </div>
      <div className="w-1/6 max-md:hidden flex-center">
        <div
          className={`text-xs px-2 py-1 ${
            meeting.frequency == 'none' ? 'bg-blue-200' : 'bg-priority_mid'
          } rounded-full capitalize`}
        >
          {meeting.frequency == 'none' ? 'One Time' : meeting.frequency}
        </div>
      </div>
      <div className="w-1/6 max-md:w-1/3 flex-center">
        <div
          className={`text-xs px-2 py-1 ${
            meeting.isOpenForMembers ? 'bg-priority_low' : 'bg-priority_high'
          } rounded-full `}
        >
          {meeting.isOpenForMembers ? 'Open' : 'Restricted'}
        </div>
      </div>
      <div className="w-1/6 max-md:hidden text-sm flex-center flex-col">
        {meeting.isLive ? (
          'Session is live'
        ) : (
          <>
            <div className="text-xs">
              {status == 'Live'
                ? 'Started At'
                : meeting.frequency == 'none'
                ? status == 'Scheduled'
                  ? 'Scheduled on'
                  : 'Held on'
                : 'Next Session on'}
            </div>
            <div>{getNextSessionTime(meeting)}</div>
          </>
        )}
      </div>
    </Link>
  );
};

export default MeetingCard;
