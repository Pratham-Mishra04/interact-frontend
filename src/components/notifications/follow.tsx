import React from 'react';
import Link from 'next/link';
import { Notification } from '@/types';
import NotificationWrapper from '@/wrappers/notification';

interface Props {
  notification: Notification;
}

const Follow = ({ notification }: Props) => {
  return (
    <NotificationWrapper notification={notification}>
      <Link className="font-bold" href={`/explore/user/${notification.sender.username}`}>
        {notification.sender.name}
      </Link>{' '}
      started following you.
    </NotificationWrapper>
  );
};

export default Follow;
