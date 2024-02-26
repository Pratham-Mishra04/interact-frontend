import React from 'react';
import Link from 'next/link';
import { Notification } from '@/types';
import NotificationWrapper from '@/wrappers/notification';

interface Props {
  notification: Notification;
}

const Application = ({ notification }: Props) => {
  return (
    <NotificationWrapper notification={notification}>
      <Link className="font-bold z-50" href={`/explore/user/${notification.sender.username}`}>
        {notification.sender.name}
      </Link>{' '}
      applied for the opening of {notification.opening.title} at
      <Link className="font-bold" href={`/workspace/opening/${notification.opening.id}`}>
        {notification.notificationType == 20
          ? notification.opening.organization?.title
          : notification.opening.project?.title}
      </Link>
    </NotificationWrapper>
  );
};

export default Application;
