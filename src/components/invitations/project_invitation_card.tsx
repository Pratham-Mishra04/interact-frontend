import { Invitation } from '@/types';
import React, { useState } from 'react';
import Image from 'next/image';
import { INVITATION_URL } from '@/config/routes';
import moment from 'moment';
import Link from 'next/link';
import Toaster from '@/utils/toaster';
import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';
import { useDispatch, useSelector } from 'react-redux';
import { setMemberProjects, userSelector } from '@/slices/userSlice';
import ConfirmDelete from '../common/confirm_delete';
import { setUnreadInvitations, unreadInvitationsSelector } from '@/slices/feedSlice';
import socketService from '@/config/ws';
import getInvitationStatus, { getInvitationStatusColor } from '@/utils/funcs/invitation';
import { getProjectPicHash, getProjectPicURL } from '@/utils/funcs/safe_extract';

interface Props {
  invitation: Invitation;
  setInvitations?: React.Dispatch<React.SetStateAction<Invitation[]>>;
}

const ProjectInvitationCard = ({ invitation, setInvitations }: Props) => {
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
      dispatch(setMemberProjects([...user.memberProjects, invitation.projectID]));
      dispatch(setUnreadInvitations(unreadInvitations - 1));
      Toaster.stopLoad(toaster, 'Invitation Accepted', 1);

      socketService.sendNotification(
        invitation.sender.id,
        `${user.name} accepted the invitation to join ${invitation.project.title}`
      );
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

      socketService.sendNotification(
        invitation.sender.id,
        `${user.name} rejected the invitation to join ${invitation.project.title}`
      );
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
      <Link target="_blank" href={`/projects/${invitation.project.slug}`}>
        <Image
          crossOrigin="anonymous"
          width={100}
          height={100}
          alt={'User Pic'}
          src={getProjectPicURL(invitation.project)}
          className={'rounded-md w-20 h-20'}
          placeholder="blur"
          blurDataURL={getProjectPicHash(invitation.project)}
        />
      </Link>
      <div className="w-[calc(100%-80px)] max-md:w-full flex max-md:flex-col max-md:text-center max-md:gap-4 items-center justify-between">
        <div
          style={{ width: invitation.status == 0 ? '100%-50px' : '100%-20px' }}
          className="w-[calc(100%-112px)] max-md:w-full flex flex-col gap-1"
        >
          <Link
            target="_blank"
            href={`/projects/${invitation.project.slug}`}
            className="text-xl font-bold text-gradient line-clamp-1"
          >
            {invitation.project.title}
          </Link>
          <div className="font-medium">Role: {invitation.title}</div>
          <div className="text-xs">Invited on {moment(invitation.createdAt).format('DD MMM YYYY')}</div>
        </div>
        {invitation.status == 0 ? (
          <div className="flex gap-4">
            <div
              onClick={handleAccept}
              style={{ backgroundColor: getInvitationStatusColor(1) }}
              className="w-fit px-5 py-2 text-sm font-medium border-[1px] border-primary_btn bg-green-100 hover:bg-green-200 active:bg-priority_low flex-center rounded-lg transition-ease-300 cursor-pointer"
            >
              Accept
            </div>
            <div
              onClick={() => setClickedOnReject(true)}
              style={{ backgroundColor: getInvitationStatusColor(-1) }}
              className="w-fit px-5 py-2 text-sm font-medium border-[1px] border-primary_btn bg-red-100 hover:bg-red-200 active:bg-priority_high flex-center rounded-lg transition-ease-300 cursor-pointer"
            >
              Reject
            </div>
          </div>
        ) : (
          <div
            className="w-fit px-3 py-1 text-xs font-medium rounded-full"
            style={{ backgroundColor: getInvitationStatusColor(invitation.status) }}
          >
            {getInvitationStatus(invitation.status)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectInvitationCard;
