import React from 'react';
import Link from 'next/link';
import { Notification } from '@/types';
import NotificationWrapper from '@/wrappers/notification';

interface Props {
  notification: Notification;
  short?: boolean;
}

const Liked = ({ notification, short = true }: Props) => {
  const getType = () => {
    switch (notification.notificationType) {
      case 1:
        return 'post';
      case 3:
        return `project (${notification.project.title})`;
      case 12:
        return `event (${notification.event.title})`;
      case 18:
        return 'announcement';
      default:
        return '';
    }
  };
  const getRedirectURL = () => {
    switch (notification.notificationType) {
      case 1:
        return '/explore/post/' + notification.postID;
      case 3:
        return '/explore?pid=' + notification.project.slug;
      case 12:
        return '/explore/event/' + notification.eventID;
      case 18:
        return '/explore/announcement/' + notification.announcementID;
      default:
        return '';
    }
  };
  const getContent = () => {
    var content = '';
    switch (notification.notificationType) {
      case 1:
        content = notification.post.content;
        break;
      case 18:
        content = notification.announcement.content;
        break;
      default:
        return '';
    }

    const regex = /\*\*|\^\^|```/g;
    return content.replace(regex, '');
  };
  return (
    <NotificationWrapper
      notification={notification}
      extended={
        !short &&
        getContent() != '' && (
          <div className="w-fit max-w-[50%] text-xs rounded-md px-2 pt-1 bg-white line-clamp-2">{getContent()}</div>
        )
      }
    >
      <Link className="font-bold" href={`/explore/user/${notification.sender.username}`}>
        {notification.sender.name}
      </Link>
      Liked your{' '}
      <Link className="font-bold capitalize" href={getRedirectURL()}>
        {getType()}.
      </Link>{' '}
    </NotificationWrapper>
  );
};

export default Liked;
