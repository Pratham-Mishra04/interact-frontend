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
import getIcon from '@/utils/funcs/get_icon';
import getDomainName from '@/utils/funcs/get_domain_name';
import { userSelector } from '@/slices/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import OrgSidebar from '@/components/common/org_sidebar';
import LowerEvent from '@/components/lowers/lower_event';
import FollowBtn from '@/components/common/follow_btn';
import UserHoverCard from '@/components/common/user_hover_card';
import Report from '@/components/common/report';
import SignUp from '@/components/common/signup_box';
import { setCurrentChatID } from '@/slices/messagingSlice';
import SendMessage from '@/sections/explore/send_message';

interface Props {
  id: string;
}

const Event = ({ id }: Props) => {
  const [event, setEvent] = useState(initialEvent);
  const [similarEvents, setSimilarEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const [eventLikes, setEventLikes] = useState(0);
  const [clickedOnChat, setClickedOnChat] = useState(false);
  const [clickedOnReport, setClickedOnReport] = useState(false);

  const user = useSelector(userSelector);

  const dispatch = useDispatch();

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
            alt=""
            className={`${host ? 'w-8 h-8' : 'w-6 h-6'} rounded-full cursor-pointer`}
          />
          <div className={`w-fit ${host ? 'text-xl' : 'text-base'} font-medium cursor-pointer`}>{user.name}</div>
        </div>
        <FollowBtn toFollowID={user.id} smaller={true} />
      </div>
    </div>
  );

  const AboutHosts = () => (
    <div className="w-2/5 max-md:w-full flex flex-col gap-6">
      <Image
        width={500}
        height={500}
        src={`${EVENT_PIC_URL}/${event.coverPic}`}
        alt="Event Picture"
        className="w-full object-cover rounded-xl"
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
      {event.links && event.links.length > 0 && (
        <div className="w-full flex flex-col gap-4">
          <div className="text-sm font-medium text-gray-500 border-b-2 border-gray-300 pb-2">MORE ABOUT THE EVENT</div>
          <div className="w-full flex flex-wrap gap-4">
            {event.links?.map(link => (
              <Link key={link} href={link} target="_blank">
                {getIcon(getDomainName(link), 22, 'regular')}
              </Link>
            ))}
          </div>{' '}
        </div>
      )}
      <div className="w-full flex flex-col gap-1 text-sm">
        <div
          onClick={handleChat}
          className="w-fit font-medium text-primary_black hover:text-gray-600 transition-ease-300 cursor-pointer"
        >
          Contact the Host
        </div>
        <div
          onClick={() => setClickedOnReport(true)}
          className="w-fit font-medium text-primary_black hover:text-primary_danger transition-ease-300 cursor-pointer"
        >
          Report Event
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
        <div className="w-full py-12 px-20 max-md:p-2 flex flex-col transition-ease-out-500 font-primary">
          {loading ? (
            <Loader />
          ) : (
            <div className="w-[70vw] max-md:w-full mx-auto flex flex-col gap-12">
              <div className="w-full flex max-md:flex-col gap-12 max-md:px-2">
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
