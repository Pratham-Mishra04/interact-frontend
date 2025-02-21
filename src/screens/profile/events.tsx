import { Event } from '@/types';
import React, { useEffect, useState } from 'react';
import { EXPLORE_URL } from '@/config/routes';
import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import InfiniteScroll from 'react-infinite-scroll-component';
import Loader from '@/components/common/loader';
import EventCard from '@/components/organization/event_card';
import NoUserItems from '@/components/fillers/user_items';
import Mascot from '@/components/fillers/mascot';

interface Props {
  orgID: string;
  displayOnProfile?: boolean;
  org?: boolean;
}

const Events = ({ orgID, displayOnProfile = false }: Props) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(true);

  const getEvents = () => {
    const URL = `${EXPLORE_URL}/events/org/${orgID}?page=${page}&limit=${10}`;
    getHandler(URL, undefined, true)
      .then(res => {
        if (res.statusCode === 200) {
          const addEvents = [...events, ...(res.data.events || [])];
          if (addEvents.length === events.length) setHasMore(false);
          setEvents(addEvents);
          setPage(prev => prev + 1);
          setLoading(false);
        } else {
          if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
          else {
            Toaster.error(SERVER_ERROR, 'error_toaster');
          }
        }
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  useEffect(() => {
    getEvents();
  }, []);

  return (
    <div className="w-5/6 max-md:w-full mx-auto">
      {loading ? (
        <Loader />
      ) : events.length > 0 ? (
        <InfiniteScroll
          dataLength={events.length}
          next={getEvents}
          hasMore={hasMore}
          loader={<Loader />}
          className="w-full grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1"
        >
          {events.length > 0
            ? events.map(event => <EventCard key={event.id} event={event} smaller />)
            : !displayOnProfile && <NoUserItems />}
        </InfiniteScroll>
      ) : (
        <div className="w-5/6 mx-auto">
          <Mascot message="This organization is as quiet as a library at midnight. Shh, no events yet." />
        </div>
      )}
    </div>
  );
};

export default Events;
