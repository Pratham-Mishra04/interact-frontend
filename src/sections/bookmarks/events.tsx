import { EventBookmark } from '@/types';
import React from 'react';
import { ArrowArcLeft } from '@phosphor-icons/react';
import EventCard from '@/components/organization/event_card';
import { navbarOpenSelector } from '@/slices/feedSlice';
import { useSelector } from 'react-redux';

interface Props {
  bookmark: EventBookmark;
  setClick: React.Dispatch<React.SetStateAction<boolean>>;
  fetchBookmarks?: () => void;
}

const Events = ({ bookmark, setClick, fetchBookmarks }: Props) => {
  const open = useSelector(navbarOpenSelector);
  return (
    <div className="w-full m-auto max-lg:w-[90vw] flex flex-col gap-4 font-primary dark:text-white pt-8 max-lg:pt-4">
      <div className="flex items-center gap-2">
        <ArrowArcLeft
          onClick={() => {
            if (fetchBookmarks) fetchBookmarks();
            setClick(false);
          }}
          className="cursor-pointer"
          size={32}
        />
        <div className="font-medium text-xl cursor-default">{bookmark.title}</div>
      </div>
      {bookmark.eventItems?.length > 0 ? (
        <div
          className={`w-full ${
            open ? 'px-2 gap-4' : 'px-8 gap-8'
          } pb-12 flex flex-wrap justify-center transition-ease-out-500`}
        >
          {bookmark.eventItems.map(evenItem => {
            return <EventCard key={evenItem.id} event={evenItem.event} size={96} />;
          })}
        </div>
      ) : (
        <div className="mx-auto pt-4">No Items :)</div>
      )}
    </div>
  );
};

export default Events;
