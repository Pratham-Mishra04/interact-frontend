import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { EVENT_PIC_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import type { Event, Hackathon, User } from '@/types';
import Loader from '@/components/common/loader';
import Link from 'next/link';
import getIcon from '@/utils/funcs/get_icon';
import getDomainName from '@/utils/funcs/get_domain_name';
import UserHoverCard from '@/components/common/user_hover_card';
import FollowBtn from '@/components/common/follow_btn';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import { useDispatch } from 'react-redux';
import { setCurrentChatID } from '@/slices/messagingSlice';
import SendMessage from '@/sections/explore/send_message';
import Report from '@/components/common/report';
import SignUp from '@/components/common/signup_box';
import { formatHackathonDate, getHackathonStatus } from '@/utils/funcs/hackathon';
import moment from 'moment';
import SecondaryButton from '@/components/buttons/secondary_btn';
import LowerEvent from '@/components/lowers/lower_event';

interface HackathonProps {
  event: Event;
  handleRegister: () => void;
}

const ProgressBar: React.FC<{ hackathon: Hackathon }> = ({ hackathon }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const startTime = new Date(hackathon.startTime).getTime();
      const endTime = new Date(hackathon.endTime).getTime();
      const currentTime = new Date().getTime();

      if (currentTime < startTime) {
        setProgress(0);
      } else if (currentTime > endTime) {
        setProgress(100);
      } else {
        const totalDuration = endTime - startTime;
        const elapsedTime = currentTime - startTime;
        const progressPercentage = (elapsedTime / totalDuration) * 100;
        setProgress(progressPercentage);
      }
    };

    calculateProgress();
    const interval = setInterval(calculateProgress, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [hackathon]);

  return (
    <div className="w-full rounded-full h-3 bg-gray-300">
      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }}></div>
    </div>
  );
};

const Hackathon: React.FC<HackathonProps> = ({ event, handleRegister }) => {
  const [loading, setLoading] = useState(false);
  const [clickedOnChat, setClickedOnChat] = useState(false);
  const [clickedOnReport, setClickedOnReport] = useState(false);
  const [eventLikes, setEventLikes] = useState(0);

  const hackathon = useMemo(() => event.hackathon, [event]);

  const user = useSelector(userSelector);

  const dispatch = useDispatch();

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

  const AboutHosts = () => (
    <div className="w-full bg-white rounded-xl max-md:w-full shadow-lg">
      <div className="w-full flex flex-col gap-6 p-4">
        <div className="w-full flex flex-col gap-4">
          <div className="text-sm font-medium text-gray-500 border-b-2 border-gray-300 pb-2">HOSTED BY</div>
          <AboutUser user={event.organization.user} host={true} />
        </div>
        {hackathon?.coordinators && hackathon.coordinators.length > 0 && (
          <div className="w-full flex flex-col gap-4">
            <div className="text-sm font-medium text-gray-500 border-b-2 border-gray-300 pb-2">COORDINATORS</div>
            <div className="flex flex-col gap-2">
              {hackathon.coordinators.map(user => (
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
            Message the Host
          </div>
          <div
            onClick={() => setClickedOnReport(true)}
            className="w-fit font-medium text-primary_black hover:text-primary_danger transition-ease-300 cursor-pointer"
          >
            Report Event
          </div>
        </div>
      </div>
    </div>
  );

  const RegisterButton = () => {
    const isRegistered = user.registeredEvents?.includes(event.id);
    const isLive = !hackathon?.isEnded ?? false;
    const startTime = moment(hackathon?.startTime).utcOffset('+05:30');
    const endTime = moment(hackathon?.endTime).utcOffset('+05:30');
    const now = moment().utcOffset('+05:30');
    const isBeforeStart = now.isBefore(startTime);

    const teamFormationEndTime = moment(hackathon?.teamFormationEndTime).utcOffset('+05:30');

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

    const handleRedirect = async () => {
      window.location.assign(`${process.env.NEXT_PUBLIC_HACKATHONS_URL}?action=sync`);
    };

    return (
      <div className="w-full flex flex-col gap-2">
        <div className="text-xs font-semibold text-gray-500">This event is happening on Interact!</div>
        {user.organizationMemberships.map(membership => membership.organizationID).includes(event.organizationID) ? (
          <SecondaryButton label="Go to Dashboard" onClick={handleRedirect} />
        ) : isRegistered ? (
          isLive || now.isBetween(startTime, endTime) ? (
            <SecondaryButton label="Go to Dashboard" onClick={handleRedirect} />
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
        ) : now.isBefore(teamFormationEndTime) ? (
          <SecondaryButton label="Register Now!" onClick={handleRegister} />
        ) : (
          <div className="w-full relative p-2 text-center bg-priority_high text-gray-700 rounded-lg font-medium cursor-default">
            Registrations Closed
          </div>
        )}
      </div>
    );
  };

  return loading ? (
    <Loader />
  ) : (
    hackathon && (
      <div className="flex items-start justify-start p-8 flex-col">
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
        <div className="w-full h-90 max-md:h-fit relative">
          <Image
            width={500}
            height={280}
            src={`${EVENT_PIC_URL}/${hackathon.coverPic}`}
            alt="Event Picture"
            className="w-full h-full max-md:h-52 rounded-xl"
            placeholder="blur"
            blurDataURL={hackathon.blurHash || 'no-hash'}
          />
          <div className="w-full absolute top-0 flex flex-col gap-4 max-md:gap-2 md:items-end p-4">
            <div className="w-fit bg-white bg-opacity-25 backdrop-blur-sm px-6 max-md:px-4 py-2 rounded-lg max-md:text-sm font-medium">
              Starts: {moment(hackathon.startTime).format('HH:mma DD MMMM, YYYY')}
            </div>
            <div className="w-fit bg-white bg-opacity-25 backdrop-blur-sm px-6 max-md:px-4 py-2 rounded-lg max-md:text-sm font-medium">
              Ends: {moment(hackathon.endTime).format('HH:mma DD MMMM, YYYY')}
            </div>
          </div>
          <div className="w-full absolute max-md:static bottom-0 flex gap-8 max-md:gap-2 justify-end p-4 max-md:px-0">
            <div className="max-md:w-1/3 max-md:text-center bg-white bg-opacity-25 backdrop-blur-sm px-6 max-md:px-4 py-2 rounded-lg max-md:text-sm font-medium cursor-pointer">
              Tracks
            </div>
            <div className="max-md:w-1/3 max-md:text-center bg-white bg-opacity-25 backdrop-blur-sm px-6 max-md:px-4 py-2 rounded-lg max-md:text-sm font-medium cursor-pointer">
              Prizes
            </div>
            <div className="max-md:w-1/3 max-md:text-center bg-white bg-opacity-25 backdrop-blur-sm px-6 max-md:px-4 py-2 rounded-lg max-md:text-sm font-medium cursor-pointer">
              Rounds
            </div>
          </div>
        </div>

        <div className="flex max-lg:flex-col py-8 max-md:py-0 gap-4 justify-center items-center md:justify-start md:items-start w-full">
          <div className="w-2/3 max-md:w-full flex justify-center items-start flex-col">
            <div className="w-full flex flex-col gap-6 items-start justify-center lg:mb-0">
              <h1 className="text-5xl font-primary font-bold">{hackathon.title}</h1>
              <h3 className="text-xl font-semibold">{hackathon.tagline}</h3>
              {hackathon.description && (
                <div className="w-full flex flex-col gap-2">
                  <div className="text-sm font-medium text-gray-500">ABOUT THE EVENT</div>
                  <div className="text-lg">{hackathon.description}</div>
                </div>
              )}
              {hackathon.tags && hackathon.tags.length > 0 && (
                <div className="w-full flex flex-col gap-2">
                  <div className="text-sm font-medium text-gray-500">TAGS</div>
                  <div className="flex flex-wrap gap-2">
                    {hackathon.tags.map(tag => (
                      <Link
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
            </div>
            <div className="mt-6 flex flex-col lg:flex-row justify-center items-center">
              <div>
                {hackathon.sponsors.map((sponsor, index) => (
                  <div key={index} className="flex items-start p-4">
                    {/* <div className="w-24 h-24 relative mr-4">
                            <Image
                              src={`/${sponsor.coverPic}`}
                              alt={sponsor.name}
                              layout="fill"
                              className="object-cover rounded-full"
                            />
                          </div> */}
                    <div className="flex justify-center items-start flex-col mt-4">
                      <h3 className="text-3xl font-bold font-primary">{sponsor.name}</h3>
                      <p className="text-lg">{sponsor.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="w-[5px] rounded-full h-64 my-4 bg-black mx-12 border border-black hidden lg:block"></div>
              <div className="flex flex-row items-center mt-8 space-x-12">
                {hackathon.rounds.map((round, index) => (
                  <div key={index} className="flex flex-col items-center mb-8">
                    <div className="relative flex flex-col items-center mb-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      {index < hackathon.rounds.length && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-px h-16 bg-gray-300"></div>
                      )}
                    </div>
                    <div className="flex flex-col items-center w-48 p-4 border rounded shadow-lg">
                      <p className="font-primary mt-4">{formatHackathonDate(round.startTime)}</p>
                      <p className="font-primary">{new Date(round.startTime).toLocaleTimeString()}</p>
                      <p className="font-primary my-4">to</p>
                      <p className="font-primary">{formatHackathonDate(round.endTime)}</p>
                      <p className="font-primary">{new Date(round.endTime).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full mt-8">
              <h2 className="text-4xl font-bold font-primary mb-6 text-center">Tracks</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {hackathon.tracks.map((track, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <h3 className="text-2xl font-bold font-primary mb-4">{track.title}</h3>
                    <p className="text-lg text-gray-700">{track.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-1/3 max-lg:w-full flex flex-col gap-2">
            <LowerEvent event={event} numLikes={eventLikes} setNumLikes={setEventLikes} />
            <div className="w-full flex flex-col gap-4 mb-2">
              <RegisterButton />
              <h1 className="text-2xl font-semibold">{getHackathonStatus(hackathon)}</h1>
              <ProgressBar hackathon={hackathon} />
            </div>
            <AboutHosts />
          </div>
        </div>
      </div>
    )
  );
};

export default Hackathon;
