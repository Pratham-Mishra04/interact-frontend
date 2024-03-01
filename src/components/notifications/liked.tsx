import React from 'react';
import Link from 'next/link';
import { Notification } from '@/types';
import NotificationWrapper from '@/wrappers/notification';

interface Props {
  notification: Notification;
}

const Liked = ({ notification }: Props) => {
  const getType = () => {
    switch (notification.notificationType) {
      case 1:
        return 'post';
      case 3:
        return 'project';
      case 12:
        return 'event';
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
  return (
    <NotificationWrapper notification={notification}>
      <span>
        <Link className="font-bold" href={`/explore/user/${notification.sender.username}`}>
          {notification.sender.name}
        </Link>{' '}
      </span>
      liked your
      <span>
        {' '}
        <Link className="font-bold capitalize" href={getRedirectURL()}>
          {getType()}.
        </Link>{' '}
      </span>
    </NotificationWrapper>
  );
};

export default Liked;
