import { SERVER_ERROR } from '@/config/errors';
import { USER_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { Event } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import Loader from '@/components/common/loader';
import EventCard from '@/components/organization/event_card';
import NoSearch from '@/components/fillers/search';

const RegisteredEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    const URL = `${USER_URL}/me/events?populate=true`;

    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      setEvents(res.data.events || []);
      setLoading(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="w-full flex flex-col gap-6">
      {loading ? (
        <Loader />
      ) : events.length > 0 ? (
        <div className="w-full grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
          {events.map(event => {
            return <EventCard key={event.id} event={event} />;
          })}
        </div>
      ) : (
        <NoSearch />
      )}
    </div>
  );
};

export default RegisteredEvents;
