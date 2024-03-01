import Loader from '@/components/common/loader';
import OrgSidebar from '@/components/common/org_sidebar';
import AccessTree from '@/components/organization/access_tree';
import ChatCard from '@/components/workspace/manage_project/chat_card';
import { ORG_MANAGER } from '@/config/constants';
import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import EditChat from '@/sections/organization/chats/edit_chat';
import NewChat from '@/sections/organization/chats/new_chat';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import { GroupChat } from '@/types';
import { initialGroupChat, initialOrganization } from '@/types/initials';
import checkOrgAccess from '@/utils/funcs/check_org_access';
import Toaster from '@/utils/toaster';
import OrgMembersOnlyAndProtect from '@/utils/wrappers/org_members_only';
import WidthCheck from '@/utils/wrappers/widthCheck';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import { Info, Plus } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const Chats = () => {
  const [organization, setOrganization] = useState(initialOrganization);
  const [chats, setChats] = useState<GroupChat[]>([]);
  const [loading, setLoading] = useState(true);

  const [clickedOnInfo, setClickedOnInfo] = useState(false);

  const [clickedOnNewChat, setClickedOnNewChat] = useState(false);
  const [clickedOnEditChat, setClickedOnEditChat] = useState(false);
  const [clickedEditChat, setClickedEditChat] = useState(initialGroupChat);

  const currentOrgID = useSelector(currentOrgIDSelector);

  const fetchChats = async () => {
    const URL = `${ORG_URL}/${currentOrgID}/chats`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      setChats(res.data.chats);
      setOrganization(res.data.organization);
      setLoading(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <BaseWrapper title="Chats">
      <OrgSidebar index={5} />
      <MainWrapper>
        <div className="w-full flex flex-col items-center gap-4">
          {clickedOnNewChat && (
            <NewChat setShow={setClickedOnNewChat} organization={organization} setChats={setChats} />
          )}
          {clickedOnInfo && <AccessTree type="chat" setShow={setClickedOnInfo} />}

          <div className="w-full flex justify-between items-center p-base_padding">
            <div className="text-6xl font-semibold dark:text-white font-primary">Chats</div>
            <div className="flex items-center gap-2">
              {checkOrgAccess(ORG_MANAGER) && (
                <Plus
                  onClick={() => setClickedOnNewChat(true)}
                  size={42}
                  className="flex-center rounded-full hover:bg-white p-2 transition-ease-300 cursor-pointer"
                  weight="regular"
                />
              )}
              <Info
                onClick={() => setClickedOnInfo(true)}
                size={42}
                className="flex-center rounded-full hover:bg-white p-2 transition-ease-300 cursor-pointer"
                weight="regular"
              />
            </div>
          </div>
          <div className="w-full flex flex-col gap-2">
            {loading ? (
              <Loader />
            ) : (
              chats && (
                <div className="flex justify-between px-6 pb-4">
                  <div
                    className={`${
                      clickedOnEditChat ? 'w-[50%]' : 'w-[720px] mx-auto'
                    } max-md:w-full flex flex-col gap-2`}
                  >
                    {chats.map(chat => {
                      return (
                        <ChatCard
                          key={chat.id}
                          chat={chat}
                          setClickedOnEditChat={setClickedOnEditChat}
                          clickedEditChat={clickedEditChat}
                          setClickedEditChat={setClickedEditChat}
                        />
                      );
                    })}
                  </div>
                  {clickedOnEditChat && (
                    <EditChat
                      chat={clickedEditChat}
                      organization={organization}
                      setStateChats={setChats}
                      setShow={setClickedOnEditChat}
                    />
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export async function getServerSideProps() {
  if (process.env.NODE_ENV != 'development') {
    return {
      redirect: {
        permanent: true,
        destination: '/organisation/posts',
      },
      props: {},
    };
  } else
    return {
      props: {},
    };
}

export default WidthCheck(OrgMembersOnlyAndProtect(Chats));
