import Loader from '@/components/common/loader';
import NoChats from '@/components/fillers/chats';
import GroupChatCard from '@/components/messaging/group_chat_card';
import { SERVER_ERROR } from '@/config/errors';
import { MESSAGING_URL } from '@/config/routes';
import socketService from '@/config/ws';
import getHandler from '@/handlers/get_handler';
import { userSelector } from '@/slices/userSlice';
import { Chat } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

interface Props {
  type?: string;
  setUnreadChatCounts: React.Dispatch<React.SetStateAction<number[]>>;
}

const Group = ({ type, setUnreadChatCounts }: Props) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const currentChats = useSelector(userSelector).chats;

  const fetchChats = async () => {
    setLoading(true);
    const URL = `${MESSAGING_URL}/group${type ? `?type=${type}` : ''}`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      setChats(res.data.chats || []);
      setFilteredChats(res.data.chats || []);
      setLoading(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  const filterChats = (search: string | null) => {
    if (!search || search == '') setFilteredChats(chats);
    else
      setFilteredChats(
        chats.filter(chat => {
          if (chat.title.match(new RegExp(search, 'i'))) return true;
          return false;
        })
      );
  };

  useEffect(() => {
    fetchChats();
    socketService.setupChatListRoutes(setChats);
  }, [currentChats]);

  useEffect(() => {
    filterChats(new URLSearchParams(window.location.search).get('search'));
  }, [window.location.search]);

  return (
    <div className="w-full flex flex-col gap-2 p-2 max-md:p-0">
      {loading ? (
        <Loader />
      ) : !new URLSearchParams(window.location.search).get('search') ? (
        chats.length > 0 ? (
          chats.map(chat => {
            return (
              <GroupChatCard key={chat.id} chat={chat} setChats={setChats} setUnreadChatCounts={setUnreadChatCounts} />
            );
          })
        ) : (
          <NoChats />
        )
      ) : filteredChats.length > 0 ? (
        filteredChats.map(chat => {
          return (
            <GroupChatCard key={chat.id} chat={chat} setChats={setChats} setUnreadChatCounts={setUnreadChatCounts} />
          );
        })
      ) : (
        <NoChats />
      )}
    </div>
  );
};

export default Group;
