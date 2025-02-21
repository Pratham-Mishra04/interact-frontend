import { OrganizationHistory } from '@/types';
import OrganizationHistoryWrapper from '@/wrappers/organisation_history';
import { ArrowUpRight } from '@phosphor-icons/react';
import Link from 'next/link';
import React from 'react';

interface Props {
  history: OrganizationHistory;
}

const Created = ({ history }: Props) => {
  switch (history.historyType) {
    case -1:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md inline-flex items-center gap-1">
            <span>Organisation was created! 🎉</span>
          </div>
        </OrganizationHistoryWrapper>
      );
    case 0:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md inline-flex items-center gap-1">
            <span>Created an Event:</span>
            <Link target="_blank" href={'/events/' + history.event?.id} className="font-semibold">
              {history.event?.title}
            </Link>
            <span>🎉</span>
          </div>
        </OrganizationHistoryWrapper>
      );
    case 3:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md inline-flex items-center gap-1">
            <span>Invited a User:</span>
            <Link target="_blank" href={'/users/' + history.invitation?.user?.username} className="font-semibold">
              {history.invitation?.user.username}
            </Link>
            <span>🎉</span>
          </div>
        </OrganizationHistoryWrapper>
      );
    case 6:
      return (
        <OrganizationHistoryWrapper history={history}>
          <Link
            target="_blank"
            href={'/explore/post/' + history.post?.id}
            className="w-fit bg-priority_low px-1 rounded-md flex-center gap-2 inline-flex items-center"
          >
            <span>Created a New Post!</span>
            <ArrowUpRight weight="bold" />
          </Link>
        </OrganizationHistoryWrapper>
      );
    case 9:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md inline-flex items-center gap-1">
            <span>Created a Project:</span>
            <Link target="_blank" href={'/projects/' + history.project?.slug} className="font-semibold">
              {history.project?.title}
            </Link>
            <span>🎉</span>
          </div>
        </OrganizationHistoryWrapper>
      );
    case 12:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md inline-flex items-center gap-1">
            <span>Added a Task:</span>
            <Link target="_blank" href={'/organisation/tasks/'} className="font-semibold">
              {history.task?.title}
            </Link>
            <span>🎉</span>
          </div>
        </OrganizationHistoryWrapper>
      );
    case 18:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md inline-flex items-center gap-1">
            <span>Added a Poll:</span>
            <Link target="_blank" href={'/organisation/news/'} className="font-semibold">
              {history.poll?.title}
            </Link>
            <span>🎉</span>
          </div>
        </OrganizationHistoryWrapper>
      );
    case 21:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md inline-flex items-center gap-1">
            <span>Added an Announcement:</span>
            <Link target="_blank" href={'/explore/announcement/' + history.announcementID} className="font-semibold">
              {history.announcement?.title}
            </Link>
            <span>🎉</span>
          </div>
        </OrganizationHistoryWrapper>
      );
    case 24:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md inline-flex items-center gap-1">
            <span>Added an Opening:</span>
            <Link target="_blank" href={'/openings?oid=' + history.openingID} className="font-semibold">
              {history.opening?.title}
            </Link>
            <span>🎉</span>
          </div>
        </OrganizationHistoryWrapper>
      );
    case 27:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md inline-flex items-center gap-1">
            <span>Accepted the Application of:</span>
            <Link target="_blank" href={'/users/' + history.application?.user.username} className="font-semibold">
              {history.application?.user.name}
            </Link>
            <span>🎉</span>
          </div>
        </OrganizationHistoryWrapper>
      );
    case 31:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md inline-flex items-center gap-1">
            <span>Added a Resource Bucket:</span>
            <Link target="_blank" href={'/organisation/resources'} className="font-semibold">
              {history.resourceBucket?.title}
            </Link>
            <span>🎉</span>
          </div>
        </OrganizationHistoryWrapper>
      );
    case 34:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md inline-flex items-center gap-1">
            <span>Added a Team:</span>
            <Link target="_blank" href={'/organisation/members'} className="font-semibold">
              {history.team?.title}
            </Link>
            <span>🎉</span>
          </div>
        </OrganizationHistoryWrapper>
      );
    case 37:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md inline-flex items-center gap-1">
            <span>Added </span>
            <Link target="_blank" href={'/users/' + history.membership?.user.username} className="font-semibold">
              {history.membership?.user.name}
            </Link>
            <span> to team:</span>
            <Link target="_blank" href={'/organisation/members'} className="font-semibold">
              {history.team?.title}
            </Link>
            <span> 🎉</span>
          </div>
        </OrganizationHistoryWrapper>
      );
    case 39:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md inline-flex items-center gap-1">
            <span>Added a Meeting:</span>
            <Link target="_blank" href={'/organisation/meetings/' + history.meeting?.id} className="font-semibold">
              {history.meeting?.title}
            </Link>
            <span> 🎉</span>
          </div>
        </OrganizationHistoryWrapper>
      );
    default:
      return <></>;
  }
};

export default Created;
