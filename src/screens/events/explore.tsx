import { SERVER_ERROR } from '@/config/errors';
import { EXPLORE_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { Event } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import Loader from '@/components/common/loader';
import NoSearch from '@/components/fillers/search';
import InfiniteScroll from 'react-infinite-scroll-component';
import OrderMenu from '@/components/common/order_menu';
import { userIDSelector } from '@/slices/userSlice';
import { useSelector } from 'react-redux';
import EventCard from '@/components/explore/event_card';

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState('trending');

  const fetchEvents = async (search: string | null, initialPage?: number) => {
    const URL = `${EXPLORE_URL}/events?page=${initialPage ? initialPage : page}&limit=${10}&order=${order}${
      search ? `&search=${search}` : ''
    }`;

    const res = await getHandler(URL, undefined, true);
    if (res.statusCode == 200) {
      if (initialPage == 1) {
        setEvents(res.data.events || []);
      } else {
        const addedEvents = [...events, ...(res.data.events || [])];
        if (addedEvents.length === events.length) setHasMore(false);
        setEvents(addedEvents);
      }
      setPage(prev => prev + 1);

      setLoading(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  useEffect(() => {
    setPage(1);
    setEvents([]);
    setHasMore(true);
    setLoading(true);
    fetchEvents(new URLSearchParams(window.location.search).get('search'), 1);
  }, [window.location.search, order]);

  const userID = useSelector(userIDSelector);

  return (
    <div className="w-full flex flex-col gap-6">
      <OrderMenu
        orders={['trending', 'most_liked', 'most_viewed', ...(userID ? ['latest'] : [])]}
        current={order}
        setState={setOrder}
      />
      {loading ? (
        <Loader />
      ) : events.length > 0 ? (
        <InfiniteScroll
          className="w-full grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1"
          dataLength={events.length}
          next={() => fetchEvents(new URLSearchParams(window.location.search).get('search'))}
          hasMore={hasMore}
          loader={<Loader />}
        >
          {events.map(event => {
            return <EventCard key={event.id} event={event} />;
          })}
        </InfiniteScroll>
      ) : (
        <NoSearch />
      )}
    </div>
  );
};

export default Events;
