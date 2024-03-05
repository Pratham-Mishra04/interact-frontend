import OrgSidebar from '@/components/common/org_sidebar';
import Sidebar from '@/components/common/sidebar';
import TabMenu from '@/components/common/tab_menu';
import SearchBar from '@/components/messaging/searchbar';
import GroupChat from '@/screens/messaging/chat/group';
import PersonalChat from '@/screens/messaging/chat/personal';
import Group from '@/screens/messaging/group';
import Personal from '@/screens/messaging/personal';
import Project from '@/screens/messaging/project';
import Request from '@/screens/messaging/request';
import NewGroup from '@/sections/messaging/new_group';
import { navbarOpenSelector } from '@/slices/feedSlice';
import {
  currentChatIDSelector,
  currentGroupChatIDSelector,
  messagingTabSelector,
  setMessagingTab,
} from '@/slices/messagingSlice';
import { userSelector } from '@/slices/userSlice';
import NonOrgOnlyAndProtect from '@/utils/wrappers/non_org_only';
import WidthCheck from '@/utils/wrappers/widthCheck';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import { PencilSimpleLine } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const Messaging = () => {
  const active = useSelector(messagingTabSelector);

  const open = useSelector(navbarOpenSelector);
  const currentChatID = useSelector(currentChatIDSelector);
  const currentGroupChatID = useSelector(currentGroupChatIDSelector);
  const [chatType, setChatType] = useState('personal');

  const [clickedOnNew, setClickedOnNew] = useState(false);
  const [clickedOnNewGroup, setClickedOnNewGroup] = useState(false);

  const dispatch = useDispatch();

  const user = useSelector(userSelector);

  useEffect(() => {
    setChatType(String(new URLSearchParams(window.location.search).get('chat')));
  }, [window.location.search]);

  useEffect(() => {
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
    <BaseWrapper title="Messaging | Interact">
      {user.isOrganization ? <OrgSidebar index={-1} /> : <Sidebar index={-1} />}
      <MainWrapper>
        <div
          onClick={() => setClickedOnNew(false)}
          className={`w-fit h-[calc(100vh-65px)] max-lg:h-fit mx-auto flex max-lg:flex-col ${
            open ? 'gap-2' : 'gap-16'
          } transition-ease-out-500 font-primary`}
        >
          {clickedOnNewGroup ? <NewGroup setShow={setClickedOnNewGroup} /> : <></>}
          {/* 100-(navbar+1) */}
          <div className="w-[37.5vw] max-lg:w-screen h-full flex flex-col pt-4 pl-4 max-lg:pl-0 gap-4 ">
            <div className="w-full flex items-center justify-between max-lg:px-4 relative">
              <div className="text-3xl font-extrabold text-gradient">Messaging</div>
              <PencilSimpleLine
                onClick={el => {
                  el.stopPropagation();
                  setClickedOnNew(prev => !prev);
                }}
                className="text-gray-600 dark:text-white cursor-pointer"
                size={32}
              />
              {clickedOnNew ? (
                <div className="w-1/3 flex flex-col gap-2 backdrop-blur-sm border-[1px] border-primary_btn  dark:border-dark_primary_btn dark:bg-dark_primary_comp dark:text-white font-primary p-2 absolute translate-y-full -bottom-2 right-0 rounded-md z-50">
                  {/* <div className="p-2 rounded-md hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active transition-ease-300 cursor-pointer">
                    New Chat
                  </div> */}
                  <div
                    onClick={() => {
                      setClickedOnNewGroup(true);
                      setClickedOnNew(false);
                    }}
                    className="p-2 rounded-md hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active transition-ease-300 cursor-pointer"
                  >
                    New Group
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
            <SearchBar />
            <TabMenu
              items={['Personal', 'Group', 'Project', 'Request']}
              active={active}
              setReduxState={setMessagingTab}
              width="100%"
              sticky={true}
            />
            <div className="w-full h-full overflow-y-auto">
              <div className={`${active === 0 ? 'block' : 'hidden'}`}>
                <Personal />
              </div>
              <div className={`${active === 1 ? 'block' : 'hidden'}`}>
                <Group />
              </div>
              <div className={`${active === 2 ? 'block' : 'hidden'} `}>
                <Project />
              </div>
              <div className={`${active === 3 ? 'block' : 'hidden'} `}>
                <Request />
              </div>
            </div>
          </div>
          <div
            className={`w-[37.5vw] max-lg:w-screen h-full max-lg:h-base sticky max-lg:fixed top-navbar p-2 max-lg:p-0 ${
              currentChatID == '' && currentGroupChatID == '' ? 'hidden' : ''
            } z-40 max-lg:z-30`}
          >
            {currentChatID == '' && currentGroupChatID == '' ? (
              <></>
            ) : (
              <>{chatType == 'group' ? <GroupChat /> : <PersonalChat />}</>
            )}
          </div>
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default WidthCheck(NonOrgOnlyAndProtect(Messaging));
