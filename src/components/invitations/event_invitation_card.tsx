import { Invitation } from '@/types';
import React, { useState } from 'react';
import Image from 'next/image';
import { EVENT_PIC_URL, INVITATION_URL } from '@/config/routes';
import moment from 'moment';
import Link from 'next/link';
import Toaster from '@/utils/toaster';
import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';

interface Props {
  invitation: Invitation;
  setInvitations?: React.Dispatch<React.SetStateAction<Invitation[]>>;
}

const EventInvitationCard = ({ invitation, setInvitations }: Props) => {
  const [mutex, setMutex] = useState(false);

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
    <>
      {/* {clickedOnReject && (
        <ConfirmDelete setShow={setClickedOnReject} handleDelete={handleReject} title="Confirm Reject?" />
      )} */}
      <div className="w-[45%] font-primary bg-white border-[1px] border-primary_btn rounded-md flex-col items-center justify-start gap-6 p-4 hover:shadow-lg transition-ease-300">
        <Link target="_blank" href={`/explore/event/${invitation.eventID}`}>
          <Image
            crossOrigin="anonymous"
            width={100}
            height={60}
            alt="Event Pic"
            src={`${EVENT_PIC_URL}/${invitation.event?.coverPic}`}
            className="rounded-md w-full"
          />
        </Link>
        <div className="w-full flex flex-col text-center gap-4 items-center justify-between">
          <Link target="_blank" href={`/events/${invitation.event?.id}`} className="text-3xl font-bold text-gradient">
            {invitation.project.title}
          </Link>
          <Link target="_blank" href={`/explore/event/${invitation.eventID}`} className="text-2xl font-semibold">
            {invitation.title}
          </Link>
          <Link
            target="_blank"
            href={`/explore/organisation/${invitation.event?.organization.user.username}`}
            className="font-medium hover-underline-animation after:bg-black"
          >
            Hosted by {invitation.event?.organization.title}
          </Link>
          <div className="text-xs">Invited {moment(invitation.createdAt).format('DD MMM YYYY')}</div>
          {invitation.status == 0 ? (
            <div className="flex gap-4">
              <div
                onClick={handleAccept}
                className="w-24 h-10 font-semibold border-[1px] border-primary_btn  dark:border-dark_primary_btn dark:shadow-xl dark:text-white dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active flex-center rounded-lg transition-ease-300 cursor-pointer"
              >
                Accept
              </div>
              <div
                onClick={handleReject}
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
    </>
  );
};

export default EventInvitationCard;
