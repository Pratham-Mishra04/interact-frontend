import { OrganizationHistory } from '@/types';
import OrganizationHistoryWrapper from '@/wrappers/organisation_history';
import Link from 'next/link';
import React from 'react';

interface Props {
  history: OrganizationHistory;
}

const Deleted = ({ history }: Props) => {
  switch (history.historyType) {
    case 1:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_high px-1 rounded-md gap-4">
            <span className="">Deleted</span> an event: <span className="font-semibold">{history.deletedText}</span>
          </div>
        </OrganizationHistoryWrapper>
      );
    case 4:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_high px-1 rounded-md gap-4">
            Withdrew an invitation: <span className="font-semibold">{history.deletedText}</span>
          </div>
        </OrganizationHistoryWrapper>
      );
    case 5:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_high px-1 rounded-md gap-4">
            Removed a member: <span className="font-semibold">{history.user.username}</span>
          </div>
        </OrganizationHistoryWrapper>
      );
    case 7:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_high px-1 rounded-md gap-4">
            Deleted a post:<span className="font-semibold">{history.deletedText}</span>
          </div>
        </OrganizationHistoryWrapper>
      );
    case 10:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_high px-1 rounded-md gap-4">
            Deleted a project: <span className="font-semibold">{history.deletedText}</span>
          </div>
        </OrganizationHistoryWrapper>
      );
    case 13:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_high px-1 rounded-md gap-4">
            Deleted a task: <span className="font-semibold">{history.deletedText}</span>
          </div>
        </OrganizationHistoryWrapper>
      );
    case 15:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_high px-1 rounded-md gap-4">Left the Organisation</div>
        </OrganizationHistoryWrapper>
      );
    case 19:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_high px-1 rounded-md gap-4 line-clamp-1">
            Deleted a Poll: <span className="font-semibold">{history.deletedText}</span>
          </div>
        </OrganizationHistoryWrapper>
      );
    case 22:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_high px-1 rounded-md gap-4">
            Deleted an Announcement: <span className="font-semibold">{history.deletedText}</span>
          </div>
        </OrganizationHistoryWrapper>
      );
    case 25:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_high px-1 rounded-md gap-4">
            Deleted an Opening: <span className="font-semibold">{history.deletedText}</span>
          </div>
        </OrganizationHistoryWrapper>
      );
    case 28:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_high px-1 rounded-md gap-4">
            Rejected the Application of :{' '}
            <Link
              target="_blank"
              href={'/explore/user/' + history.application?.user.username}
              className="font-semibold"
            >
              {history.application?.user.name}
            </Link>{' '}
          </div>
        </OrganizationHistoryWrapper>
      );
    case 29:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_high px-1 rounded-md gap-4">
            Withdrew Co-Host Invitations for the Event:{' '}
            <Link target="_blank" href={'/explore/event/' + history.event?.id} className="font-semibold">
              {history.event?.title}
            </Link>{' '}
          </div>
        </OrganizationHistoryWrapper>
      );
    default:
      return <></>;
  }
};

export default Deleted;
