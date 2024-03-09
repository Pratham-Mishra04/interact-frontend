import Loader from '@/components/common/loader';
import Sidebar from '@/components/common/sidebar';
import TabMenu from '@/components/common/tab_menu';
import NoChatInvitations from '@/components/fillers/chat_invitations';
import NoProjectInvitations from '@/components/fillers/project_invitations';
import ChatInvitationCard from '@/components/invitations/chat_invitation_card';
import OrgInvitationCard from '@/components/invitations/org_invitation_card';
import ProjectInvitationCard from '@/components/invitations/project_invitation_card';
import { SERVER_ERROR } from '@/config/errors';
import { INVITATION_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { invitationsTabSelector, setInvitationsTab } from '@/slices/feedSlice';
import { Invitation } from '@/types';
import Toaster from '@/utils/toaster';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import NonOrgOnlyAndProtect from '@/utils/wrappers/non_org_only';

const Invitations = () => {
  const active = useSelector(invitationsTabSelector);
  const [projectInvitations, setProjectInvitations] = useState<Invitation[]>([]);
  const [groupChatInvitations, setGroupChatInvitations] = useState<Invitation[]>([]);
  const [orgInvitations, setOrgInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvitations = async () => {
    setLoading(true);
    const URL = `${INVITATION_URL}/me`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      const invitationData = res.data.invitations;
      setProjectInvitations(
        invitationData.filter((invitation: Invitation) => invitation.projectID && invitation.projectID != '')
      );
      setGroupChatInvitations(
        invitationData.filter((invitation: Invitation) => invitation.chatID && invitation.chatID != '')
      );
      setOrgInvitations(
        invitationData.filter((invitation: Invitation) => invitation.organizationID && invitation.organizationID != '')
      );
      setLoading(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);
  return (
    <BaseWrapper title="Invitations | Interact">
      <Sidebar index={5} />
      <MainWrapper>
        <div
          className={`w-full max-lg:w-full flex flex-col items-center gap-4 transition-ease-out-500 pt-20 pb-base_padding`}
        >
          <TabMenu
            items={['Projects', 'Group Chats', 'Organizations']}
            active={active}
            setReduxState={setInvitationsTab}
          />
          {loading ? (
            <Loader />
          ) : (
            <>
              <div className={`w-full ${active === 0 ? 'block' : 'hidden'}`}>
                <div className="w-full flex flex-col gap-6 p-2">
                  {projectInvitations.length > 0 ? (
                    <div className="w-[720px] max-md:w-full max-md:px-4 mx-auto flex flex-col gap-4">
                      {projectInvitations.map(invitation => {
                        return (
                          <ProjectInvitationCard
                            key={invitation.id}
                            invitation={invitation}
                            setInvitations={setProjectInvitations}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <NoProjectInvitations />
                  )}
                </div>
              </div>
              <div className={`w-full ${active === 1 ? 'block' : 'hidden'} `}>
                <div className="w-full flex flex-col gap-6 p-2">
                  {groupChatInvitations.length > 0 ? (
                    <div className="w-[720px] max-md:w-full max-md:px-4 mx-auto flex flex-col gap-4">
                      {groupChatInvitations.map(invitation => {
                        return (
                          <ChatInvitationCard
                            key={invitation.id}
                            invitation={invitation}
                            setInvitations={setGroupChatInvitations}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <NoChatInvitations />
                  )}
                </div>
              </div>
              <div className={`w-full ${active === 2 ? 'block' : 'hidden'}`}>
                <div className="w-full flex flex-col gap-6 p-2">
                  {orgInvitations.length > 0 ? (
                    <div className="w-[720px] max-md:w-full max-md:px-4 mx-auto flex flex-col gap-4">
                      {orgInvitations.map(invitation => {
                        return (
                          <OrgInvitationCard
                            key={invitation.id}
                            invitation={invitation}
                            setInvitations={setOrgInvitations}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <NoProjectInvitations />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default NonOrgOnlyAndProtect(Invitations);
