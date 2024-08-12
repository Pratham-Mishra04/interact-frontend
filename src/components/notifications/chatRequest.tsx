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
  const getMessage = () => {
    switch (notification.notificationType) {
      case 9:
        return `${notification.sender.name} has initiated a chat.`;
      default:
        return 'New chat request received.';
    }
  };

  const getRedirectURL = () => {
    switch (notification.notificationType) {
      case 9:
        return `/explore/user/${notification.sender.username}`;
      default:
        return '';
    }
  };

  return (
    <NotificationWrapper notification={notification}>
      <Link className="font-bold capitalize" href={getRedirectURL()}>
        {notification.sender.name}
      </Link>{' '}
      {getMessage()}
    </NotificationWrapper>
  );
};

export default ChatRequest;
