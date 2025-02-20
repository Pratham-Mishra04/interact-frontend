import React from 'react';
import Image from 'next/image';
import { Event } from '@/types';
import Link from 'next/link';
import { EVENT_PIC_URL } from '@/config/routes';
import { Buildings, ClockCounterClockwise, Eye, Gavel, PencilSimple, Trash, Users } from '@phosphor-icons/react';
import moment from 'moment';
import { EVENT_PIC_HASH_DEFAULT } from '@/config/constants';

interface Props {
  event: Event;
  smaller?: boolean;
  isSenior?: boolean;
  isManager?: boolean;
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
  smaller = false,
  isSenior = false,
  isManager = false,
  setClickedOnViewHistory,
  setClickedOnEditEvent,
  setClickedOnEditCollaborators,
  setClickedOnEditCoHosts,
  setClickedEditEvent,
  setClickedOnDeleteEvent,
  setClickedDeleteEvent,
  setClickedOnEditJudges,
}: Props) => {
  return (
    <Link
      href={`/events/${event.id}`}
      target="_blank"
      className="w-full rounded-xl hover:shadow-xl transition-ease-out-500 animate-fade_third"
    >
      <div className="w-full relative group">
        <div className="flex gap-1 top-2 right-2 absolute bg-white dark:bg-dark_primary_comp_hover text-gray-500 dark:text-white text-xxs px-2 py-1 rounded-lg">
          <Eye size={12} /> <div>{event.noImpressions}</div>
        </div>
        <Image
          width={300}
          height={100}
          src={`${EVENT_PIC_URL}/${event.coverPic}`}
          alt="Event Cover"
          className="w-full object-cover rounded-t-xl"
          placeholder="blur"
          blurDataURL={
            event.blurHash
              ? event.blurHash == 'no-hash'
                ? EVENT_PIC_HASH_DEFAULT
                : event.blurHash
              : EVENT_PIC_HASH_DEFAULT
          }
        />
        {isSenior && (
          <div className="w-full flex gap-2 absolute opacity-0 group-hover:opacity-100 top-2 left-2 transition-ease-300">
            {isSenior && !event.hackathonID && (
              <div
                onClick={el => {
                  el.stopPropagation();
                  el.preventDefault();
                  if (setClickedDeleteEvent) setClickedDeleteEvent(event);
                  if (setClickedOnDeleteEvent) setClickedOnDeleteEvent(true);
                }}
                className=" bg-white dark:bg-dark_primary_comp_hover text-gray-500 dark:text-white text-xxs px-2 py-1 rounded-lg"
              >
                <Trash size={18} />
              </div>
            )}
            <div
              onClick={el => {
                el.stopPropagation();
                el.preventDefault();
                {
                  if (event.hackathonID) {
                    window.location.assign('/organisation/competition/' + event.id);
                  } else {
                    if (setClickedEditEvent) setClickedEditEvent(event);
                    if (setClickedOnEditJudges) setClickedOnEditJudges(true);
                  }
                }
              }}
              className="bg-white dark:bg-dark_primary_comp_hover text-gray-500 dark:text-white text-xxs px-2 py-1 rounded-lg"
            >
              <PencilSimple size={18} />
            </div>

            {isManager && (
              <>
                <div
                  onClick={el => {
                    el.stopPropagation();
                    el.preventDefault();
                    if (setClickedEditEvent) setClickedEditEvent(event);
                    if (setClickedOnEditCollaborators) setClickedOnEditCollaborators(true);
                  }}
                  className="bg-white dark:bg-dark_primary_comp_hover text-gray-500 dark:text-white text-xxs px-2 py-1 rounded-lg"
                >
                  <Users size={18} />
                </div>
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
                  className="bg-white dark:bg-dark_primary_comp_hover text-gray-500 dark:text-white text-xxs px-2 py-1 rounded-lg"
                >
                  {event.hackathonID ? <Gavel size={18} /> : <Buildings size={18} />}
                </div>
              </>
            )}
            <div
              onClick={el => {
                el.stopPropagation();
                el.preventDefault();
                if (setClickedEditEvent) setClickedEditEvent(event);
                if (setClickedOnViewHistory) setClickedOnViewHistory(true);
              }}
              className="bg-white dark:bg-dark_primary_comp_hover text-gray-500 dark:text-white text-xxs px-2 py-1 rounded-lg"
            >
              <ClockCounterClockwise size={18} />
            </div>
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-white dark:bg-dark_primary_comp_hover text-gray-500 dark:text-white text-xxs px-2 py-1 rounded-lg">
          {event.organization.title}
        </div>
        {event.hackathonID && (
          <div className="absolute bottom-2 left-2 bg-white dark:bg-dark_primary_comp_hover text-gray-500 dark:text-white text-xxs px-2 py-1 rounded-lg">
            Competition
          </div>
        )}
      </div>
      <div className="w-full h-20 bg-gray-50 dark:bg-dark_primary_comp_hover rounded-b-xl flex p-4">
        <div className="w-1/6 flex items-start justify-start mt-1">
          <div className="w-fit flex flex-col items-end">
            <div className={`w-fit ${!smaller ? 'text-xs' : 'text-xxs'} uppercase transition-ease-out-500`}>
              {moment(event.startTime).format('MMM')}
            </div>
            <div className={`w-fit ${!smaller ? 'text-3xl' : 'text-2xl'} font-semibold transition-ease-out-500`}>
              {moment(event.startTime).format('DD')}
            </div>
          </div>
        </div>
        <div className={`w-5/6 ${!smaller ? 'h-20' : 'h-16'} flex flex-col transition-ease-out-500`}>
          <div className="font-medium text-lg line-clamp-1">{event.title}</div>
          <div
            className={`${
              !smaller ? 'text-sm ' : 'text-xs'
            } text-gray-500 dark:text-gray-300 line-clamp-2 transition-ease-out-500`}
          >
            {event.tagline}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
