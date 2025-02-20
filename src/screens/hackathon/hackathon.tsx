import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { EVENT_PIC_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import type { Event, Hackathon, User } from '@/types';
import Link from 'next/link';
import UserHoverCard from '@/components/common/user_hover_card';
import FollowBtn from '@/components/common/follow_btn';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import { useDispatch } from 'react-redux';
import { setCurrentChatID } from '@/slices/messagingSlice';
import SendMessage from '@/sections/explore/send_message';
import Report from '@/components/common/report';
import SignUp from '@/components/common/signup_box';
import { getHackathonStatus } from '@/utils/funcs/hackathon';
import moment from 'moment';
import SecondaryButton from '@/components/buttons/secondary_btn';
import LowerEvent from '@/components/lowers/lower_event';
import Tags from '@/components/common/tags';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Editor from '@/components/editor';
import Links from '@/components/explore/show_links';
import { formatPrice } from '@/utils/funcs/misc';
import { EVENT_PIC_HASH_DEFAULT } from '@/config/constants';
import HackathonTimeline from '@/components/explore/hackathon_timeline';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Input from '@/components/form/input';
import { Button } from '@/components/ui/button';

interface HackathonProps {
  event: Event;
  handleRegister: (pass?: string) => void;
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
  const [clickedOnChat, setClickedOnChat] = useState(false);
  const [clickedOnReport, setClickedOnReport] = useState(false);
  const [eventLikes, setEventLikes] = useState(event.noLikes);

  const hackathon = useMemo(() => event.hackathon, [event]);

  const timeline = useMemo(() => {
    if (!hackathon) return [];

    return [
      {
        title: 'Participant Registration Starts',
        timestamp: moment(hackathon.startTime),
      },
      {
        title: 'Team Registration Starts',
        timestamp: moment(hackathon.teamFormationStartTime),
      },
      {
        title: 'Team Registration Ends',
        timestamp: moment(hackathon.teamFormationEndTime),
      },
      ...hackathon.rounds
        ?.map(round => [
          {
            title: `Round ${round.index + 1} Starts`,
            timestamp: moment(round.startTime),
          },
          {
            title: `Judging Round ${round.index + 1} Starts`,
            timestamp: moment(round.judgingStartTime),
          },
          {
            title: `Round ${round.index + 1} Ends`,
            timestamp: moment(round.endTime),
          },
        ])
        .flat(),
      {
        title: 'Hackathon Ends',
        timestamp: moment(hackathon.endTime),
      },
    ];
  }, [hackathon]);

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

  const AboutHosts = ({ sticky }: { sticky: boolean }) => (
    <div
      className={`w-full bg-white dark:bg-dark_primary_comp_hover rounded-xl max-md:w-full ${
        sticky && 'shadow-lg sticky top-24'
      }`}
    >
      <div className="w-full flex flex-col gap-6 p-4">
        <div className="w-full flex flex-col gap-4">
          <div className="text-sm font-medium text-gray-500 dark:text-white border-b-2 border-gray-300 pb-2">
            HOSTED BY
          </div>
          <AboutUser user={event.organization.user} host={true} />
        </div>
        {hackathon?.coordinators && hackathon.coordinators.length > 0 && (
          <div className="w-full flex flex-col gap-4">
            <div className="text-sm font-medium text-gray-500 dark:text-white border-b-2 border-gray-300 pb-2">
              COORDINATORS
            </div>
            <div className="flex flex-col gap-2">
              {hackathon.coordinators.map(user => (
                <AboutUser key={user.id} user={user} />
              ))}
            </div>
          </div>
        )}
        {event.links && event.links.length > 0 && (
          <div className="w-full flex flex-col gap-4">
            <div className="text-sm font-medium text-gray-500 dark:text-white border-b-2 border-gray-300 pb-2">
              MORE ABOUT THE EVENT
            </div>
            <Links links={event.links} excludeTitle />
          </div>
        )}
        <div className="w-full flex flex-col gap-1 text-sm">
          <div
            onClick={handleChat}
            className="w-fit font-medium hover:text-gray-600 transition-ease-300 cursor-pointer"
          >
            Message the Host
          </div>
          <div
            onClick={() => setClickedOnReport(true)}
            className="w-fit font-medium hover:text-primary_danger transition-ease-300 cursor-pointer"
          >
            Report Event
          </div>
        </div>
      </div>
    </div>
  );

  const RegisterButton = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [password, setPassword] = useState('');

    const isRegistered = user.registeredEvents?.includes(event.id);
    const isLive = !hackathon?.isEnded;
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

    const handlePreRegister = () => {
      if (!hackathon?.isRestricted) handleRegister();
      else setIsDialogOpen(true);
    };

    return (
      <div className="w-full flex flex-col gap-2 items-center justify-center">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>This event is Restricted.</DialogTitle>
              <DialogDescription>
                To register for this event, you need a password. Please enter the password below.
              </DialogDescription>
            </DialogHeader>
            <Input val={password} setVal={setPassword} placeholder="Enter Password" maxLength={25} />
            <Button
              onClick={() => {
                handleRegister(password);
                setIsDialogOpen(false);
              }}
              className="w-full mt-4"
              variant="outline"
            >
              Submit
            </Button>
          </DialogContent>
        </Dialog>

        <div className="text-xs font-semibold text-gray-500 dark:text-white">This event is happening on Interact!</div>
        {user.organizationMemberships.map(membership => membership.organizationID).includes(event.organizationID) ||
        hackathon?.judges.map(u => u.id).includes(user.id) ? (
          <SecondaryButton label="Go to Dashboard" onClick={handleRedirect} />
        ) : isRegistered ? (
          isLive || now.isBetween(startTime, endTime) ? (
            <SecondaryButton label="Go to Dashboard" onClick={handleRedirect} />
          ) : isBeforeStart ? (
            <div className="w-full relative p-2 text-center bg-yellow-200 text-gray-700 dark:text-white rounded-lg font-medium cursor-default">
              Event starts in {timeUntilStart}!
            </div>
          ) : (
            <button
              type="submit"
              className="w-full relative p-2 bg-priority_high text-gray-700 dark:text-white rounded-lg cursor-default"
            >
              Event has Ended
            </button>
          )
        ) : now.isBefore(teamFormationEndTime) ? (
          <SecondaryButton label="Register Now!" onClick={handlePreRegister} />
        ) : (
          <div className="w-full relative p-2 text-center bg-priority_high text-gray-700 dark:text-white rounded-lg font-medium cursor-default">
            Registrations Closed
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {clickedOnChat &&
        (user.id !== '' ? (
          <SendMessage user={event.organization.user} setShow={setClickedOnChat} />
        ) : (
          <SignUp setShow={setClickedOnChat} />
        ))}
      {clickedOnReport &&
        (user.id !== '' ? (
          <Report eventID={event.id} setShow={setClickedOnReport} />
        ) : (
          <SignUp setShow={setClickedOnReport} />
        ))}
      {hackathon && (
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/3 space-y-6">
            <div className="bg-white dark:bg-dark_primary_comp_hover rounded-xl p-4 space-y-4 w-full">
              <div className="space-y-2">
                <Image
                  src={`${EVENT_PIC_URL}/${hackathon.coverPic}`}
                  width={400}
                  height={100}
                  alt="Event Picture"
                  className="w-full h-full rounded-xl object-cover"
                  placeholder="blur"
                  blurDataURL={
                    hackathon.blurHash
                      ? hackathon.blurHash === 'no-hash'
                        ? EVENT_PIC_HASH_DEFAULT
                        : hackathon.blurHash
                      : EVENT_PIC_HASH_DEFAULT
                  }
                />
                <LowerEvent event={event} numLikes={eventLikes} setNumLikes={setEventLikes} />
              </div>
              <div className="md:hidden">
                <RegisterButton />
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h1 className="text-5xl font-primary font-bold break-words">{hackathon.title}</h1>
                  <h3 className="text-xl font-semibold break-words">{hackathon.tagline}</h3>
                </div>
                <Tags tags={hackathon?.tags || []} displayAll />
                {hackathon.description && <Editor content={hackathon.description} editable={false} />}
              </div>
            </div>

            {hackathon.prizes && hackathon.prizes.length > 0 && (
              <Section title="Prizes">
                <div className="w-full bg-white dark:bg-dark_primary_comp_hover border-[1px] border-gray-200 dark:border-dark_primary_btn rounded-xl py-12 flex-center flex-col gap-1 shadow-sm">
                  <div className="text-5xl font-semibold">
                    ₹
                    {formatPrice(
                      hackathon.prizes.reduce((acc, prize) => {
                        acc = acc + prize.amount;
                        return acc;
                      }, 0)
                    )}{' '}
                  </div>
                  <div>Total Prize Pool</div>
                </div>
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {hackathon.prizes.map((prize, index) => (
                    <div
                      key={index}
                      className="w-full p-3 bg-white dark:bg-dark_primary_comp_hover border-[1px] border-gray-200 dark:border-dark_primary_btn rounded-xl shadow-sm"
                    >
                      <div className="text-xl font-medium break-words">{prize.title}</div>
                      <div className="break-words">₹{formatPrice(prize.amount)}</div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <Section title="Timeline">
              <HackathonTimeline timeline={timeline} />
            </Section>

            {hackathon.sponsors && hackathon.sponsors.length > 0 && (
              <Section title="Sponsors">
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {hackathon.sponsors.map((sponsor, index) => (
                    <Link
                      href={sponsor.link || '/'}
                      key={index}
                      className="w-full p-3 bg-white dark:bg-dark_primary_comp_hover border-[1px] border-gray-200 dark:border-dark_primary_btn rounded-xl shadow-sm hover:shadow-lg transition-ease-300"
                    >
                      <div className="text-xl font-medium break-words">{sponsor.title}</div>
                      <div className="break-words">{sponsor.description}</div>
                    </Link>
                  ))}
                </div>
              </Section>
            )}
          </div>

          <div className="w-full md:w-1/3 flex flex-col gap-2">
            <div className="w-full space-y-4 mb-2">
              <div className="max-md:hidden">
                <RegisterButton />
              </div>
              <h1 className="text-2xl font-semibold">{getHackathonStatus(hackathon)}</h1>
              <ProgressBar hackathon={hackathon} />
            </div>
            <AboutHosts sticky={!hackathon.faqs || hackathon.faqs.length == 0} />
            {hackathon.faqs && hackathon.faqs.length > 0 && (
              <div className="w-full bg-white dark:bg-dark_primary_comp_hover p-4 rounded-xl space-y-2 sticky top-24 mt-2">
                <h1 className="text-3xl font-primary font-semibold text-primary_black dark:text-white">FAQs</h1>
                <Accordion type="single" collapsible>
                  {hackathon.faqs.map((faq, index) => (
                    <AccordionItem key={index} value={faq.id}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const Section = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <div className="w-full bg-white dark:bg-dark_primary_comp_hover p-4 rounded-xl space-y-4">
    <h1 className="text-4xl font-primary font-semibold text-primary_black dark:text-white">{title}</h1>
    {children}
  </div>
);

export default Hackathon;
