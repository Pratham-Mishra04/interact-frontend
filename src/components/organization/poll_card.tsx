import React, { useState } from 'react';
import Image from 'next/image';
import { ORG_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import moment from 'moment';
import { Announcement, Organization, Poll, Post } from '@/types';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import { SERVER_ERROR } from '@/config/errors';
import Toaster from '@/utils/toaster';
import deleteHandler from '@/handlers/delete_handler';
import ConfirmDelete from '../common/confirm_delete';
import { ORG_SENIOR } from '@/config/constants';
import { ListChecks, Lock, LockOpen, RadioButton } from '@phosphor-icons/react';
import OptionComponent from './poll_option';
import Link from 'next/link';

interface Props {
  poll: Poll;
  organisation: Organization;
  setPolls?: React.Dispatch<React.SetStateAction<any[]>>;
  hoverShadow?: boolean;
}

const PollCard = ({ poll, setPolls, organisation, hoverShadow = true }: Props) => {
  const [clickedOnDelete, setClickedOnDelete] = useState(false);
  const user = useSelector(userSelector);

  const handleDelete = async () => {
    const toaster = Toaster.startLoad('Deleting Poll...');

    const URL = `${ORG_URL}/${poll.organizationID}/polls/${poll.id}`;

    const res = await deleteHandler(URL);

    if (res.statusCode === 204) {
      if (setPolls) setPolls(prev => prev.filter(p => p.id != poll.id));
      setClickedOnDelete(false);
      Toaster.stopLoad(toaster, 'Poll Deleted', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  return (
    <>
      {clickedOnDelete ? <ConfirmDelete handleDelete={handleDelete} setShow={setClickedOnDelete} /> : <></>}
      <div
        className={`w-full max-w-3xl mx-auto bg-white flex gap-1 p-4 border-[1px] border-gray-300 rounded-xl ${
          hoverShadow ? 'hover:shadow-xl' : ''
        } transition-ease-300 z-[1]`}
      >
        <Link
          href={`/explore/organisation/${organisation.user.username}`}
          target="_blank"
          className="h-full flex items-center gap-2"
        >
          <Image
            crossOrigin="anonymous"
            width={100}
            height={100}
            alt={'User Pic'}
            src={`${USER_PROFILE_PIC_URL}/${organisation.user.profilePic}`}
            className="rounded-full w-8 h-8"
          />
        </Link>

        <div className="grow max-w-[94%] max-md:max-w-[85%] flex flex-col gap-2">
          <div className="w-full flex justify-between items-center">
            <Link
              href={
                user.id == organisation.userID
                  ? '/organisation/profile'
                  : `/explore/organisation/${organisation.user.username}`
              }
              target="_blank"
              className="flex items-center gap-2 font-medium"
            >
              {organisation.user.name}
              <div className="text-xs font-normal text-gray-500">@{organisation.user.username}</div>
            </Link>
            <div className="text-gray-400 text-xs">{moment(poll.createdAt).fromNow()}</div>
          </div>
          <div className="w-full flex flex-col gap-2">
            <div className="text-xl font-medium">{poll.title}</div>
            <div className="text-sm">{poll.content}</div>
          </div>
          <div className="w-full flex flex-col gap-3">
            {poll.options?.map(option => (
              <OptionComponent
                key={option.id}
                option={option}
                orgID={organisation.id}
                pollID={poll.id}
                setPolls={setPolls}
                totalVotes={poll.totalVotes}
              />
            ))}
          </div>

          <div className="w-full flex justify-between items-center">
            <div className="flex justify-between gap-4">
              <div className="text-sm text-gray-400 font-medium">
                {poll.totalVotes} Vote{poll.totalVotes != 1 ? 's' : ''}
              </div>

              {((user.isOrganization && user.id == organisation.userID) ||
                user.organizationMemberships
                  .filter(m => m.role == ORG_SENIOR)
                  .map(m => m.organizationID)
                  .includes(organisation.id)) && (
                <div onClick={() => setClickedOnDelete(true)} className="text-sm text-primary_danger cursor-pointer">
                  Delete
                </div>
              )}
            </div>
            <div className="flex justify-end items-center gap-4 text-sm text-gray-400 font-medium">
              <div className="flex-center gap-1">
                {poll.isOpen ? (
                  <>
                    <LockOpen /> <div>Open</div>
                  </>
                ) : (
                  <>
                    <Lock /> <div>Only for members</div>
                  </>
                )}
              </div>
              <div className="flex-center gap-1">
                {poll.isMultiAnswer ? (
                  <>
                    <ListChecks /> <div>Multiple Options</div>
                  </>
                ) : (
                  <>
                    <RadioButton /> <div>Single Option</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PollCard;
