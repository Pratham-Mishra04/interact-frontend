import NoChats from '@/components/fillers/project_chats';
import GroupChatCard from '@/components/messaging/group_chat_card';
import { PROJECT_MANAGER } from '@/config/constants';
import { SERVER_ERROR } from '@/config/errors';
import { MEMBERSHIP_URL, MESSAGING_URL, PROJECT_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import ProjectChatView from '@/sections/explore/project_chat_view';
import NewGroup from '@/sections/messaging/new_group';
import { userSelector } from '@/slices/userSlice';
import { Chat } from '@/types';
import { checkProjectAccess } from '@/utils/funcs/access';
import Toaster from '@/utils/toaster';
import PrimeWrapper from '@/wrappers/prime';
import { Loader } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const ProjectChats = ({ projectID }: { projectID: string }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    const URL = `${PROJECT_URL}/chats/${projectID}`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      setChats(res.data.chats);
      setLoading(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  useEffect(() => {
    fetchChats();
  }, [projectID]);

  const [clickedOnChat, setClickedOnChat] = useState(false);

  const user = useSelector(userSelector);

  return (
    <PrimeWrapper>
      {clickedOnChat && (
        <ProjectChatView setShow={setClickedOnChat} projectID={projectID} chats={chats} setChats={setChats} />
      )}
      <div className="space-y-4">
        <div className="w-full flex items-center justify-between">
          <div className="md:text-2xl font-semibold">Project Chats</div>
          {checkProjectAccess(user, PROJECT_MANAGER, projectID) && (
            <NewGroup
              userFetchURL={`${MEMBERSHIP_URL}/members/${projectID}`}
              userFetchURLQuery="&exclude_user=false"
              submitURL={`${MESSAGING_URL}/project/${projectID}`}
              setStateChats={setChats}
            />
          )}
        </div>
        {loading ? (
          <Loader />
        ) : chats && chats.length > 0 ? (
          <div className={`max-md:w-full flex flex-col gap-4`}>
            {chats.map(chat => {
              return (
                <GroupChatCard
                  key={chat.id}
                  chat={chat}
                  setChats={setChats}
                  setClickedOnChat={setClickedOnChat}
                  wider
                />
              );
            })}
          </div>
        ) : (
          <NoChats />
        )}
      </div>
    </PrimeWrapper>
  );
};

export default ProjectChats;
