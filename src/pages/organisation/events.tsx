import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import React, { useEffect, useState } from 'react';
import OrgSidebar from '@/components/common/org_sidebar';
import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import { Info, Plus, Envelope } from '@phosphor-icons/react';
import { EXPLORE_URL, ORG_URL } from '@/config/routes';
import OrgMembersOnlyAndProtect from '@/utils/wrappers/org_members_only';
import { useSelector } from 'react-redux';
import { currentOrgSelector } from '@/slices/orgSlice';
import checkOrgAccess from '@/utils/funcs/check_org_access';
import { ORG_SENIOR } from '@/config/constants';
import Loader from '@/components/common/loader';
import { Event } from '@/types';
import NewEvent from '@/sections/organization/events/new_event';
import EventCard from '@/components/organization/event_card';
import { initialEvent } from '@/types/initials';
import EditEvent from '@/sections/organization/events/edit_event';
import ConfirmDelete from '@/components/common/confirm_delete';
import deleteHandler from '@/handlers/delete_handler';
import InfiniteScroll from 'react-infinite-scroll-component';
import WidthCheck from '@/utils/wrappers/widthCheck';
import { navbarOpenSelector } from '@/slices/feedSlice';
import EditCoordinators from '@/sections/organization/events/edit_coordinators';
import AccessTree from '@/components/organization/access_tree';
import ViewInvitations from '@/sections/organization/events/view_invitations';
import EditCoHosts from '@/sections/organization/events/edit_cohosts';
import EventHistory from '@/sections/organization/events/history';
import NoEvents from '@/components/fillers/events';

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [clickedOnNewEvent, setClickedOnNewEvent] = useState(false);
  const [clickedOnViewInvitations, setClickedOnViewInvitations] = useState(false);
  const [clickedOnViewHistory, setClickedOnViewHistory] = useState(false);
  const [clickedOnEditEvent, setClickedOnEditEvent] = useState(false);
  const [clickedOnEditCollaborators, setClickedOnEditCollaborators] = useState(false);
  const [clickedOnEditCoHosts, setClickedOnEditCoHosts] = useState(false);
  const [clickedEditEvent, setClickedEditEvent] = useState(initialEvent);
  const [clickedOnDeleteEvent, setClickedOnDeleteEvent] = useState(false);
  const [clickedDeleteEvent, setClickedDeleteEvent] = useState(initialEvent);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [unreadInvitations, setUnreadInvitations] = useState(0);

  const [loading, setLoading] = useState(true);

  const [clickedOnInfo, setClickedOnInfo] = useState(false);

  const currentOrg = useSelector(currentOrgSelector);

  const getEvents = () => {
    const URL = checkOrgAccess(ORG_SENIOR)
      ? `${ORG_URL}/${currentOrg.id}/events`
      : `${EXPLORE_URL}/events/org/${currentOrg.id}`;
    getHandler(URL + `?page=${page}&limit=${10}`)
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

  const fetchUnreadInvitations = () => {
    const URL = `${ORG_URL}/${currentOrg.id}/events/invitations/count`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          setUnreadInvitations(res.data.count || 0);
        } else Toaster.error(res.data.message, 'error_toaster');
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  useEffect(() => {
    getEvents();
    if (checkOrgAccess(ORG_SENIOR)) fetchUnreadInvitations();
  }, []);

  const open = useSelector(navbarOpenSelector);

  return (
    <BaseWrapper title={`Events | ${currentOrg.title}`}>
      <OrgSidebar index={12} />
      <MainWrapper>
        <div className="w-full flex flex-col items-center gap-4 max-md:px-2 p-base_padding pl-0 pb-0">
          <div className="w-full flex justify-between items-center">
            <div className="w-fit text-6xl font-semibold dark:text-white font-primary pl-6">Events</div>
            <div className="flex items-center gap-2">
              {checkOrgAccess(ORG_SENIOR) && (
                <>
                  <Plus
                    onClick={() => setClickedOnNewEvent(true)}
                    size={42}
                    className="flex-center rounded-full hover:bg-white p-2 transition-ease-300 cursor-pointer"
                    weight="regular"
                  />
                  <div className="w-fit h-fit relative">
                    {unreadInvitations > 0 && (
                      <div className="absolute top-1 right-1 translate-x-1/4 -translate-y-1/4 w-4 h-4 flex-center text-xxs border-[1px] border-gray-500 rounded-full">
                        {unreadInvitations}
                      </div>
                    )}
                    <Envelope
                      onClick={() => setClickedOnViewInvitations(true)}
                      size={42}
                      className="flex-center rounded-full hover:bg-white p-2 transition-ease-300 cursor-pointer"
                      weight="regular"
                    />{' '}
                  </div>
                </>
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
            {clickedOnInfo && <AccessTree type="event" setShow={setClickedOnInfo} />}
            {clickedOnNewEvent && <NewEvent setEvents={setEvents} setShow={setClickedOnNewEvent} />}
            {clickedOnViewInvitations && <ViewInvitations setShow={setClickedOnViewInvitations} />}
            {clickedOnViewHistory && <EventHistory eventID={clickedEditEvent.id} setShow={setClickedOnViewHistory} />}
            {clickedOnEditEvent && (
              <EditEvent event={clickedEditEvent} setEvents={setEvents} setShow={setClickedOnEditEvent} />
            )}
            {clickedOnEditCollaborators && (
              <EditCoordinators
                event={clickedEditEvent}
                setEvents={setEvents}
                setShow={setClickedOnEditCollaborators}
              />
            )}
            {clickedOnEditCoHosts && (
              <EditCoHosts event={clickedEditEvent} setEvents={setEvents} setShow={setClickedOnEditCoHosts} />
            )}
            {clickedOnDeleteEvent && (
              <ConfirmDelete handleDelete={handleDeleteEvent} setShow={setClickedOnDeleteEvent} />
            )}

            {loading ? (
              <Loader />
            ) : (
              <div className="w-full">
                {events.length === 0 ? (
                  <div onClick={() => setClickedOnNewEvent(true)} className="w-full pl-6">
                    <NoEvents />
                  </div>
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
                        setClickedOnViewHistory={setClickedOnViewHistory}
                        setClickedOnEditEvent={setClickedOnEditEvent}
                        setClickedOnEditCollaborators={setClickedOnEditCollaborators}
                        setClickedEditEvent={setClickedEditEvent}
                        setClickedOnDeleteEvent={setClickedOnDeleteEvent}
                        setClickedDeleteEvent={setClickedDeleteEvent}
                        setClickedOnEditCoHosts={setClickedOnEditCoHosts}
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
