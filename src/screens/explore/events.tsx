import { SERVER_ERROR } from '@/config/errors';
import { EXPLORE_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { Event } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import Loader from '@/components/common/loader';
import EventCard from '@/components/organization/event_card';
import NoSearch from '@/components/empty_fillers/search';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSelector } from 'react-redux';
import { userIDSelector } from '@/slices/userSlice';
import { navbarOpenSelector } from '@/slices/feedSlice';

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const userID = useSelector(userIDSelector) || '';

  const open = useSelector(navbarOpenSelector);

  const fetchEvents = async (search: string | null) => {
    const URL =
      search && search != ''
        ? `${EXPLORE_URL}/events/trending?${'search=' + search}`
        : userID != ''
        ? `${EXPLORE_URL}/events/trending?page=${page}&limit=${10}`
        : `${EXPLORE_URL}/events/trending?page=${page}&limit=${10}`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      if (search && search != '') {
        setEvents(res.data.events || []);
        setHasMore(false);
      } else {
        if (!search && page == 1) setEvents(res.data.events || []);
        else {
          const addedEvents = [...events, ...(res.data.events || [])];
          if (addedEvents.length === events.length) setHasMore(false);
          setEvents(addedEvents);
        }
        setPage(prev => prev + 1);
      }
      setLoading(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  useEffect(() => {
    setPage(1);
    fetchEvents(new URLSearchParams(window.location.search).get('search'));
  }, [window.location.search]);
  return (
    <div className="w-full flex flex-col gap-6 pt-2">
      {loading ? (
        <Loader />
      ) : (
        <>
          {events.length > 0 ? (
            <InfiniteScroll
              className={`w-full ${
                open ? 'px-2 gap-4' : 'px-8 gap-8'
              } pb-12 flex flex-wrap justify-center transition-ease-out-500`}
              dataLength={events.length}
              next={() => fetchEvents(new URLSearchParams(window.location.search).get('search'))}
              hasMore={hasMore}
              loader={<Loader />}
            >
              {events.map(event => {
                return <EventCard key={event.id} event={event} size={96} />;
              })}
            </InfiniteScroll>
          ) : (
            <NoSearch />
          )}
        </>
      )}
    </div>
  );
};

export default Events;
