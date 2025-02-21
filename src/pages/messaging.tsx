import OrgSidebar from '@/components/common/org_sidebar';
import Sidebar from '@/components/common/sidebar';
import TabMenu from '@/components/common/tab_menu';
import SearchBar from '@/components/messaging/searchbar';
import { SERVER_ERROR } from '@/config/errors';
import { EXPLORE_URL, MESSAGING_URL } from '@/config/routes';
import socketService from '@/config/ws';
import getHandler from '@/handlers/get_handler';
import ChatScreen from '@/screens/messaging/chat/chat_screen';
import Group from '@/screens/messaging/group';
import Personal from '@/screens/messaging/personal';
import NewGroup from '@/sections/messaging/new_group';
import { navbarOpenSelector } from '@/slices/feedSlice';
import { currentChatIDSelector, messagingTabSelector, setMessagingTab } from '@/slices/messagingSlice';
import { userSelector } from '@/slices/userSlice';
import Toaster from '@/utils/toaster';
import NonOrgOnlyAndProtect from '@/utils/wrappers/non_org_only';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const Messaging = () => {
  const active = useSelector(messagingTabSelector);

  const open = useSelector(navbarOpenSelector);
  const currentChatID = useSelector(currentChatIDSelector);

  const [unreadChatCounts, setUnreadChatCounts] = useState<number[]>([0, 0, 0, 0]);

  const dispatch = useDispatch();

  const user = useSelector(userSelector);

  const fetchCounts = async () => {
    const URL = `${MESSAGING_URL}/unread/counts`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      setUnreadChatCounts(res.data.counts || [0, 0, 0, 0]);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  useEffect(() => {
    fetchCounts();
    socketService.connect();

    const tab = new URLSearchParams(window.location.search).get('tab') || '';
    switch (tab) {
      case 'personal':
        dispatch(setMessagingTab(0));
        break;
      case 'group':
        dispatch(setMessagingTab(1));
        break;
      case 'project':
        dispatch(setMessagingTab(2));
        break;
      case 'request':
        dispatch(setMessagingTab(3));
        break;
      default:
    }
  }, []);

  return (
    <BaseWrapper title="Messaging">
      {user.isOrganization ? <OrgSidebar index={-1} /> : <Sidebar index={-1} />}
      <MainWrapper>
        <div
          className={`w-full md:w-fit mx-auto h-base_md max-lg:h-fit flex max-lg:flex-col ${
            open ? 'gap-2' : 'gap-16'
          } transition-ease-out-500 font-primary`}
        >
          {/* 100-(navbar+1) */}
          <div className="w-[37.5vw] max-lg:w-full h-full flex flex-col gap-4 ">
            <div className="w-full flex items-center justify-between relative">
              <div className="text-3xl font-extrabold text-gradient">Messaging</div>
              <NewGroup userFetchURL={`${EXPLORE_URL}/users?order=trending`} submitURL={`${MESSAGING_URL}/group`} />
            </div>
            <SearchBar />
            <TabMenu
              items={['Personal', 'Group', 'Project', 'Request']}
              itemSupers={unreadChatCounts}
              active={active}
              setReduxState={setMessagingTab}
              width="100%"
              sticky={true}
            />
            <div className="w-full h-full overflow-y-auto">
              <div className={`${active === 0 ? 'block' : 'hidden'}`}>
                <Personal setUnreadChatCounts={setUnreadChatCounts} />
              </div>
              <div className={`${active === 1 ? 'block' : 'hidden'}`}>
                <Group setUnreadChatCounts={setUnreadChatCounts} />
              </div>
              <div className={`${active === 2 ? 'block' : 'hidden'} `}>
                <Group setUnreadChatCounts={setUnreadChatCounts} type="projects" />
              </div>
              <div className={`${active === 3 ? 'block' : 'hidden'} `}>
                <Personal setUnreadChatCounts={setUnreadChatCounts} requests={true} />
              </div>
            </div>
          </div>
          <div
            className={`w-[37.5vw] max-lg:w-screen h-full max-lg:h-screen sticky max-lg:fixed max-lg:-translate-x-4 top-navbar max-lg:top-0 p-2 max-lg:p-0 ${
              currentChatID == '' ? 'hidden' : ''
            } max-lg:z-50`}
          >
            {currentChatID != '' && <ChatScreen />}
          </div>
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default NonOrgOnlyAndProtect(Messaging);
