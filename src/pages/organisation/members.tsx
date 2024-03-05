import Loader from '@/components/common/loader';
import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { initialOrganization } from '@/types/initials';
import Toaster from '@/utils/toaster';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import { EnvelopeSimple, Info, Plus } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { currentOrgSelector } from '@/slices/orgSlice';
import OrgSidebar from '@/components/common/org_sidebar';
import InvitationCard from '@/components/organization/invitation_card';
import AddMembers from '@/sections/organization/members/add_members';
import MemberCard from '@/components/organization/member_card';
import OrgMembersOnlyAndProtect from '@/utils/wrappers/org_members_only';
import checkOrgAccess from '@/utils/funcs/check_org_access';
import { ORG_MANAGER } from '@/config/constants';
import WidthCheck from '@/utils/wrappers/widthCheck';
import AccessTree from '@/components/organization/access_tree';

const Members = () => {
  const [organization, setOrganization] = useState(initialOrganization);
  const [loading, setLoading] = useState(true);

  const currentOrg = useSelector(currentOrgSelector);

  const fetchData = async () => {
    const URL = `${ORG_URL}/${currentOrg.id}/membership`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      setOrganization(res.data.organization);
      setLoading(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [clickedOnAddMember, setClickedOnAddMember] = useState(false);
  const [clickedOnInvitations, setClickedOnInvitations] = useState(false);
  const [clickedOnInfo, setClickedOnInfo] = useState(false);

  return (
    <BaseWrapper title={`Memberships | ${currentOrg.title}`}>
      <OrgSidebar index={6} />
      <MainWrapper>
        <div className="w-full flex flex-col items-center">
          {clickedOnAddMember && (
            <AddMembers setShow={setClickedOnAddMember} organization={organization} setOrganization={setOrganization} />
          )}
          {clickedOnInfo && <AccessTree type="membership" setShow={setClickedOnInfo} />}
          <div className="w-full flex justify-between items-center p-base_padding">
            <div className="text-6xl font-semibold dark:text-white font-primary">
              {!clickedOnInvitations ? 'Members' : 'Invitations'}
            </div>
            <div className="w-fit flex items-center gap-2">
              {checkOrgAccess(ORG_MANAGER) && (
                <Plus
                  onClick={() => setClickedOnAddMember(true)}
                  size={42}
                  className="flex-center rounded-full hover:bg-white p-2 transition-ease-300 cursor-pointer"
                  weight="regular"
                />
              )}
              <EnvelopeSimple
                onClick={() => setClickedOnInvitations(prev => !prev)}
                size={42}
                className={`flex-center rounded-full ${
                  clickedOnInvitations ? 'bg-primary_comp_hover' : 'hover:bg-white'
                } p-2 transition-ease-300 cursor-pointer`}
                weight="regular"
              />
              <Info
                onClick={() => setClickedOnInfo(true)}
                size={42}
                className="flex-center rounded-full hover:bg-white p-2 transition-ease-300 cursor-pointer"
                weight="regular"
              />
            </div>
          </div>
          {loading ? (
            <Loader />
          ) : (
            <>
              <div className="w-full max-lg:w-screen mx-auto flex flex-col gap-8 px-6">
                {clickedOnInvitations
                  ? organization.invitations && (
                      <div className="w-full flex flex-wrap justify-between gap-4 max-lg:px-4 pb-4">
                        {organization.invitations.map(invitation => {
                          return (
                            <InvitationCard
                              key={invitation.id}
                              invitation={invitation}
                              setOrganization={setOrganization}
                            />
                          );
                        })}
                      </div>
                    )
                  : organization.memberships && (
                      <div className="w-full flex flex-wrap justify-between gap-4 max-lg:px-4 pb-4">
                        {organization.memberships.map(membership => {
                          return (
                            <MemberCard
                              key={membership.id}
                              membership={membership}
                              organization={organization}
                              setOrganization={setOrganization}
                            />
                          );
                        })}
                      </div>
                    )}
              </div>
            </>
          )}
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default WidthCheck(OrgMembersOnlyAndProtect(Members));
