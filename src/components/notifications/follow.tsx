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
      <div>
        <span>
          <Link className="font-bold" href={`/explore/user/${notification.sender.username}`}>
            {notification.sender.name}
          </Link>{' '}
        </span>
        started following you.
      </div>
    </NotificationWrapper>
  );
};

export default Follow;
