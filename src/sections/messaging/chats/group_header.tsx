import React from 'react';
import Image from 'next/image';
import { ArrowArcLeft, Info } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { setCurrentChatID } from '@/slices/messagingSlice';
import { GROUP_CHAT_PIC_URL } from '@/config/routes';
import { Chat } from '@/types';

interface Props {
  chat: Chat;
  setClickedOnInfo: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatHeader = ({ chat, setClickedOnInfo }: Props) => {
  const dispatch = useDispatch();
  return (
    <div className="w-full h-[72px] max-md:h-[64px] dark:text-white font-primary flex justify-between gap-2 items-center border-b-[1px] border-primary_btn  dark:border-dark_primary_btn pb-2">
      <div className="flex gap-2 items-center">
        <ArrowArcLeft onClick={() => dispatch(setCurrentChatID(''))} className="lg:hidden" size={24} />
        <Image
          crossOrigin="anonymous"
          className="w-12 h-12 rounded-full object-cover"
          width={50}
          height={50}
          alt="/"
          src={`${GROUP_CHAT_PIC_URL}/${chat.coverPic}`}
        />
        <div className="flex flex-col">
          <div className="text-lg font-medium">{chat.title}</div>
          {chat.projectID ? (
            <div className="text-xs">@{chat.project?.title}</div>
          ) : (
            chat.organizationID && <div className="text-xs">@{chat.organization?.title}</div>
          )}
        </div>
      </div>
      <Info onClick={() => setClickedOnInfo(true)} className="cursor-pointer" size={32} />
    </div>
  );
};

export default ChatHeader;
