import ColoredTag from '@/components/common/colored_tag';
import ConfirmDelete from '@/components/common/confirm_delete';
import ConfirmOTP from '@/components/common/confirm_otp';
import { ORG_MANAGER } from '@/config/constants';
import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import deleteHandler from '@/handlers/delete_handler';
import getHandler from '@/handlers/get_handler';
import { useOrgAccess } from '@/hooks/use-org-access';
import EditMember from '@/sections/organization/members/edit_member';
import AddMemberToTeam from '@/sections/organization/teams/add_member_dropdown';
import TeamsDropdown from '@/sections/organization/teams/teams_dropdown';
import { currentOrgSelector } from '@/slices/orgSlice';
import { setOrganizationMemberships, userSelector } from '@/slices/userSlice';
import { Organization, OrganizationMembership } from '@/types';
import { initialOrganizationMembership } from '@/types/initials';
import checkOrgAccess from '@/utils/funcs/access';
import { getRoleColor } from '@/utils/funcs/membership';
import Toaster from '@/utils/toaster';
import { Pen, Trash } from '@phosphor-icons/react';
import moment from 'moment';
import Image from 'next/image';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

interface Props {
  memberships: OrganizationMembership[];
  organization: Organization;
  setOrganization: React.Dispatch<React.SetStateAction<Organization>>;
}

const OrgMembersTable = ({ memberships, organization, setOrganization }: Props) => {
  const [clickedMembership, setClickedMembership] = useState(initialOrganizationMembership);
  const [clickedOnEditMembership, setClickedOnEditMembership] = useState(false);
  const [clickedOnRemoveMember, setClickedOnRemoveMember] = useState(false);
  const [clickedOnLeaveOrg, setClickedOnLeaveOrg] = useState(false);
  const [clickedOnConfirmLeave, setClickedOnConfirmLeave] = useState(false);
  const [clickedOnAddToTeam, setClickedOnAddToTeam] = useState(false);
  const [clickedOnViewTeams, setClickedOnViewTeams] = useState(false);

  const user = useSelector(userSelector);
  const currentOrg = useSelector(currentOrgSelector);

  const isManager = useOrgAccess(ORG_MANAGER);

  const dispatch = useDispatch();

  const handleRemove = async () => {
    const toaster = Toaster.startLoad('Removing Member...');

    const URL = `${ORG_URL}/${currentOrg.id}/membership/${clickedMembership.id}`;

    const res = await deleteHandler(URL);
    if (res.statusCode === 204) {
      setOrganization(prev => {
        return {
          ...prev,
          memberships: prev.memberships.filter(m => m.id != clickedMembership.id),
        };
      });
      setClickedOnRemoveMember(false);
      Toaster.stopLoad(toaster, 'Member Removed', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  const sendOTP = async () => {
    const toaster = Toaster.startLoad('Sending OTP');

    const URL = `${ORG_URL}/${currentOrg.id}/membership/delete`;

    const res = await getHandler(URL);
    if (res.statusCode === 200) {
      Toaster.stopLoad(toaster, 'OTP Sent to your registered mail', 1);
      setClickedOnLeaveOrg(false);
      setClickedOnConfirmLeave(true);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  const handleLeaveOrg = async (otp: string) => {
    const toaster = Toaster.startLoad('Leaving Organisation...');

    const URL = `${ORG_URL}/${currentOrg.id}/membership`;

    const res = await deleteHandler(URL, { otp });
    if (res.statusCode === 204) {
      dispatch(
        setOrganizationMemberships(
          user.organizationMemberships.filter(membership => membership.organizationID != currentOrg.id)
        )
      );
      Toaster.stopLoad(toaster, 'Left Organisation', 1);
      setClickedOnConfirmLeave(false);
      window.location.assign('/home');
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };
  return (
    <div className="w-full flex flex-col gap-2">
      {clickedOnEditMembership && (
        <EditMember
          membership={clickedMembership}
          organization={organization}
          setShow={setClickedOnEditMembership}
          setOrganization={setOrganization}
        />
      )}
      {clickedOnRemoveMember && (
        <ConfirmDelete setShow={setClickedOnRemoveMember} handleDelete={handleRemove} title="Confirm Remove?" />
      )}
      {clickedOnLeaveOrg && (
        <ConfirmDelete setShow={setClickedOnLeaveOrg} handleDelete={sendOTP} title="Leave Organisation?" />
      )}
      {clickedOnConfirmLeave && <ConfirmOTP setShow={setClickedOnConfirmLeave} handleSubmit={handleLeaveOrg} />}

      <div className="w-full h-12 bg-white rounded-xl border-gray-400 flex font-semibold text-primary_black">
        <div className="w-[30%] max-md:w-[40%] flex-center">Name</div>
        <div className="w-[20%] max-md:w-[30%] flex-center">Title</div>
        <div className="w-[20%] max-md:hidden flex-center">Teams</div>
        <div className="w-[10%] max-md:w-[15%] flex-center">Role</div>
        <div className="w-[10%] max-md:hidden flex-center">Joined On</div>
        {isManager && <div className="w-[10%] max-md:w-[15%] flex-center"></div>}
      </div>
      {memberships.map(membership => (
        <div
          key={membership.user.id}
          className="w-full h-14 relative bg-white rounded-xl border-gray-400 flex text-sm text-primary_black transition-ease-300"
        >
          <div className="w-[30%] max-md:w-[40%] flex-center gap-2 px-4">
            <Image
              crossOrigin="anonymous"
              width={50}
              height={50}
              alt={'User Pic'}
              src={`${USER_PROFILE_PIC_URL}/${membership.user.profilePic}`}
              placeholder="blur"
              blurDataURL={membership.user.profilePicBlurHash || 'no-hash'}
              className="w-8 h-8 rounded-full z-[1]"
            />
            <div className="w-[calc(100%-24px)] flex max-md:flex-col md:items-center flex-wrap gap-1 max-md:gap-0">
              <div className="font-medium text-lg max-md:text-sm line-clamp-1">{membership.user.name}</div>
              <div className="text-xs max-md:text-xxs">@{membership.user.username}</div>
            </div>
          </div>
          <div className="w-[20%] max-md:w-[30%] flex-center max-md:text-xxs line-clamp-1">{membership.title}</div>
          <div className="w-[20%] max-md:hidden flex-center gap-2">
            {clickedOnAddToTeam && clickedMembership.id == membership.id && (
              <AddMemberToTeam
                setShow={setClickedOnAddToTeam}
                membership={membership}
                setOrganization={setOrganization}
              />
            )}
            {clickedOnViewTeams && clickedMembership.id == membership.id && (
              <TeamsDropdown setShow={setClickedOnViewTeams} membership={membership} />
            )}
            {membership.teams && membership.teams.length > 0 && (
              <>
                {membership.teams.map((team, index) => {
                  if (index == 0) return <ColoredTag key={team.id} tag={team.title} color={team.color} />;
                })}
                {membership.teams.length > 1 && (
                  <ColoredTag
                    onClick={() => {
                      setClickedMembership(membership);
                      setClickedOnViewTeams(true);
                    }}
                    tag={<div className="cursor-pointer">{`+${membership.teams.length - 1}`}</div>}
                  />
                )}
              </>
            )}
            <ColoredTag
              onClick={() => {
                setClickedMembership(membership);
                setClickedOnAddToTeam(true);
              }}
              tag={<div className="cursor-pointer">+</div>}
            />
          </div>
          <div className="w-[10%] max-md:w-[15%] flex-center">
            <div
              className="w-fit px-3 max-md:px-2 py-1 text-xs max-md:text-xxs font-medium rounded-full"
              style={{ backgroundColor: getRoleColor(membership.role) }}
            >
              {membership.role}
            </div>
          </div>{' '}
          <div className="w-[10%] max-md:hidden flex-center">
            {moment(membership.createdAt).format('DD MMMM, YYYY')}
          </div>
          {isManager ? (
            <div className="w-[10%] max-md:w-[15%] flex-center gap-4 max-md:gap-1">
              {user.id != membership.userID && (
                <Pen
                  onClick={() => {
                    setClickedMembership(membership);
                    setClickedOnEditMembership(true);
                  }}
                  className="max-md:w-4 max-md:h-4 cursor-pointer"
                  size={20}
                />
              )}
              {user.id != membership.userID ? (
                <Trash
                  onClick={() => {
                    setClickedMembership(membership);
                    setClickedOnRemoveMember(true);
                  }}
                  className="max-md:w-4 max-md:h-4 cursor-pointer"
                  size={20}
                />
              ) : (
                <div
                  onClick={() => setClickedOnLeaveOrg(true)}
                  className="max-md:text-xxs text-primary_danger font-medium cursor-pointer"
                >
                  Leave
                </div>
              )}
            </div>
          ) : (
            user.id == membership.userID && (
              <div
                onClick={() => setClickedOnLeaveOrg(true)}
                className="w-[10%] max-md:w-[15%] flex-center max-md:text-xxs text-primary_danger font-medium cursor-pointer"
              >
                Leave
              </div>
            )
          )}
        </div>
      ))}
    </div>
  );
};

export default OrgMembersTable;
