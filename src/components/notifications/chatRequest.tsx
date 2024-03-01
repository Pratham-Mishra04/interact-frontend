import React from 'react';
import Link from 'next/link';
import { Notification } from '@/types';
import NotificationWrapper from '@/wrappers/notification';
import { userSelector } from '@/slices/userSlice';
import { useSelector } from 'react-redux';

interface Props {
  notification: Notification;
}

const ChatRequest = ({ notification }: Props) => {
  const loggedInUser = useSelector(userSelector);
  return (
    <NotificationWrapper notification={notification}>
      <span>
        <Link className="font-bold" href={`/explore/user/${notification.sender.username}`}>
          {notification.sender.name}
        </Link>{' '}
      </span>
      has initiated a chat.
    </NotificationWrapper>
  );
};

export default ChatRequest;
