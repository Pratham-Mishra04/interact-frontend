import React from 'react';
import Link from 'next/link';
import { Notification } from '@/types';
import NotificationWrapper from '@/wrappers/notification';

interface Props {
  notification: Notification;
}

const Impressions = ({ notification }: Props) => {
  const getType = () => {
    switch (notification.notificationType) {
      case 14:
        return 'post';
      case 15:
        return 'project';
      case 16:
        return 'event';
      case 17:
        return 'announcement';
      default:
        return '';
    }
  };
  const getRedirectURL = () => {
    switch (notification.notificationType) {
      case 14:
        return '/explore/post/' + notification.postID;
      case 15:
        return '/explore?pid=' + notification.project.slug;
      case 16:
        return '/explore/event/' + notification.eventID;
      case 17:
        return '/explore/announcement/' + notification.announcementID;
      default:
        return '';
    }
  };
  return (
    <NotificationWrapper notification={notification} image={false}>
      Your
      <Link className="font-bold capitalize" href={getRedirectURL()}>
        {getType()}
      </Link>{' '}
      got {notification.impressionCount} impressions!
    </NotificationWrapper>
  );
};

export default Impressions;
