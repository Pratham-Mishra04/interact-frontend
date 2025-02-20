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
import { MapPin } from '@phosphor-icons/react';
import EventCard from '@/components/explore/event_card';
import { Event, User } from '@/types';
import Link from 'next/link';
import moment from 'moment';
import { setRegisteredEvents, userSelector } from '@/slices/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import OrgSidebar from '@/components/common/org_sidebar';
import LowerEvent from '@/components/lowers/lower_event';
import FollowBtn from '@/components/common/follow_btn';
import UserHoverCard from '@/components/common/user_hover_card';
import Report from '@/components/common/report';
import SignUp from '@/components/common/signup_box';
import { setCurrentChatID } from '@/slices/messagingSlice';
import SendMessage from '@/sections/explore/send_message';
import SecondaryButton from '@/components/buttons/secondary_btn';
import Hackathon from '@/screens/hackathon/hackathon';
import PrimeWrapper from '@/wrappers/prime';
import Links from '@/components/explore/show_links';
import { EVENT_PIC_HASH_DEFAULT } from '@/config/constants';
import Editor from '@/components/editor';

interface Props {
  id: string;
}

const EventComponent = ({ id }: Props) => {
  const [event, setEvent] = useState(initialEvent);
  const [loading, setLoading] = useState(true);

  const [eventLikes, setEventLikes] = useState(0);
  const [clickedOnChat, setClickedOnChat] = useState(false);
  const [clickedOnReport, setClickedOnReport] = useState(false);

  const user = useSelector(userSelector);

  const dispatch = useDispatch();

  const getEvent = () => {
    const URL = `${EXPLORE_URL}/events/${id}`;
    getHandler(URL, undefined, true)
      .then(res => {
        if (res.statusCode === 200) {
          setEvent(res.data.event);
          setEventLikes(res.data.event?.noLikes);
          setLoading(false);
        } else {
          Toaster.error(res.data.message || SERVER_ERROR, 'error_toaster');
        }
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  useEffect(() => {
    getEvent();
  }, [id]);

  const chatSlices = user.personalChatSlices;

  const handleChat = () => {
    var check = false;
    var chatID = '';
    chatSlices.forEach(chat => {
      if (chat.userID == user.id) {
        chatID = chat.chatID;
        check = true;
        return;
      }
    });
    if (check) {
      dispatch(setCurrentChatID(chatID));
      window.location.assign('/messaging');
    } else setClickedOnChat(true);
  };

  const handleRegister = async (pass?: string) => {
    const toaster = Toaster.startLoad('Registering for the Event');
    getHandler(
      event.hackathonID
        ? `/hackathons/register/${event.hackathonID}${event.hackathon?.isRestricted ? `?code=${pass}` : ''}`
        : `/events/register/${id}`
    )
      .then(res => {
        if (res.statusCode === 200) {
          Toaster.stopLoad(toaster, 'Successfully registered for the Event!', 1);
          dispatch(setRegisteredEvents([...(user.registeredEvents || []), event.id]));
        } else {
          Toaster.stopLoad(toaster, res.data.message || SERVER_ERROR, 0);
        }
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  interface UserProps {
    user: User;
    host?: boolean;
    coordinator?: boolean;
    title?: string;
  }

  const AboutUser = ({ user, host = false, coordinator = false, title }: UserProps) => (
    <div className="relative">
      <div className="w-full flex gap-2 items-center justify-between">
        <div className="w-fit flex items-center gap-2 group">
          <UserHoverCard user={user} title={coordinator ? title : user.tagline} />
          <Image
            width={50}
            height={50}
            src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
            placeholder="blur"
            blurDataURL={user.profilePicBlurHash || 'no-hash'}
            alt=""
            className={`${host ? 'w-8 h-8' : 'w-6 h-6'} rounded-full cursor-pointer`}
          />
          <div className={`w-fit ${host ? 'text-xl' : 'text-base'} font-medium cursor-pointer`}>{user.name}</div>
        </div>
        <FollowBtn toFollowID={user.id} smaller={true} />
      </div>
    </div>
  );

  const AboutSession = () => {
    const isRegistered = user.registeredEvents?.includes(event.id);
    const isLive = event.meeting?.isLive;

    const startTime = moment(event.meeting?.startTime).utcOffset('+05:30');
    const endTime = moment(event.meeting?.endTime).utcOffset('+05:30');
    const now = moment().utcOffset('+05:30');
    const isBeforeStart = now.isBefore(startTime);
    let timeUntilStart = '';

    if (isBeforeStart) {
      const duration = moment.duration(startTime.diff(now));
      const hours = duration.hours();
      const minutes = duration.minutes();

      if (hours > 0) {
        timeUntilStart = `${hours} hour${hours > 1 ? 's' : ''} `;
      }
      timeUntilStart += `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }

    const handleJoinMeeting = async () => {
      await getHandler(`/events/meeting/token/${id}`)
        .then(res => {
          if (res.statusCode === 200) {
            const authToken = res.data.authToken;
            if (!authToken || authToken == '') {
              Toaster.error(SERVER_ERROR, 'error_toaster');
              return;
            }
            window.location.assign(`/events/live?id=${id}&token=${authToken}`);
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

    return (
      <div className="w-full flex flex-col gap-2">
        <div className="text-xs font-semibold text-gray-500">This event is happening on Interact!</div>
        {isRegistered ? (
          isLive || now.isBetween(startTime, endTime) ? (
            <div
              onClick={handleJoinMeeting}
              className="w-full relative p-2 text-center bg-yellow-200 text-gray-700 rounded-lg font-medium cursor-default"
            >
              Join Event!
            </div>
          ) : isBeforeStart ? (
            <div className="w-full relative p-2 text-center bg-yellow-200 text-gray-700 rounded-lg font-medium cursor-default">
              Event starts in {timeUntilStart}!
            </div>
          ) : (
            <button
              type="submit"
              className="w-full relative p-2 bg-priority_high text-gray-700 rounded-lg cursor-default"
            >
              Event has Ended
            </button>
          )
        ) : user.id ? (
          <SecondaryButton label="Register Now!" onClick={handleRegister} />
        ) : (
          <SecondaryButton label="Sign Up To Register!" onClick={() => window.location.assign('/login')} />
        )}
      </div>
    );
  };

  const AboutHosts = () => (
    <div className="w-2/5 bg-white dark:bg-dark_primary_comp_hover rounded-xl max-md:w-full shadow-lg">
      <Image
        width={500}
        height={175}
        src={`${EVENT_PIC_URL}/${event.coverPic}`}
        alt="Event Picture"
        className="w-full object-cover rounded-t-xl"
        placeholder="blur"
        blurDataURL={
          event.blurHash
            ? event.blurHash == 'no-hash'
              ? EVENT_PIC_HASH_DEFAULT
              : event.blurHash
            : EVENT_PIC_HASH_DEFAULT
        }
      />
      <div className="w-full flex flex-col gap-6 p-4 pt-2">
        <LowerEvent event={event} numLikes={eventLikes} setNumLikes={setEventLikes} />
        {event.meetingID && <AboutSession />}
        <div className="w-full flex flex-col gap-4">
          <div className="text-sm font-medium text-gray-500 dark:text-white border-b-2 border-gray-300 pb-2">
            HOSTED BY
          </div>
          <AboutUser user={event.organization.user} host={true} />
        </div>
        {event.coHosts && event.coHosts.length > 0 && (
          <div className="w-full flex flex-col gap-4">
            <div className="text-sm font-medium text-gray-500 dark:text-white border-b-2 border-gray-300 pb-2">
              CO HOSTS
            </div>
            <div className="w-full flex flex-col gap-2">
              {event.coHosts?.map(org => (
                <AboutUser key={org.id} user={org.user} />
              ))}
            </div>
          </div>
        )}
        {event.coordinators && event.coordinators.length > 0 && (
          <div className="w-full flex flex-col gap-4">
            <div className="text-sm font-medium text-gray-500 dark:text-white border-b-2 border-gray-300 pb-2">
              COORDINATORS
            </div>
            <div className="flex flex-col gap-2">
              {event.coordinators.map(user => (
                <AboutUser key={user.id} user={user} />
              ))}
            </div>
          </div>
        )}
        {event.links && event.links.length > 0 && (
          <div className="w-full flex flex-col gap-4">
            <div className="text-sm font-medium text-gray-500 border-b-2 border-gray-300 pb-2">
              MORE ABOUT THE EVENT
            </div>
            <Links links={event.links} excludeTitle />
          </div>
        )}
        <div className="w-full flex flex-col gap-1 text-sm">
          <div
            onClick={handleChat}
            className="w-fit font-medium text-primary_black dark:text-gray-300 hover:text-gray-600 dark:hover:text-white transition-ease-300 cursor-pointer"
          >
            Message the Host
          </div>
          <div
            onClick={() => setClickedOnReport(true)}
            className="w-fit font-medium text-primary_black dark:text-gray-300 hover:text-primary_danger dark:hover:text-primary_danger transition-ease-300 cursor-pointer"
          >
            Report Event
          </div>
        </div>
      </div>
    </div>
  );

  const AboutEvent = () => (
    <div className="w-3/5 max-md:w-full flex flex-col gap-6">
      <div className="font-semibold text-5xl max-md:text-center leading-tight">{event.title}</div>
      <div className="w-full flex justify-between items-center">
        <div className="w-full flex flex-col gap-2">
          <div className="text-sm font-medium text-gray-500">FROM</div>
          <div className="flex gap-3 items-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-dark_primary_comp flex flex-col rounded-xl text-center p-1">
              <div className="w-full h-2/5 flex-center text-xxs uppercase">{moment(event.startTime).format('MMM')}</div>
              <div className="w-full h-3/5 bg-gray-200 dark:bg-dark_primary_comp_hover flex-center rounded-t-sm rounded-b-lg">
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
            <div className="w-12 h-12 bg-gray-100 dark:bg-dark_primary_comp flex flex-col rounded-xl text-center p-1">
              <div className="w-full h-2/5 flex-center text-xxs uppercase">{moment(event.endTime).format('MMM')}</div>
              <div className="w-full h-3/5 bg-gray-200 dark:bg-dark_primary_comp_hover flex-center rounded-t-sm rounded-b-lg">
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
          <div className="w-12 h-12 border-gray-100 dark:border-dark_primary_btn border-4 flex-center p-2 rounded-xl">
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
                href={'/events?search=' + tag}
                target="_blank"
                className="flex-center bg-gray-100 dark:bg-dark_primary_comp px-2 py-1 border-[1px] border-dashed border-gray-400 text-xs rounded-lg"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}
      {event.description && (
        <div className="w-full flex flex-col gap-2">
          <div className="text-sm font-medium text-gray-500">ABOUT THE EVENT</div>
          <div className="whitespace-pre-wrap">{<Editor content={event.description} editable={false} />}</div>
        </div>
      )}
    </div>
  );

  return (
    <BaseWrapper title={`${event.title}`}>
      {user.isOrganization ? <OrgSidebar index={1} /> : <Sidebar index={3} />}
      <MainWrapper restrictWidth>
        {event.hackathonID ? (
          <Hackathon event={event} handleRegister={handleRegister} />
        ) : (
          <>
            {clickedOnChat &&
              (user.id != '' ? (
                <SendMessage user={event.organization.user} setShow={setClickedOnChat} />
              ) : (
                <SignUp setShow={setClickedOnChat} />
              ))}
            {clickedOnReport &&
              (user.id != '' ? (
                <Report eventID={event.id} setShow={setClickedOnReport} />
              ) : (
                <SignUp setShow={setClickedOnReport} />
              ))}
            <PrimeWrapper>
              {loading ? (
                <Loader />
              ) : (
                <div className="w-full max-md:w-full mx-auto flex flex-col gap-12">
                  <div className="w-full flex max-md:flex-col gap-12 max-md:px-2">
                    <AboutHosts />
                    <AboutEvent />
                  </div>
                </div>
              )}
            </PrimeWrapper>
          </>
        )}
        <SimilarEvents id={id} />
      </MainWrapper>
    </BaseWrapper>
  );
};

export default EventComponent;

export const SimilarEvents = ({ id }: { id: string }) => {
  const [similarEvents, setSimilarEvents] = useState<Event[]>([]);

  const getSimilarEvents = () => {
    const URL = `${EXPLORE_URL}/events/similar/${id}?limit=10`;
    getHandler(URL, undefined, true)
      .then(res => {
        if (res.statusCode === 200) {
          setSimilarEvents(res.data.events || []);
        } else {
          Toaster.error(res.data.message || SERVER_ERROR, 'error_toaster');
        }
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  useEffect(() => {
    getSimilarEvents();
  }, [id]);

  return similarEvents && similarEvents.length > 0 ? (
    <div className="w-full flex flex-col gap-4 mt-8">
      <div className="w-full flex-center text-sm font-semibold text-gray-500 dark:text-gray-200">SIMILAR EVENTS</div>
      <div className="w-full grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
        {similarEvents.map(e => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </div>
  ) : (
    <></>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.query;

  return {
    props: { id },
  };
}
