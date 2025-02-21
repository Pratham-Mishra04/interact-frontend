import { Message } from '@/types';
import React from 'react';
import Image from 'next/image';
import { USER_PROFILE_PIC_URL } from '@/config/routes';
import Cookies from 'js-cookie';
import moment from 'moment';
import EventCard from '../cards/event';

interface Props {
  message: Message;
}

const SharedEventMessage = ({ message }: Props) => {
  const userID = Cookies.get('id');
  return (
    <div key={message.id} className={`w-full flex gap-2 ${message.userID === userID ? 'flex-row-reverse' : ''}`}>
      <Image
        crossOrigin="anonymous"
        width={50}
        height={50}
        alt={'User Pic'}
        src={`${USER_PROFILE_PIC_URL}/${message.user.profilePic}`}
        className={'rounded-full w-8 h-8 cursor-pointer border-[1px] border-black'}
      />
      <div className={`w-3/5 max-md:w-2/3 flex flex-wrap gap-2 ${message.userID === userID ? 'flex-row-reverse' : ''}`}>
        <div className="w-full max-w-[27rem] flex flex-col text-sm cursor-default gap-2">
          {message.event && <EventCard event={message.event} />}
          {message.content != '' && (
            <div className="bg-primary_comp dark:bg-dark_primary_comp_hover rounded-lg px-4 py-2">
              {message.content}
            </div>
          )}
        </div>
        <div
          className={`flex items-center gap-1 text-xs self-end ${message.userID === userID ? 'flex-row-reverse' : ''}`}
        >
          <div>•</div>
          <div> {moment(message.createdAt).format('hh:mm A')}</div>
        </div>
      </div>
    </div>
  );
};

export default SharedEventMessage;
