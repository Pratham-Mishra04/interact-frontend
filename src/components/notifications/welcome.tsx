import { Notification } from '@/types';
import NotificationWrapper from '@/wrappers/notification';
import React from 'react';

interface Props {
  notification: Notification;
}

const Welcome = ({ notification }: Props) => {
  return (
    <NotificationWrapper notification={notification} image={false}>
      <div className="w-fit text-center flex-center gap-4">
        <div className="">
          Woohoo! You made it to <b>Interact</b> 🎉🥳
        </div>
      </div>
    </NotificationWrapper>
  );
};

export default Welcome;
