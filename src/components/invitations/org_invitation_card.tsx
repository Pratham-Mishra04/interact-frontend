import { Invitation, OrganizationMembership } from '@/types';
import React, { useState } from 'react';
import Image from 'next/image';
import { INVITATION_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import moment from 'moment';
import Link from 'next/link';
import Toaster from '@/utils/toaster';
import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';
import { useDispatch, useSelector } from 'react-redux';
import { setOrganizationMemberships, userSelector } from '@/slices/userSlice';
import ConfirmDelete from '../common/confirm_delete';
import { setExploreTab, setUnreadInvitations, unreadInvitationsSelector } from '@/slices/feedSlice';
import { ORG_MEMBER } from '@/config/constants';
import getInvitationStatus, { getInvitationStatusColor } from '@/utils/funcs/invitation';

interface Props {
  invitation: Invitation;
  setInvitations?: React.Dispatch<React.SetStateAction<Invitation[]>>;
}

const OrgInvitationCard = ({ invitation, setInvitations }: Props) => {
  const [mutex, setMutex] = useState(false);
  const [clickedOnReject, setClickedOnReject] = useState(false);

  const user = useSelector(userSelector);

  const unreadInvitations = useSelector(unreadInvitationsSelector);

  const dispatch = useDispatch();

  const handleAccept = async () => {
    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Accepting Invitation...');
    const URL = `${INVITATION_URL}/accept/${invitation.id}`;

    const res = await getHandler(URL);
    if (res.statusCode === 200) {
      if (setInvitations)
        setInvitations(prev =>
          prev.map(i => {
            if (i.id == invitation.id) return { ...invitation, status: 1 };
            return i;
          })
        );
      const membership: OrganizationMembership = {
        id: '',
        organizationID: invitation.organizationID,
        organization: invitation.organization,
        userID: invitation.userID,
        user: invitation.user,
        role: ORG_MEMBER,
        title: invitation.title,
        teams: [],
        createdAt: new Date(),
      };
      dispatch(setOrganizationMemberships([...(user.organizationMemberships || []), membership]));
      dispatch(setUnreadInvitations(unreadInvitations - 1));
      Toaster.stopLoad(toaster, 'Invitation Accepted', 1);
    } else {
      Toaster.stopLoad(toaster, res.data.message || SERVER_ERROR, 0);
    }

    setMutex(false);
  };

  const handleReject = async () => {
    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Rejecting Invitation...');
    const URL = `${INVITATION_URL}/reject/${invitation.id}`;

    const res = await getHandler(URL);
    if (res.statusCode === 200) {
      if (setInvitations)
        setInvitations(prev =>
          prev.map(i => {
            if (i.id == invitation.id) return { ...invitation, status: -1 };
            return i;
          })
        );
      dispatch(setUnreadInvitations(unreadInvitations - 1));
      setClickedOnReject(false);
      Toaster.stopLoad(toaster, 'Invitation Rejected', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }

    setMutex(false);
  };

  return (
    <div className="w-full font-primary bg-white dark:bg-transparent dark:text-white border-[1px] border-primary_btn  dark:border-dark_primary_btn rounded-md flex max-md:flex-col items-center justify-start gap-4 p-4 transition-ease-300 animate-fade_third">
      {clickedOnReject && (
        <ConfirmDelete setShow={setClickedOnReject} handleDelete={handleReject} title="Confirm Reject?" />
      )}
      <Link
        onClick={() => dispatch(setExploreTab(3))}
        target="_blank"
        href={`/organisations/${invitation.organization.user.username}`}
      >
        <Image
          crossOrigin="anonymous"
          width={100}
          height={100}
          alt={'User Pic'}
          src={`${USER_PROFILE_PIC_URL}/${invitation.organization.user.profilePic}`}
          placeholder="blur"
          blurDataURL={invitation.organization.user.profilePicBlurHash || 'no-hash'}
          className="w-20 h-20 rounded-full"
        />
      </Link>
      <Link
        target="_blank"
        onClick={() => dispatch(setExploreTab(3))}
        href={`/organisations/${invitation.organization.user.username}`}
        className="w-[calc(100%-80px)] max-md:w-full flex max-md:flex-col max-md:text-center max-md:gap-4 items-center justify-between"
      >
        <div
          style={{ width: invitation.status == 0 ? '100%-50px' : '100%-20px' }}
          className="max-md:w-full flex flex-col gap-1"
        >
          <div className="text-xl font-bold text-gradient line-clamp-1">{invitation.organization.title}</div>
          <div className="font-medium">Role: {invitation.title}</div>
          <div className="text-xs">Invited on {moment(invitation.createdAt).format('DD MMM YYYY')}</div>
        </div>
        {invitation.status == 0 ? (
          <div className="flex gap-4">
            <div
              onClick={el => {
                el.preventDefault();
                handleAccept();
              }}
              className="w-fit px-5 py-2 text-sm font-medium border-[1px] border-primary_btn bg-green-100 hover:bg-green-200 active:bg-priority_low flex-center rounded-lg transition-ease-300 cursor-pointer"
            >
              Accept
            </div>
            <div
              onClick={el => {
                el.preventDefault();
                setClickedOnReject(true);
              }}
              className="w-fit px-5 py-2 text-sm font-medium border-[1px] border-primary_btn bg-red-100 hover:bg-red-200 active:bg-priority_high flex-center rounded-lg transition-ease-300 cursor-pointer"
            >
              Reject
            </div>
          </div>
        ) : (
          <div
            className="w-fit px-3 py-1 text-sm font-medium rounded-full"
            style={{ backgroundColor: getInvitationStatusColor(invitation.status) }}
          >
            {getInvitationStatus(invitation.status)}
          </div>
        )}
      </Link>
    </div>
  );
};

export default OrgInvitationCard;
