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
import { Event } from '@/types';
import Link from 'next/link';
import moment from 'moment';
import getIcon from '@/utils/funcs/get_icon';
import getDomainName from '@/utils/funcs/get_domain_name';
import { userSelector } from '@/slices/userSlice';
import { useSelector } from 'react-redux';
import OrgSidebar from '@/components/common/org_sidebar';
import LowerEvent from '@/components/lowers/lower_event';
import EventBookmarkIcon from '@/components/lowers/event_bookmark';

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

  const AboutEvent = () => {
    return (
      <div className="bg-white w-3/5 max-md:w-full border-[1px] rounded-md">
        <div className="w-full flex justify-between items-center p-4 border-b-[1px]">
          <div className="font-medium">About the event</div>
          <EventBookmarkIcon event={event} />
        </div>
        <div className="p-4 whitespace-pre-wrap text-gray-600 text-sm">{event.description}</div>

        {event.tags && event.tags.length > 0 ? (
          <div className="w-full flex flex-col gap-2 p-4">
            <div className="font-medium">Tags</div>
            <div className="flex flex-wrap gap-2">
              {event.tags.map(tag => (
                <div
                  key={tag}
                  className="flex-center px-2 py-1 border-[1px] border-dashed border-gray-400
text-xs rounded-lg cursor-default"
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <></>
        )}

        {event.links && event.links.length > 0 ? (
          <div className="w-full flex flex-col gap-2 p-4">
            <div className="font-medium">Links</div>
            <div className="flex flex-wrap gap-4">
              {event.links.map((link, index) => (
                <Link
                  href={link}
                  target="_blank"
                  key={index}
                  className="w-fit flex items-center gap-2 hover:scale-105 px-4 py-2 rounded-lg hover:shadow-2xl transition-ease-300"
                >
                  {getIcon(getDomainName(link), 32, 'light')}
                  <div className="text-xs text-gray-500">{getDomainName(link)}</div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <></>
        )}

        {event.coordinators && event.coordinators.length > 0 ? (
          <div className="w-full flex flex-col gap-2 p-4">
            <div className="font-medium">Coordinators</div>
            <div className="flex flex-col gap-4 px-4">
              {event.coordinators.map((user, index) => (
                <Link
                  href={`/explore/user/${user.username}`}
                  target="_blank"
                  key={index}
                  className="w-full flex items-center gap-4 hover:scale-105 p-2 rounded-lg hover:shadow-2xl transition-ease-300"
                >
                  <Image
                    width={100}
                    height={100}
                    src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
                    alt=""
                    className="w-16 h-16 rounded-full"
                  />
                  <div className="w-[calc(100%-64px)] flex flex-col">
                    <div className="text-lg font-bold">{user.name}</div>
                    <div className="text-sm dark:text-gray-200">@{user.username}</div>
                    {user.tagline && user.tagline != '' ? <div className="text-sm mt-2">{user.tagline}</div> : <></>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <></>
        )}

        <LowerEvent event={event} numLikes={eventLikes} setNumLikes={setEventLikes} />
      </div>
    );
  };

  const AboutOrganisation = () => {
    return (
      <div className="bg-white w-2/5 h-fit max-md:w-full flex flex-col border-[1px] rounded-md">
        <div className="w-full flex items-center gap-1 p-4 border-b-[1px] font-medium">
          About the Organization <Buildings />
        </div>
        <div className="w-full h-fit flex flex-col gap-4 p-4 pt-2">
          <Link
            href={`/explore/organisation/${event.organization.user.username}`}
            target="_blank"
            className="w-full flex flex-col gap-2 p-2 rounded-xl hover:shadow-xl hover:scale-105 transition-ease-300"
          >
            <div className="w-full flex gap-2">
              <Image
                width={100}
                height={100}
                src={`${USER_PROFILE_PIC_URL}/${event.organization.user.profilePic}`}
                alt=""
                className="w-14 h-14 rounded-full"
              />
              <div className="w-[calc(100%-56px)] flex justify-between gap-2 flex-wrap">
                <div className="">
                  <div className="font-semibold text-2xl">{event.organization.title}</div>
                  <div className="text-sm text-gray-500">@{event.organization.user.username}</div>
                </div>
                <ArrowUpRight size={24} />
              </div>
            </div>
            <div className="text-sm">{event.organization.user.tagline}</div>
          </Link>
          <div className="text-sm p-2">{event.organization.user.bio}</div>
          <div className="w-full flex gap-4 items-center justify-center flex-wrap p-6">
            <div className="flex flex-col items-center gap-2 p-4 cursor-default">
              <Rocket size={24} />
              <div className="flex flex-col text-center items-center">
                <div>{event.organization.noProjects}</div>
                <div className="text-xs text-gray-500">Projects</div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 cursor-default">
              <Ticket size={24} />
              <div className="flex flex-col text-center items-center">
                <div>{event.organization.noEvents}</div>
                <div className="text-xs text-gray-500">Total Events</div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 cursor-default">
              <Users size={24} />
              <div className="flex flex-col text-center items-center">
                <div>{event.organization.noMembers}</div>
                <div className="text-xs text-gray-500">Members</div>
              </div>
            </div>
          </div>
          <div className="w-full text-sm text-center font-medium text-gray-500">
            On Interact Since{' '}
            <span className="font-semibold">{moment(event.organization.createdAt).format('MMM, YYYY')}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <BaseWrapper title={event.title}>
      {user.isOrganization ? <OrgSidebar index={1} /> : <Sidebar index={2} />}
      <MainWrapper>
        <div className="w-full py-12 px-20 max-md:p-2 flex flex-col transition-ease-out-500 font-primary">
          {loading ? (
            <Loader />
          ) : (
            <div className="w-[70vw] max-md:w-full mx-auto flex flex-col gap-12">
              <div className="w-full h-108 relative flex justify-between max-md:flex-col">
                <Image
                  width={10000}
                  height={10000}
                  src={`${EVENT_PIC_URL}/${event.coverPic}`}
                  alt=""
                  className="w-full h-full object-cover rounded-xl absolute top-0 -z-10"
                  placeholder="blur"
                  blurDataURL={event.blurHash}
                />
                <div className="w-full h-full rounded-xl bg-white bg-opacity-25 absolute top-0 -z-[5]"></div>
                <div className="w-1/2 max-md:w-full h-full p-8 flex flex-col justify-between">
                  <div className="w-full flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                      <div className="text-6xl max-md:text-2xl font-semibold">{event.title}</div>
                      <Link
                        href={`/explore/organisation/${event.organization.user.username}`}
                        className="w-fit text-2xl font-medium pl-1 hover-underline-animation after:bg-black"
                      >
                        {event.organization.title}
                      </Link>
                    </div>
                    <div className="text-sm">{event.tagline}</div>
                  </div>

                  <div className="w-fit p-2 glassMorphism rounded-lg flex items-center gap-1 font-medium">
                    <MapPin size={20} /> {event.location}
                  </div>
                </div>
                <div className="w-1/2 max-md:w-full max-md:p-4 h-full flex-center">
                  <div className="glassMorphism flex flex-col gap-4 p-6 rounded-xl">
                    <div className="flex items-center gap-2 text-xl font-medium">
                      <CalendarBlank weight="bold" /> Event Dates
                    </div>
                    <div className="w-full h-full flex gap-4">
                      <div className="flex flex-col gap-1">
                        <div className="text-xs">FROM</div>
                        <div>{moment(event.startTime).format('hh:mmA MMM DD, YYYY')}</div>
                      </div>
                      <div className="w-[1px] h-12 border-r-[1px] border-dashed border-primary_black border-opacity-50"></div>
                      <div className="flex flex-col gap-1">
                        <div className="text-xs">TO</div>
                        <div>{moment(event.endTime).format('hh:mmA MMM DD, YYYY')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full flex max-md:flex-col gap-8">
                <AboutEvent />
                <AboutOrganisation />
              </div>
              {similarEvents && similarEvents.length > 0 ? (
                <div className="w-full flex flex-col gap-4">
                  <div className="font-medium text-gray-600 text-center">Similar Events</div>
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
