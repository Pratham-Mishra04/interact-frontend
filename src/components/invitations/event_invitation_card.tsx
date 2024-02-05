import { Invitation } from '@/types';
import React, { useState } from 'react';
import Image from 'next/image';
import { EVENT_PIC_URL, INVITATION_URL, PROJECT_PIC_URL } from '@/config/routes';
import moment from 'moment';
import Link from 'next/link';
import Toaster from '@/utils/toaster';
import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';
import { useDispatch, useSelector } from 'react-redux';
import { setMemberProjects, userSelector } from '@/slices/userSlice';
import ConfirmDelete from '../common/confirm_delete';
import { setUnreadInvitations, unreadInvitationsSelector } from '@/slices/feedSlice';

interface Props {
  invitation: Invitation;
  setInvitations?: React.Dispatch<React.SetStateAction<Invitation[]>>;
}

const EventInvitationCard = ({ invitation, setInvitations }: Props) => {
  const [mutex, setMutex] = useState(false);
  const [clickedOnReject, setClickedOnReject] = useState(false);

  // const user = useSelector(userSelector);

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
      // dispatch(setMemberProjects([...user.memberProjects, invitation.projectID]));
      dispatch(setUnreadInvitations(unreadInvitations - 1));
      Toaster.stopLoad(toaster, 'Invitation Accepted', 1);
    } else {
      if (res.data.message) {
        Toaster.stopLoad(toaster, res.data.message, 0);
      } else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
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
    <div className="w-full font-primary bg-white dark:bg-transparent dark:text-white border-[1px] border-primary_btn  dark:border-dark_primary_btn rounded-md flex max-md:flex-col items-center justify-start gap-6 p-6 transition-ease-300">
      {clickedOnReject ? (
        <ConfirmDelete setShow={setClickedOnReject} handleDelete={handleReject} title="Confirm Reject?" />
      ) : (
        <></>
      )}
      <Link target="_blank" href={`/explore?pid=${invitation.project.slug}`}>
        <Image
          crossOrigin="anonymous"
          width={100}
          height={100}
          alt={'User Pic'}
          src={`${EVENT_PIC_URL}/${invitation.event?.coverPic}`}
          className="rounded-md w-32 h-32"
        />
      </Link>
      <div className="grow flex max-md:flex-col max-md:text-center max-md:gap-4 items-center justify-between">
        <div className="grow flex flex-col gap-2">
          <Link target="_blank" href={`/events/${invitation.event?.id}`} className="text-3xl font-bold text-gradient">
            {invitation.project.title}
          </Link>
          <div className="font-semibold">{invitation.title}</div>
          <div className="font-medium">{'Member'}</div>
          <div className="text-xs">Invited {moment(invitation.createdAt).format('DD MMM YYYY')}</div>
        </div>
        {invitation.status == 0 ? (
          <div className="flex gap-4">
            <div
              onClick={handleAccept}
              className="w-24 h-10 font-semibold border-[1px] border-primary_btn  dark:border-dark_primary_btn dark:shadow-xl dark:text-white dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active flex-center rounded-lg transition-ease-300 cursor-pointer"
            >
              Accept
            </div>
            <div
              onClick={() => setClickedOnReject(true)}
              className="w-24 h-10 font-semibold border-[1px] border-primary_btn  dark:border-dark_primary_btn dark:shadow-xl dark:text-white dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active flex-center rounded-lg transition-ease-300 cursor-pointer"
            >
              Reject
            </div>
          </div>
        ) : (
          <div className="w-24 h-10 font-semibold border-[1px] border-primary_btn  dark:border-dark_primary_btn dark:shadow-xl dark:text-white dark:bg-dark_primary_comp_hover flex-center rounded-lg cursor-default">
            {invitation.status == 1 ? 'Accepted' : 'Rejected'}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventInvitationCard;
