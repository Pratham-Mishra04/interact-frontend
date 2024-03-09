import Loader from '@/components/common/loader';
import NoChats from '@/components/fillers/chats';
import GroupChatCard from '@/components/messaging/group_chat_card';
import { SERVER_ERROR } from '@/config/errors';
import { MESSAGING_URL } from '@/config/routes';
import socketService from '@/config/ws';
import getHandler from '@/handlers/get_handler';
import { userSelector } from '@/slices/userSlice';
import { GroupChat } from '@/types';
import { sortGroupChats } from '@/utils/funcs/sort_chats';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const Group = () => {
  const [chats, setChats] = useState<GroupChat[]>([]);
  const [filteredChats, setFilteredChats] = useState<GroupChat[]>([]);
  const [loading, setLoading] = useState(true);

  const currentChats = useSelector(userSelector).chats;

  const fetchChats = async () => {
    setLoading(true);
    const URL = `${MESSAGING_URL}/group`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      setChats(sortGroupChats(res.data.chats || []));
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
    socketService.setupGroupChatListRoutes(setChats);
  }, [currentChats]);

  useEffect(() => {
    filterChats(new URLSearchParams(window.location.search).get('search'));
  }, [window.location.search]);

  return (
    <div className="w-full flex flex-col gap-2 p-2">
      {loading ? (
        <Loader />
      ) : (
        <>
          {!new URLSearchParams(window.location.search).get('search') ? (
            <>
              {chats.length > 0 ? (
                <>
                  {chats.map(chat => {
                    return <GroupChatCard key={chat.id} chat={chat} />;
                  })}
                </>
              ) : (
                <NoChats />
              )}
            </>
          ) : (
            <>
              {filteredChats.length > 0 ? (
                <>
                  {filteredChats.map(chat => {
                    return <GroupChatCard key={chat.id} chat={chat} />;
                  })}
                </>
              ) : (
                <NoChats />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Group;
