import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import Sidebar from '@/components/common/sidebar';
import React, { useEffect, useState } from 'react';
import { initialEvent } from '@/types/initials';
import { EVENT_PIC_URL, EXPLORE_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import { GetServerSidePropsContext } from 'next/types';
import Loader from '@/components/common/loader';
import { SERVER_ERROR } from '@/config/errors';
import Image from 'next/image';
import { ArrowUpRight, Buildings, CalendarBlank, MapPin, Rocket, Ticket, Users } from '@phosphor-icons/react';
import EventCard from '@/components/explore/event_card';
import { Event, User } from '@/types';
import Link from 'next/link';
import moment from 'moment';
import getIcon from '@/utils/funcs/get_icon';
import getDomainName from '@/utils/funcs/get_domain_name';
import { userSelector } from '@/slices/userSlice';
import { useSelector } from 'react-redux';
import OrgSidebar from '@/components/common/org_sidebar';
import LowerEvent from '@/components/lowers/lower_event';
import EventBookmarkIcon from '@/components/lowers/event_bookmark';
import FollowBtn from '@/components/common/follow_btn';

interface Props {
  id: string;
}

const Event = ({ id }: Props) => {
  const [event, setEvent] = useState(initialEvent);
  const [similarEvents, setSimilarEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const [eventLikes, setEventLikes] = useState(0);

  const user = useSelector(userSelector);
  const getEvent = () => {
    const URL = `${EXPLORE_URL}/events/${id}`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          setEvent(res.data.event);
          setEventLikes(res.data.event?.noLikes);
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

  const getSimilarEvents = () => {
    const URL = `${EXPLORE_URL}/events/similar/${id}?limit=10`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          setSimilarEvents(res.data.events || []);
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
    getEvent();
    getSimilarEvents();
  }, [id]);

  interface UserProps {
    user: User;
    host?: boolean;
  }

  const AboutUser = ({ user, host = false }: UserProps) => (
    <div className="relative">
      <div className="w-full flex gap-2 items-center justify-between">
        <div className="w-fit flex items-center gap-2 group">
          <UserHoverCard user={user} />
          <Image
            width={50}
            height={50}
            src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
            alt=""
            className={`${host ? 'w-8 h-8' : 'w-6 h-6'} rounded-full cursor-pointer`}
          />
          <div className={`w-fit ${host ? 'text-xl' : 'text-lg'} font-medium cursor-pointer`}>{user.name}</div>
        </div>
        <FollowBtn toFollowID={user.id} smaller={true} />
        {/* <div className="w-20 h-8 bg-gray-100 flex-center rounded-2xl text-sm">Follow</div> */}
      </div>
    </div>
  );

  const UserHoverCard = ({ user }: UserProps) => (
    //TODO add noFollowers
    <div className="w-2/3 bg-white flex flex-col gap-2 rounded-xl p-4 shadow-xl absolute -translate-y-3/4 -top-2 opacity-0 group-hover:opacity-100 group-hover:-translate-y-full z-[-1] group-hover:z-0 transition-ease-500">
      <Image
        width={50}
        height={50}
        src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
        alt=""
        className="w-12 h-12 rounded-full"
      />
      <Link href={'/explore/user/' + user.username} target="_blank" className="w-fit flex flex-wrap items-center gap-2">
        <div className="text-xl font-semibold">{user.name}</div>
        <div className="text-gray-400 text-xs">@{user.username}</div>
      </Link>
      <div className="text-gray-600 text-sm">{user.tagline}</div>
      <div className="w-full flex flex-wrap gap-4">
        {user.links?.map(link => (
          <Link key={link} href={link} target="_blank">
            {getIcon(getDomainName(link), 22, 'regular')}
          </Link>
        ))}
      </div>
    </div>
  );

  const AboutHosts = () => (
    <div className="w-2/5 flex flex-col gap-6">
      <Image
        width={500}
        height={500}
        src={`${EVENT_PIC_URL}/${event.coverPic}`}
        alt="Event Picture"
        className="w-full h-64 object-cover rounded-xl"
        placeholder="blur"
        blurDataURL={event.blurHash || 'no-hash'}
      />
      <LowerEvent event={event} numLikes={eventLikes} setNumLikes={setEventLikes} />
      <div className="w-full flex flex-col gap-4">
        <div className="text-sm font-medium text-gray-500 border-b-2 border-gray-300 pb-2">HOSTED BY</div>
        <AboutUser user={event.organization.user} host={true} />
      </div>
      {event.coHosts && event.coHosts.length > 0 && (
        <div className="w-full flex flex-col gap-4">
          <div className="text-sm font-medium text-gray-500 border-b-2 border-gray-300 pb-2">CO HOSTS</div>
          <div className="w-full flex flex-col gap-2">
            {event.coHosts?.map(org => (
              <AboutUser key={org.id} user={org.user} />
            ))}
          </div>
        </div>
      )}
      {event.coordinators && event.coordinators.length > 0 && (
        <div className="w-full flex flex-col gap-4">
          <div className="text-sm font-medium text-gray-500 border-b-2 border-gray-300 pb-2">COORDINATORS</div>
          <div className="flex flex-col gap-2">
            {event.coordinators.map(user => (
              <AboutUser key={user.id} user={user} />
            ))}
          </div>
        </div>
      )}
      <div className="w-full flex flex-col gap-1 text-sm">
        <div className="w-fit font-medium text-primary_black hover:text-gray-600 transition-ease-300 cursor-pointer">
          Contact the Host
        </div>
        <div className="w-fit font-medium text-primary_black hover:text-primary_danger transition-ease-300 cursor-pointer">
          Report Event
        </div>
      </div>
    </div>
  );

  const AboutEvent = () => (
    <div className="w-3/5 flex flex-col gap-6">
      <div className="font-semibold text-5xl leading-tight">{event.title}</div>
      <div className="w-full flex justify-between items-center">
        <div className="w-full flex flex-col gap-2">
          <div className="text-sm font-medium text-gray-500">FROM</div>
          <div className="flex gap-3 items-center">
            <div className="w-12 h-12 bg-gray-100 flex flex-col rounded-xl text-center p-1">
              <div className="w-full h-2/5 flex-center text-xxs uppercase">{moment(event.startTime).format('MMM')}</div>
              <div className="w-full h-3/5 bg-gray-200 flex-center rounded-t-sm rounded-b-lg">
                {moment(event.startTime).format('DD')}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="font-medium">{moment(event.startTime).format('dddd')}</div>
              <div className="text-sm">{moment(event.startTime).format('Ha, DD MMMM')}</div>
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col gap-2">
          <div className="text-sm font-medium text-gray-500">TO</div>
          <div className="flex gap-3 items-center">
            <div className="w-12 h-12 bg-gray-100 flex flex-col rounded-xl text-center p-1">
              <div className="w-full h-2/5 flex-center text-xxs uppercase">{moment(event.endTime).format('MMM')}</div>
              <div className="w-full h-3/5 bg-gray-200 flex-center rounded-t-sm rounded-b-lg">
                {moment(event.endTime).format('DD')}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="font-medium">{moment(event.endTime).format('dddd')}</div>
              <div className="text-sm">{moment(event.endTime).format('Ha, DD MMMM')}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col gap-2">
        <div className="text-sm font-medium text-gray-500">LOCATION</div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 border-gray-100 border-4 flex-center p-2 rounded-xl">
            <MapPin size={20} />
          </div>
          <div>{event.location}</div>
        </div>
      </div>
      {event.tags && event.tags.length > 0 && (
        <div className="w-full flex flex-col gap-2">
          <div className="text-sm font-medium text-gray-500">TAGS</div>
          <div className="flex flex-wrap gap-2">
            {event.tags.map(tag => (
              <Link
                //TODO add onClick setState of explore page to events
                key={tag}
                href={'/explore?search=' + tag}
                target="_blank"
                className="flex-center bg-gray-100 px-2 py-1 border-[1px] border-dashed border-gray-400 text-xs rounded-lg"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="w-full flex flex-col gap-2">
        <div className="text-sm font-medium text-gray-500">ABOUT THE EVENT</div>
        <div className="whitespace-pre-wrap">{event.description}</div>
      </div>
    </div>
  );

  return (
    <BaseWrapper title={event.title}>
      {user.isOrganization ? <OrgSidebar index={1} /> : <Sidebar index={2} />}
      <MainWrapper>
        <div className="w-full py-12 px-20 max-md:p-2 flex flex-col transition-ease-out-500 font-primary">
          {loading ? (
            <Loader />
          ) : (
            <div className="w-[70vw] max-md:w-full mx-auto flex flex-col gap-12">
              <div className="w-full flex gap-12">
                <AboutHosts />
                <AboutEvent />
              </div>
              {similarEvents && similarEvents.length > 0 ? (
                <div className="w-full flex flex-col gap-4">
                  <div className="w-full flex-center text-sm font-semibold text-gray-500">SIMILAR EVENTS</div>
                  <div className="w-full flex gap-6 flex-wrap justify-around">
                    {similarEvents.map(e => (
                      <EventCard key={e.id} event={e} size={80} />
                    ))}
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
          )}
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default Event;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.query;

  return {
    props: { id },
  };
}
