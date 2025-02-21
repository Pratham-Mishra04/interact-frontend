import { Meeting, Project } from '@/types';
import { getNextSessionTime } from '@/utils/funcs/session_details';
import moment from 'moment';
import Link from 'next/link';
import React from 'react';

const MeetingCard = ({ meeting, meetingProject }: { meeting: Meeting; meetingProject: Project | undefined }) => {
  return (
    <Link
      href={`/meetings/redirect?id=${meeting.id}`}
      key={meeting.id}
      className="w-full flex justify-between items-center flex-wrap hover:scale-105 hover:bg-primary_comp dark:hover:bg-dark_primary_comp_hover rounded-lg px-2 py-1 transition-ease-300"
    >
      <div className="w-[calc(100%-112px)]">
        <div className="font-medium line-clamp-1">{meeting.title}</div>
        <div className="text-xs line-clamp-1">
          @{meeting.applicationID ? meetingProject?.title : meeting.organization.title}
        </div>
      </div>
      <div
        className={`w-28 text-xs text-end ${
          moment(meeting.nextSessionTime).isBefore(moment()) ? 'text-green-400' : 'text-yellow-200'
        }`}
      >
        {getNextSessionTime(meeting, false, 'hh:mm A DD MMM')}
      </div>
    </Link>
  );
};

export default MeetingCard;
