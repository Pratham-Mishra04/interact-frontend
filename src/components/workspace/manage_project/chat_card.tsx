import { Chat } from '@/types';
import React from 'react';
import Image from 'next/image';
import { GROUP_CHAT_PIC_URL } from '@/config/routes';

interface Props {
  chat: Chat;
  clickedChat: Chat;
  setClickedEditChat: React.Dispatch<React.SetStateAction<Chat>>;
}

const ChatCard = ({ chat, clickedChat, setClickedEditChat }: Props) => {
  return (
    <div
      onClick={() => setClickedEditChat(chat)}
      className={`w-full font-primary dark:text-white ${
        chat.id == clickedChat.id
          ? 'bg-primary_comp_hover dark:bg-dark_primary_comp_hover'
          : 'bg-white hover:bg-primary_comp dark:bg-transparent dark:hover:bg-dark_primary_comp'
      } border-[1px] border-primary_btn  dark:border-dark_primary_btn rounded-lg flex gap-4 px-5 py-4 cursor-pointer transition-ease-300`}
    >
      <Image
        crossOrigin="anonymous"
        width={50}
        height={50}
        alt={'User Pic'}
        src={`${GROUP_CHAT_PIC_URL}/${chat.coverPic}`}
        className={'rounded-full w-14 h-14 cursor-pointer border-[1px] border-black'}
      />
      <div className="w-full flex flex-col gap-1">
        <div className="w-full flex items-center justify-between">
          <div className="text-xl font-semibold">{chat.title}</div>{' '}
        </div>
        <div className="w-full line-clamp-2 font-light">
          <span className="mr-2 font-medium">
            • {chat.memberships?.length || 0} Member{chat.memberships?.length == 1 ? '' : 's'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatCard;
