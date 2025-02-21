import React from 'react';
import Link from 'next/link';
import { Notification } from '@/types';
import NotificationWrapper from '@/wrappers/notification';

interface Props {
  notification: Notification;
  short?: boolean;
}

const Impressions = ({ notification, short = true }: Props) => {
  const getType = () => {
    switch (notification.notificationType) {
      case 14:
        return 'post';
      case 15:
        return `project (${notification.project.title})`;
      case 16:
        return `event (${notification.event.title})`;
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
        return '/projects/' + notification.project.slug;
      case 16:
        return '/events/' + notification.eventID;
      case 17:
        return '/explore/announcement/' + notification.announcementID;
      default:
        return '';
    }
  };
  const getContent = () => {
    var content = '';
    switch (notification.notificationType) {
      case 14:
        content = notification.post.content;
        break;
      case 17:
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
      image={false}
      extended={
        !short &&
        getContent() != '' && (
          <div className="w-fit max-w-[50%] text-xs rounded-md px-2 pt-1 bg-white dark:bg-dark_primary_comp_hover line-clamp-2">
            {getContent()}
          </div>
        )
      }
    >
      Your
      <Link className="font-bold capitalize" href={getRedirectURL()}>
        {getType()}
      </Link>
      got {notification.impressionCount} impressions!
    </NotificationWrapper>
  );
};

export default Impressions;
