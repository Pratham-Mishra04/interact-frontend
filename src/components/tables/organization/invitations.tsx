import ConfirmDelete from '@/components/common/confirm_delete';
import { ORG_MANAGER } from '@/config/constants';
import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import deleteHandler from '@/handlers/delete_handler';
import { useOrgAccess } from '@/hooks/use-org-access';
import { currentOrgSelector } from '@/slices/orgSlice';
import { Invitation, Organization } from '@/types';
import { initialInvitation } from '@/types/initials';
import getInvitationStatus, { getInvitationStatusColor } from '@/utils/funcs/invitation';
import Toaster from '@/utils/toaster';
import { Trash } from '@phosphor-icons/react';
import moment from 'moment';
import Image from 'next/image';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

interface Props {
  invitations: Invitation[];
  setOrganization: React.Dispatch<React.SetStateAction<Organization>>;
}

const OrgInvitationsTable = ({ invitations, setOrganization }: Props) => {
  const [clickedInvitation, setClickedInvitation] = useState(initialInvitation);
  const [clickedOnWithdraw, setClickedOnWithdraw] = useState(false);

  const currentOrgID = useSelector(currentOrgSelector).id;

  const isManager = useOrgAccess(ORG_MANAGER);

  const handleWithdraw = async (invitation: Invitation) => {
    const toaster = Toaster.startLoad('Withdrawing Invitation...');

    const URL = `${ORG_URL}/${currentOrgID}/membership/withdraw/${invitation.id}`;

    const res = await deleteHandler(URL);

    if (res.statusCode === 204) {
      setOrganization(prev => {
        return {
          ...prev,
          invitations: prev.invitations.filter(inv => inv.id != invitation.id),
        };
      });
      setClickedInvitation(initialInvitation);
      setClickedOnWithdraw(false);
      Toaster.stopLoad(toaster, 'Invitation Withdrawn', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {clickedOnWithdraw && (
        <ConfirmDelete
          setShow={setClickedOnWithdraw}
          handleDelete={() => handleWithdraw(clickedInvitation)}
          title="Confirm Withdraw?"
        />
      )}

      <div className="w-full h-12 bg-white rounded-xl border-gray-400 flex font-semibold text-primary_black">
        <div className="w-[25%] max-md:w-[40%] flex-center">Name</div>
        <div className="w-[15%] max-md:w-[30%] flex-center">Title</div>
        <div className="w-[10%] max-md:w-[20%] flex-center">Status</div>
        <div className="w-[20%] max-md:hidden flex-center">Invited By</div>
        <div className="w-[20%] max-md:hidden flex-center">Invited At</div>
        <div className="w-[10%] flex-center"></div>
      </div>
      {invitations.map(invitation => (
        <div
          key={invitation.user.id}
          className="w-full h-12 bg-white rounded-xl border-gray-400 flex text-sm text-primary_black transition-ease-300"
        >
          <div className="w-[25%] max-md:w-[40%] flex-center gap-1 px-4">
            <Image
              crossOrigin="anonymous"
              width={50}
              height={50}
              alt={'User Pic'}
              src={`${USER_PROFILE_PIC_URL}/${invitation.user.profilePic}`}
              placeholder="blur"
              blurDataURL={invitation.user.profilePicBlurHash || 'no-hash'}
              className="w-8 h-8 rounded-full z-[1]"
            />
            <div className="w-[calc(100%-32px)] flex max-md:flex-col md:items-center flex-wrap gap-1 max-md:gap-0">
              <div className="font-medium text-lg max-md:text-sm line-clamp-1">{invitation.user.name}</div>
              <div className="text-xs max-md:text-xxs">@{invitation.user.username}</div>
            </div>
          </div>
          <div className="w-[15%] max-md:w-[30%] flex-center max-md:text-xxs">{invitation.title}</div>
          <div className="w-[10%] max-md:w-[20%] flex-center">
            <div
              className="w-fit px-3 max-md:px-2 py-1 text-xs max-md:text-xxs font-medium rounded-full"
              style={{ backgroundColor: getInvitationStatusColor(invitation.status) }}
            >
              {getInvitationStatus(invitation.status)}
            </div>
          </div>
          <div className="w-[20%] max-md:hidden flex-center gap-1 px-4">
            <Image
              crossOrigin="anonymous"
              width={50}
              height={50}
              alt={'User Pic'}
              src={`${USER_PROFILE_PIC_URL}/${invitation.sender.profilePic}`}
              placeholder="blur"
              blurDataURL={invitation.sender.profilePicBlurHash || 'no-hash'}
              className="w-6 h-6 rounded-full z-[1]"
            />
            <div className="flex items-center flex-wrap gap-1">
              <div className="font-medium text-sm">{invitation.sender.name}</div>
              <div className="text-xxs">@{invitation.sender.username}</div>
            </div>
          </div>
          <div className="w-[20%] max-md:hidden flex-center">
            {moment(invitation.createdAt).format('DD MMMM, YYYY')}
          </div>
          <div className="w-[10%] flex-center">
            {isManager && invitation.status == 0 && (
              <Trash
                onClick={() => {
                  setClickedInvitation(invitation);
                  setClickedOnWithdraw(true);
                }}
                className="max-md:w-4 max-md:h-4 cursor-pointer"
                size={20}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrgInvitationsTable;
