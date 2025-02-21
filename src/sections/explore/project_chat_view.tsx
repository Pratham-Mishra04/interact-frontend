import GroupChatCard from '@/components/messaging/group_chat_card';
import socketService from '@/config/ws';
import ChatScreen from '@/screens/messaging/chat/chat_screen';
import { Chat } from '@/types';
import { initialChat } from '@/types/initials';
import ModalWrapper from '@/wrappers/modal';
import React, { useEffect, useState } from 'react';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  projectID: string;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
}

const ProjectChatView = ({ setShow, projectID, chats, setChats }: Props) => {
  const [clickedChat, setClickedChat] = useState(initialChat);

  useEffect(() => {
    document.documentElement.style.overflowY = 'hidden';
    document.documentElement.style.height = '100vh';

    return () => {
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.height = 'auto';
    };
  }, []);

  useEffect(() => {
    socketService.setupChatListRoutes(setChats);
  }, [projectID]);

  return (
    <ModalWrapper setShow={setShow} width="4/5" height="4/5" blur={true} modalStyles={{ top: '50%' }}>
      <div className="w-full h-full flex gap-4 overflow-hidden">
        <div className="w-3/5 max-md:w-full">
          <ChatScreen projectWindow initialChatState={clickedChat} projectID={projectID} />
        </div>
        <div className="w-2/5 flex flex-col gap-4 max-md:hidden overflow-auto border-l-[1px] border-gray-200 dark:border-dark_primary_btn pl-4">
          {chats.map(chat => {
            return <GroupChatCard setChat={setClickedChat} key={chat.id} chat={chat} setChats={setChats} />;
          })}
        </div>
      </div>
    </ModalWrapper>
  );
};

export default ProjectChatView;
