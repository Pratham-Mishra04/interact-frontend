import React from 'react';
import type { Event } from '@/types';
import Image from 'next/image';
import { EVENT_PIC_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import UserHoverCard from './user_hover_card';
import Link from 'next/link';
import { formatPrice } from '@/utils/funcs/misc';
import { EVENT_PIC_HASH_DEFAULT } from '@/config/constants';

interface Props {
  event: Event;
}

const getDurationInHours = (startTime: Date, endTime: Date) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end.getTime() - start.getTime();
  const durationHours = durationMs / (1000 * 60 * 60); // Convert milliseconds to hours
  return `${durationHours} hours`;
};

const EventCard = ({ event }: Props) => {
  const startDate = event.hackathon?.startTime ? new Date(event.hackathon.startTime) : null;
  const formattedMonth = startDate ? new Intl.DateTimeFormat('en-US', { month: 'short' }).format(startDate) : 'N/A';
  const formattedDay = startDate ? startDate.getDate() : 'N/A';

  const getPrizeAmount = () => {
    if (event.hackathon && event.hackathon.prizes) {
      return (
        '₹' +
        formatPrice(
          event.hackathon.prizes.reduce((acc, prize) => {
            acc = acc + prize.amount;
            return acc;
          }, 0)
        )
      );
    }
    return 'N/A';
  };

  const getTeamSize = () => {
    if (event.hackathon) {
      return `${event.hackathon.minTeamSize || 'N/A'}-${event.hackathon.maxTeamSize || 'N/A'}`;
    }
    return 'N/A';
  };

  return (
    <Link
      href={`/events/${event.id}`}
      className="relative w-full max-w-md bg-gray-100 dark:bg-dark_primary_comp_hover rounded-3xl p-4 hover:shadow-xl transition-ease-300 flex flex-col"
    >
      <div className="relative mb-4">
        <Image
          width={400}
          height={100}
          src={`${EVENT_PIC_URL}/${event?.coverPic}`}
          alt="Event Pic"
          className="w-full rounded-2xl overflow-hidden"
          placeholder="blur"
          blurDataURL={
            event.blurHash
              ? event.blurHash == 'no-hash'
                ? EVENT_PIC_HASH_DEFAULT
                : event.blurHash
              : EVENT_PIC_HASH_DEFAULT
          }
        />
        <div className="absolute bottom-[-10px] -left-4">
          <UserHoverCard
            trigger={
              <div className="bg-gray-100 dark:bg-dark_primary_comp_hover rounded-full p-3">
                <Image
                  crossOrigin="anonymous"
                  width={100}
                  height={100}
                  alt={'User Pic'}
                  src={`${USER_PROFILE_PIC_URL}/${event.organization.user.profilePic}`}
                  className="w-10 h-10 rounded-full"
                />
              </div>
            }
            user={event.organization.user}
          />
        </div>
      </div>
      <div className="flex flex-col flex-grow">
        <div className="space-y-2 mb-4 flex-grow">
          <h2 className="text-2xl font-semibold break-words">{event.title}</h2>
          <p className="text-gray-600 dark:text-gray-400 break-words line-clamp-1">{event.tagline}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-auto">
          <LowerCardItem
            title={event.hackathonID ? 'Prize' : 'Duration'}
            content={event.hackathonID ? getPrizeAmount() : getDurationInHours(event.startTime, event.endTime)}
          />
          <LowerCardItem
            title={event.hackathonID ? 'Team' : 'Location'}
            content={event.hackathonID ? getTeamSize() : event.location}
          />
          <LowerCardItem title="Date" content={`${formattedDay} ${formattedMonth}`} />
        </div>
      </div>
    </Link>
  );
};

const LowerCardItem = ({ title, content }: { title: string; content: string }) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-gray-500 font-medium dark:text-gray-300 text-center break-words">{title}</p>
      <p className="text-center break-words">{content}</p>
    </div>
  );
};

export default EventCard;
