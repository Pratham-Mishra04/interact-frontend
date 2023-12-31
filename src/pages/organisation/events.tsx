import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import React, { useEffect, useState } from 'react';
import OrgSidebar from '@/components/common/org_sidebar';
import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import { Info, Plus } from '@phosphor-icons/react';
import { ORG_URL } from '@/config/routes';
import NoFeed from '@/components/empty_fillers/feed';
import OrgMembersOnlyAndProtect from '@/utils/wrappers/org_members_only';
import { useSelector } from 'react-redux';
import { currentOrgSelector } from '@/slices/orgSlice';
import checkOrgAccess from '@/utils/funcs/check_org_access';
import { ORG_SENIOR } from '@/config/constants';
import Loader from '@/components/common/loader';
import { Event } from '@/types';
import NewEvent from '@/sections/organization/events/new_event';
import EventCard from '@/components/explore/event_card';
import { initialEvent } from '@/types/initials';
import EditEvent from '@/sections/organization/events/edit_event';
import ConfirmDelete from '@/components/common/confirm_delete';
import deleteHandler from '@/handlers/delete_handler';
import InfiniteScroll from 'react-infinite-scroll-component';
import WidthCheck from '@/utils/wrappers/widthCheck';
import { navbarOpenSelector } from '@/slices/feedSlice';
import EditCoordinators from '@/sections/organization/events/edit_coordinators';
import AccessTree from '@/components/organization/access_tree';

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [clickedOnNewEvent, setClickedOnNewEvent] = useState(false);
  const [clickedOnEditEvent, setClickedOnEditEvent] = useState(false);
  const [clickedOnEditCollaborators, setClickedOnEditCollaborators] = useState(false);
  const [clickedEditEvent, setClickedEditEvent] = useState(initialEvent);
  const [clickedOnDeleteEvent, setClickedOnDeleteEvent] = useState(false);
  const [clickedDeleteEvent, setClickedDeleteEvent] = useState(initialEvent);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(true);

  const [clickedOnInfo, setClickedOnInfo] = useState(false);

  const currentOrg = useSelector(currentOrgSelector);

  const getEvents = () => {
    const URL = `${ORG_URL}/${currentOrg.id}/events?page=${page}&limit=${10}`;
    getHandler(URL)
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

  const handleDeleteEvent = async () => {
    const toaster = Toaster.startLoad('Deleting the event...');

    const URL = `${ORG_URL}/${currentOrg.id}/events/${clickedDeleteEvent.id}`;

    const res = await deleteHandler(URL);

    if (res.statusCode === 204) {
      setEvents(prev => prev.filter(e => e.id != clickedDeleteEvent.id));
      setClickedOnDeleteEvent(false);
      Toaster.stopLoad(toaster, 'Event Deleted', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  const open = useSelector(navbarOpenSelector);

  return (
    <BaseWrapper title="Events">
      <OrgSidebar index={12} />
      <MainWrapper>
        <div className="w-full flex flex-col items-center gap-6 max-md:px-2 p-base_padding pl-0 pb-0">
          <div className="w-full flex justify-between items-center">
            <div className="w-fit text-6xl font-semibold dark:text-white font-primary pl-6">Events</div>
            <div className="flex items-center gap-2">
              {checkOrgAccess(ORG_SENIOR) ? (
                <Plus
                  onClick={() => setClickedOnNewEvent(true)}
                  size={42}
                  className="flex-center rounded-full hover:bg-white p-2 transition-ease-300 cursor-pointer"
                  weight="regular"
                />
              ) : (
                <></>
              )}
              <Info
                onClick={() => setClickedOnInfo(true)}
                size={42}
                className="flex-center rounded-full hover:bg-white p-2 transition-ease-300 cursor-pointer"
                weight="regular"
              />
            </div>
          </div>

          <div className="w-full max-md:w-full mx-auto flex flex-col items-center gap-4">
            {clickedOnInfo ? <AccessTree type="event" setShow={setClickedOnInfo} /> : <></>}
            {clickedOnNewEvent ? <NewEvent setEvents={setEvents} setShow={setClickedOnNewEvent} /> : <></>}
            {clickedOnEditEvent ? (
              <EditEvent event={clickedEditEvent} setEvents={setEvents} setShow={setClickedOnEditEvent} />
            ) : (
              <></>
            )}
            {clickedOnEditCollaborators ? (
              <EditCoordinators
                event={clickedEditEvent}
                setEvents={setEvents}
                setShow={setClickedOnEditCollaborators}
              />
            ) : (
              <></>
            )}
            {clickedOnDeleteEvent ? (
              <ConfirmDelete handleDelete={handleDeleteEvent} setShow={setClickedOnDeleteEvent} />
            ) : (
              <></>
            )}

            {loading ? (
              <Loader />
            ) : (
              <div className="w-full">
                {events.length === 0 ? (
                  //TODO noEvents
                  <NoFeed />
                ) : (
                  <InfiniteScroll
                    dataLength={events.length}
                    next={getEvents}
                    hasMore={hasMore}
                    loader={<Loader />}
                    className="w-full pl-6 pb-12 mx-auto flex flex-wrap gap-8 justify-center"
                  >
                    {events.map(event => (
                      <EventCard
                        key={event.id}
                        event={event}
                        org={true}
                        setClickedOnEditEvent={setClickedOnEditEvent}
                        setClickedOnEditCollaborators={setClickedOnEditCollaborators}
                        setClickedEditEvent={setClickedEditEvent}
                        setClickedOnDeleteEvent={setClickedOnDeleteEvent}
                        setClickedDeleteEvent={setClickedDeleteEvent}
                        size={open ? '[22rem]' : 96}
                      />
                    ))}
                  </InfiniteScroll>
                )}
              </div>
            )}
          </div>
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default WidthCheck(OrgMembersOnlyAndProtect(Events));
