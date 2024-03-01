import { OrganizationHistory } from '@/types';
import OrganizationHistoryWrapper from '@/wrappers/organisation_history';
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
          <div className="w-fit bg-priority_low px-1 rounded-md gap-4">Organisation was created! 🎉</div>
        </OrganizationHistoryWrapper>
      );
    case 0:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md gap-4">
            Created an Event:{' '}
            <Link target="_blank" href={'/explore/event/' + history.event?.id} className="font-semibold">
              {history.event?.title}
            </Link>{' '}
            🎉
          </div>
        </OrganizationHistoryWrapper>
      );
    case 3:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md gap-4">
            Invited a User :
            <Link
              target="_blank"
              href={'/explore/user/' + history.invitation?.user?.username}
              className="font-semibold"
            >
              {history.invitation?.user.username}
            </Link>{' '}
            🎉
          </div>
        </OrganizationHistoryWrapper>
      );
    case 6:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md gap-4">
            Created a Post:{' '}
            <Link target="_blank" href={'/explore/post/' + history.post?.id} className="line-clamp-1 font-semibold">
              {history.post?.content}
            </Link>{' '}
            🎉
          </div>
        </OrganizationHistoryWrapper>
      );
    case 9:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md gap-4">
            Created a Project:{' '}
            <Link target="_blank" href={'/explore/project/' + history.project?.slug} className="font-semibold">
              {history.project?.title}
            </Link>{' '}
            🎉
          </div>
        </OrganizationHistoryWrapper>
      );
    case 12:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md gap-4">
            Added a Task:{' '}
            <Link target="_blank" href={'/organisation/tasks/'} className="font-semibold">
              {history.task?.title}
            </Link>{' '}
            🎉
          </div>
        </OrganizationHistoryWrapper>
      );
    case 18:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md gap-4">
            Added a Poll:{' '}
            <Link target="_blank" href={'/organisation/news/'} className="font-semibold">
              {history.poll?.title}
            </Link>{' '}
            🎉
          </div>
        </OrganizationHistoryWrapper>
      );
    case 21:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md gap-4">
            Added an Announcement:{' '}
            <Link target="_blank" href={'/explore/announcement/' + history.announcementID} className="font-semibold">
              {history.announcement?.title}
            </Link>{' '}
            🎉
          </div>
        </OrganizationHistoryWrapper>
      );
    case 24:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md gap-4">
            Added an Opening:{' '}
            <Link target="_blank" href={'/explore?oid=' + history.openingID} className="font-semibold">
              {history.opening?.title}
            </Link>{' '}
            🎉
          </div>
        </OrganizationHistoryWrapper>
      );
    case 27:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit bg-priority_low px-1 rounded-md gap-4">
            Accepted the Application of :{' '}
            <Link
              target="_blank"
              href={'/explore/user/' + history.application?.user.username}
              className="font-semibold"
            >
              {history.application?.user.name}
            </Link>{' '}
            🎉
          </div>
        </OrganizationHistoryWrapper>
      );
    default:
      return <></>;
  }
};

export default Created;
