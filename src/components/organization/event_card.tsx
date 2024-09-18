import React from 'react';
import Image from 'next/image';
import { Event } from '@/types';
import Link from 'next/link';
import { EVENT_PIC_URL } from '@/config/routes';
import { Buildings, ClockCounterClockwise, Eye, Gavel, PencilSimple, Trash, Users } from '@phosphor-icons/react';
import moment from 'moment';
import checkOrgAccess, { checkParticularOrgAccess } from '@/utils/funcs/access';
import { ORG_SENIOR } from '@/config/constants';

interface Props {
  event: Event;
  size?: number | string;
  org?: boolean;
  setClickedOnViewHistory?: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedOnEditEvent?: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedOnEditCollaborators?: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedOnEditCoHosts?: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedEditEvent?: React.Dispatch<React.SetStateAction<Event>>;
  setClickedOnDeleteEvent?: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedDeleteEvent?: React.Dispatch<React.SetStateAction<Event>>;
  setClickedOnEditJudges?: React.Dispatch<React.SetStateAction<boolean>>;
}

const EventCard = ({
  event,
  size = 96,
  org = false,
  setClickedOnViewHistory,
  setClickedOnEditEvent,
  setClickedOnEditCollaborators,
  setClickedOnEditCoHosts,
  setClickedEditEvent,
  setClickedOnDeleteEvent,
  setClickedDeleteEvent,
  setClickedOnEditJudges,
}: Props) => {
  const variants = ['w-96', 'w-84', 'w-80', 'w-72', 'w-64', 'w-[22rem]'];
  return (
    <Link
      href={`/explore/event/${event.id}`}
      target="_blank"
      className={`w-${size} rounded-xl hover:shadow-xl transition-ease-out-500 animate-fade_third`}
    >
      <div className="w-full relative group">
        <div className="flex gap-1 top-2 right-2 absolute bg-white text-gray-500 text-xxs px-2 py-1 rounded-lg">
          <Eye size={12} /> <div>{event.noImpressions}</div>
        </div>
        <Image
          width={200}
          height={200}
          src={`${EVENT_PIC_URL}/${event.coverPic}`}
          alt=""
          className={`w-full ${size == 96 ? 'h-56' : size == 64 ? 'h-[160px]' : 'h-[180px]'} object-cover rounded-t-xl`}
          placeholder="blur"
          blurDataURL={event.blurHash || 'no-hash'}
        />
        {org && checkOrgAccess(ORG_SENIOR) && (
          <div className="w-full flex gap-2 absolute opacity-0 group-hover:opacity-100 top-2 left-2 transition-ease-300">
            {checkParticularOrgAccess(ORG_SENIOR, event.organization) && !event.hackathonID && (
              <div
                onClick={el => {
                  el.stopPropagation();
                  el.preventDefault();
                  if (setClickedDeleteEvent) setClickedDeleteEvent(event);
                  if (setClickedOnDeleteEvent) setClickedOnDeleteEvent(true);
                }}
                className=" bg-white text-gray-500 text-xxs px-2 py-1 rounded-lg "
              >
                <Trash size={18} />
              </div>
            )}
            <div
              onClick={el => {
                el.stopPropagation();
                el.preventDefault();
                if (setClickedEditEvent) setClickedEditEvent(event);
                if (setClickedOnEditEvent) setClickedOnEditEvent(true);
              }}
              className="bg-white text-gray-500 text-xxs px-2 py-1 rounded-lg"
            >
              <PencilSimple size={18} />
            </div>
            <div
              onClick={el => {
                el.stopPropagation();
                el.preventDefault();
                if (setClickedEditEvent) setClickedEditEvent(event);
                if (setClickedOnEditCollaborators) setClickedOnEditCollaborators(true);
              }}
              className="bg-white text-gray-500 text-xxs px-2 py-1 rounded-lg"
            >
              <Users size={18} />
            </div>
            {checkParticularOrgAccess(ORG_SENIOR, event.organization) && (
              <div
                onClick={el => {
                  el.stopPropagation();
                  el.preventDefault();
                  if (setClickedEditEvent) setClickedEditEvent(event);
                  if (event.hackathonID) {
                    if (setClickedOnEditJudges) setClickedOnEditJudges(true);
                  } else {
                    if (setClickedOnEditCoHosts) setClickedOnEditCoHosts(true);
                  }
                }}
                className="bg-white text-gray-500 text-xxs px-2 py-1 rounded-lg"
              >
                {event.hackathonID ? <Gavel size={18} /> : <Buildings size={18} />}
              </div>
            )}
            <div
              onClick={el => {
                el.stopPropagation();
                el.preventDefault();
                if (setClickedEditEvent) setClickedEditEvent(event);
                if (setClickedOnViewHistory) setClickedOnViewHistory(true);
              }}
              className="bg-white text-gray-500 text-xxs px-2 py-1 rounded-lg"
            >
              <ClockCounterClockwise size={18} />
            </div>
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-white text-gray-500 text-xxs px-2 py-1 rounded-lg">
          {event.organization.title}
        </div>
        {event.hackathonID && (
          <div className="absolute bottom-2 left-2 bg-white text-gray-500 text-xxs px-2 py-1 rounded-lg">
            Competition
          </div>
        )}
      </div>
      <div className="w-full h-20 bg-white rounded-b-xl flex p-4">
        <div className="w-1/6 flex items-start justify-start mt-1">
          <div className="w-fit flex flex-col items-end">
            <div className={`w-fit ${size == 96 ? 'text-xs' : 'text-xxs'} uppercase transition-ease-out-500`}>
              {moment(event.startTime).format('MMM')}
            </div>
            <div className={`w-fit ${size == 96 ? 'text-3xl' : 'text-2xl'} font-semibold transition-ease-out-500`}>
              {moment(event.startTime).format('DD')}
            </div>
          </div>
        </div>
        <div className={`w-5/6 ${size == 96 ? 'h-20' : 'h-16'} flex flex-col transition-ease-out-500`}>
          <div className="font-medium text-lg line-clamp-1">{event.title}</div>
          <div className={`${size == 96 ? 'text-sm ' : 'text-xs'} text-gray-500 line-clamp-2 transition-ease-out-500`}>
            {event.tagline}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
