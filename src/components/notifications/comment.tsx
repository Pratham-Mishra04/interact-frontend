import React from 'react';
import Link from 'next/link';
import { Notification } from '@/types';
import NotificationWrapper from '@/wrappers/notification';
import renderContentWithLinks from '@/utils/funcs/render_content_with_links';

interface Props {
  notification: Notification;
  short?: boolean;
}

const Comment = ({ notification, short = true }: Props) => {
  const getType = () => {
    switch (notification.notificationType) {
      case 2:
        return 'post';
      case 4:
        return 'project';
      case 13:
        return 'event';
      case 19:
        return 'announcement';
      default:
        return '';
    }
  };
  const getRedirectURL = () => {
    switch (notification.notificationType) {
      case 2:
        return '/explore/post/' + notification.postID;
      case 4:
        return '/explore?pid=' + notification.project.slug;
      case 13:
        return '/explore/event/' + notification.eventID;
      case 19:
        return '/explore/announcement/' + notification.announcementID;
      default:
        return '';
    }
  };
  return (
    <NotificationWrapper
      notification={notification}
      extended={
        !short && (
          <div className="w-fit max-w-[50%] text-xs rounded-md px-2 pt-1 bg-white line-clamp-2">
            {notification.comment.content.replace(/\*\*|\^\^|```/g, '')}
          </div>
        )
      }
    >
      <Link className="font-bold" href={`/explore/user/${notification.sender.username}`}>
        {notification.sender.name}
      </Link>
      Commented on your
      <Link className="font-bold capitalize" href={getRedirectURL()}>
        {getType()}.
      </Link>{' '}
    </NotificationWrapper>
  );
};

export default Comment;
