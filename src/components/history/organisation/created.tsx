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
          <div className="w-fit text-center ">Organisation was created! 🎉</div>
        </OrganizationHistoryWrapper>
      );
    case 0:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit text-center ">
            Created an Event:{' '}
            <Link target="_blank" href={'/explore/event/' + history.event?.id}>
              {history.event?.title}
            </Link>{' '}
            🎉
          </div>
        </OrganizationHistoryWrapper>
      );
    case 3:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit text-center ">
            Invited a User :
            <Link target="_blank" href={'/explore/user/' + history.user?.username}>
              {history.invitation?.user.username}
            </Link>{' '}
            🎉
          </div>
        </OrganizationHistoryWrapper>
      );
    case 6:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit text-center  line-clamp-1">
            Created a Post:{' '}
            <Link target="_blank" href={'/explore/post/' + history.post?.id} className="line-clamp-1">
              {history.post?.content}
            </Link>{' '}
            🎉
          </div>
        </OrganizationHistoryWrapper>
      );
    case 9:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit text-center ">
            Created a Project:{' '}
            <Link target="_blank" href={'/explore/project/' + history.project?.slug}>
              {history.project?.title}
            </Link>{' '}
            🎉
          </div>
        </OrganizationHistoryWrapper>
      );
    case 12:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit text-center ">
            Added a Task:{' '}
            <Link target="_blank" href={'/organisation/tasks/'}>
              {history.task?.title}
            </Link>{' '}
            🎉
          </div>
        </OrganizationHistoryWrapper>
      );
    case 18:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit text-center ">
            Added a Poll:{' '}
            <Link target="_blank" href={'/organisation/news/'}>
              {history.poll?.title}
            </Link>{' '}
            🎉
          </div>
        </OrganizationHistoryWrapper>
      );
    case 21:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit text-center ">
            Added an Announcement:{' '}
            <Link target="_blank" href={'/explore/announcement/' + history.announcementID}>
              {history.announcement?.title}
            </Link>{' '}
            🎉
          </div>
        </OrganizationHistoryWrapper>
      );
    case 24:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit text-center ">
            Added an Opening:{' '}
            <Link target="_blank" href={'/explore?oid=' + history.openingID}>
              {history.opening?.title}
            </Link>{' '}
            🎉
          </div>
        </OrganizationHistoryWrapper>
      );
    case 27:
      return (
        <OrganizationHistoryWrapper history={history}>
          <div className="w-fit text-center ">
            Accepted the Application of :{' '}
            <Link target="_blank" href={'/explore/user/' + history.application?.user.username}>
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
