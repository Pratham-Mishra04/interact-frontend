import React from 'react';
import { Notification } from '@/types';
import NotificationWrapper from '@/wrappers/notification';

interface Props {
  notification: Notification;
}

const Welcome = ({ notification }: Props) => {
  return (
    <NotificationWrapper notification={notification} image={false}>
      <div className="w-fit text-center flex-center gap-4">
        Woohoo! You made it to <div className="font-semibold">Interact 🎉🥳</div>
      </div>
    </NotificationWrapper>
  );
};

export default Welcome;
