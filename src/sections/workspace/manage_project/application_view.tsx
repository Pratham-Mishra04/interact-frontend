import { Application, Meeting, Session } from '@/types';
import React, { ReactNode, useEffect, useState } from 'react';
import { APPLICATION_RESUME_URL, APPLICATION_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import Image from 'next/image';
import getIcon from '@/utils/funcs/get_icon';
import Link from 'next/link';
import { ArrowUpRight, Pen, X } from '@phosphor-icons/react';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import getDomainName from '@/utils/funcs/get_domain_name';
import socketService from '@/config/ws';
import { SERVER_ERROR } from '@/config/errors';
import { initialApplication } from '@/types/initials';
import ConfirmDelete from '@/components/common/confirm_delete';
import { useSelector } from 'react-redux';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import moment from 'moment';
import Tags from '@/components/common/tags';
import renderContentWithLinks from '@/utils/funcs/render_content_with_links';
import CommentBox from '@/components/comment/comment_box';
import Separator from '@/components/ui/separator';
import ScheduleApplicantMeeting from './schedule_applicant_meeting';
import { checkProjectAccess } from '@/utils/funcs/access';
import { PROJECT_MANAGER } from '@/config/constants';
import PictureList from '@/components/common/picture_list';
import CopyClipboardButton from '@/components/buttons/copy_clipboard_btn';
import ToolTip from '@/components/utils/tooltip';
import AddMeetingParticipants from '@/sections/organization/meetings/add_participants';
import ParticipantsList from '@/sections/organization/meetings/view_participants';
import EditMeeting from '@/sections/organization/meetings/edit_meeting';
import SessionTable from '@/components/tables/meetings/sessions';
import SessionDetailsTable from '@/components/tables/meetings/session_details';

interface Props {
  applicationIndex: number;
  applications: Application[];
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setApplications?: React.Dispatch<React.SetStateAction<Application[]>>;
  setFilteredApplications?: React.Dispatch<React.SetStateAction<Application[]>>;
  projectID?: string;
  org?: boolean;
}

const ApplicationView = ({
  applicationIndex,
  applications,
  setShow,
  setApplications,
  setFilteredApplications,
  projectID,
  org = false,
}: Props) => {
  const [clickedOnAccept, setClickedOnAccept] = useState(false);
  const [clickedOnReject, setClickedOnReject] = useState(false);
  const [mutex, setMutex] = useState(false);

  const application = applications[applicationIndex] || initialApplication;

  const currentOrgID = useSelector(currentOrgIDSelector);

  const handleAccept = async () => {
    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Accepting the Application...');

    const URL = org
      ? `/org/${currentOrgID}/applications/accept/${application.id}`
      : `${APPLICATION_URL}/accept/${application.id}`;

    const res = await getHandler(URL);
    if (res.statusCode === 200) {
      if (setApplications) {
        setApplications(prev =>
          prev.map(a => {
            if (a.id == application.id) {
              return { ...a, status: 2 };
            } else return a;
          })
        );
      }
      if (setFilteredApplications) {
        setFilteredApplications(prev =>
          prev.map(a => {
            if (a.id == application.id) {
              return { ...a, status: 2 };
            } else return a;
          })
        );
      }
      socketService.sendNotification(
        application.userID,
        `Your Application for ${org ? application.organization?.title : application.project?.title} got Selected!`
      );
      setClickedOnAccept(false);
      Toaster.stopLoad(toaster, 'Application accepted!', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }

    setMutex(false);
  };

  const handleReject = async () => {
    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Rejecting the Application...');

    const URL = org
      ? `/org/${currentOrgID}/applications/reject/${application.id}`
      : `${APPLICATION_URL}/reject/${application.id}`;

    const res = await getHandler(URL);
    if (res.statusCode === 200) {
      if (setApplications) {
        setApplications(prev =>
          prev.map(a => {
            if (a.id == application.id) {
              return { ...a, status: -1 };
            } else return a;
          })
        );
      }
      if (setFilteredApplications) {
        setFilteredApplications(prev =>
          prev.map(a => {
            if (a.id == application.id) {
              return { ...a, status: -1 };
            } else return a;
          })
        );
      }
      socketService.sendNotification(
        application.userID,
        `Your Application for ${org ? application.organization?.title : application.project?.title} got Rejected.`
      );
      setClickedOnReject(false);
      Toaster.stopLoad(toaster, 'Application rejected', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }

    setMutex(false);
  };

  const handleShortlist = async () => {
    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Adding/Removing from Shortlist...');

    const URL = org
      ? `/org/${currentOrgID}/applications/review/${application.id}`
      : `${APPLICATION_URL}/review/${application.id}`;

    const res = await getHandler(URL);
    if (res.statusCode === 200) {
      if (setApplications) {
        setApplications(prev =>
          prev.map(a => {
            if (a.id == application.id) {
              return { ...a, status: application.status == 1 ? 0 : 1 };
            } else return a;
          })
        );
      }
      if (setFilteredApplications) {
        setFilteredApplications(prev =>
          prev.map(a => {
            if (a.id == application.id) {
              return { ...a, status: application.status == 1 ? 0 : 1 };
            } else return a;
          })
        );
      }
      Toaster.stopLoad(
        toaster,
        application.status == 1 ? 'Application removed from shortlist' : 'Application Shortlisted',
        1
      );
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }

    setMutex(false);
  };

  const setMeeting = (
    setApplications
      ? (updateFn: (meeting?: Meeting) => Meeting) => {
          setApplications(prev =>
            prev.map(a => (a.id === application.id ? { ...a, meeting: updateFn(a.meeting) } : a))
          );
        }
      : () => {}
  ) as React.Dispatch<React.SetStateAction<Meeting>>;

  useEffect(() => {
    document.documentElement.style.overflowY = 'hidden';
    document.documentElement.style.height = '100vh';

    return () => {
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.height = 'auto';
    };
  }, []);

  return (
    <>
      {clickedOnAccept && (
        <ConfirmDelete
          setShow={setClickedOnAccept}
          handleDelete={handleAccept}
          title="Confirm Accept?"
          subtitle="You can later add/remove users from your project"
        />
      )}
      {clickedOnReject && (
        <ConfirmDelete setShow={setClickedOnReject} handleDelete={handleReject} title="Confirm Reject?" />
      )}
      <div className="fixed w-no_side_base_open max-md:w-screen h-base top-navbar right-0 border-white border-t-[1px] border-l-[1px] bg-white dark:bg-dark_primary_comp overflow-y-auto flex flex-col justify-between gap-8 p-8 max-md:px-4 font-primary z-10 max-md:z-20 animate-fade_third">
        <div className="w-full flex flex-col gap-6">
          <X
            className="fixed top-20 right-4 cursor-pointer"
            size={32}
            onClick={() => {
              setShow(false);
            }}
          />
          <div className="w-full flex max-lg:flex-col items-center gap-4">
            <Image
              crossOrigin="anonymous"
              width={100}
              height={100}
              alt={'User Pic'}
              src={`${USER_PROFILE_PIC_URL}/${application.user.profilePic}`}
              className="rounded-full w-32 h-32"
            />
            <div className="w-[calc(100%-144px)] max-lg:w-3/5 max-md:w-full flex flex-col max-lg:items-center max-lg:text-center gap-2">
              <Link target="_blank" href={`/users/${application.user.username}`} className="flex items-center gap-1">
                <div className="text-3xl font-semibold hover-underline-animation after:bg-black dark:after:bg-white">
                  {application.user.name}
                </div>
                <ArrowUpRight size={24} />
              </Link>
              <div className="font-medium">{application.user.tagline}</div>
              {/* <div className="w-full flex justify-start max-lg:justify-center max-lg:mt-2 gap-6">
                <div className="flex gap-1">
                  <div className="font-bold">{application.user.noFollowers}</div>
                  <div>Follower{application.user.noFollowers != 1 ? 's' : ''}</div>
                </div>
                <div className="flex gap-1">
                  <div className="font-bold">{application.user.noFollowing}</div>
                  <div>Following</div>
                </div>
              </div> */}
              <Tags tags={application.user?.tags} displayAll />
            </div>
          </div>
          {application.links && application.links.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="text-lg font-medium">Attached Links:</div>
              {application.links.map((link, index) => {
                return (
                  <Link key={index} href={link} target="_blank">
                    {getIcon(getDomainName(link), 32)}
                  </Link>
                );
              })}
            </div>
          )}

          {application.email != '' && (
            <div className="flex items-center gap-2 max-lg:w-3/5 max-md:w-full max-lg:text-center max-lg:mx-auto">
              <div className="text-lg font-medium">Shared Email:</div>
              <Link href={`mailto:${application.email}`} className="">
                {application.email}
              </Link>
            </div>
          )}

          {application.resume && application.resume != '' && (
            <div className="flex items-center gap-2 max-lg:w-3/5 max-md:w-full max-lg:text-center max-lg:mx-auto">
              <div className="text-lg font-medium">Shared Resume:</div>
              <Link
                href={`${APPLICATION_RESUME_URL}/${application.resume}`}
                target="_blank"
                className="w-64 mx-auto p-2 flex-center bg-primary_comp dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active transition-ease-300 cursor-pointer rounded-lg font-medium text-lg"
              >
                View
              </Link>
            </div>
          )}
          <Separator />
          <div className="w-full space-y-1">
            <div className="text-xl font-medium">Attached Cover Letter</div>
            <div className="max-lg:w-3/5 max-md:w-full max-lg:text-center max-lg:mx-auto">
              {renderContentWithLinks(application.content)}
            </div>
          </div>

          <div className="w-fit h-fit text-xs mx-auto">Applied {moment(application.createdAt).fromNow()}</div>
        </div>

        <div className="w-full space-y-1">
          <div className="text-xl font-medium">
            Conversations <span className="text-sm font-normal">(not visible to the applicant)</span>
          </div>
          <CommentBox
            item={application}
            type="application"
            userFetchURL={org ? `/org/${currentOrgID}/membership/members` : `/membership/members/${projectID}`}
          />
        </div>

        {/* {checkProjectAccess(PROJECT_MANAGER, application.projectID) && (
          <div className="w-full space-y-1">
            <div className="text-xl font-medium">
              {application.meetingID ? 'Scheduled Meeting' : 'Meet the Applicant!'}
            </div>
            <div>
              {application.meetingID && application.meeting ? (
                <MeetingCard meeting={application.meeting} setMeeting={setMeeting} />
              ) : (
                <ScheduleApplicantMeeting application={application} setApplicationMeeting={setMeeting} />
              )}
            </div>
          </div>
        )} */}

        {(application.status == 0 || application.status == 1) && (
          <div className="w-full flex justify-center gap-12 max-lg:gap-4 border-t-[1px] border-primary_btn pt-4">
            <div
              onClick={() => setClickedOnAccept(true)}
              className="w-32 py-2 font-medium dark:text-primary_black border-primary_btn bg-green-100 hover:bg-green-200 active:bg-priority_low flex-center rounded-lg transition-ease-300 cursor-pointer"
            >
              Accept
            </div>
            <div
              onClick={() => setClickedOnReject(true)}
              className="w-32 py-2 font-medium dark:text-primary_black border-primary_btn bg-red-100 hover:bg-red-200 active:bg-priority_high flex-center rounded-lg transition-ease-300 cursor-pointer"
            >
              Reject
            </div>
            <div
              onClick={handleShortlist}
              className={`w-32 py-2 flex-center ${
                application.status == 0
                  ? 'hover:bg-priority_mid dark:hover:text-primary_black'
                  : 'bg-priority_mid border-[1px] border-primary_btn  dark:border-dark_primary_btn dark:text-primary_black'
              } transition-ease-300 cursor-pointer rounded-lg font-medium`}
            >
              {application.status == 0 ? 'Shortlist' : 'Shortlisted'}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const MeetingCard = ({
  meeting,
  setMeeting,
}: {
  meeting: Meeting;
  setMeeting: React.Dispatch<React.SetStateAction<Meeting>>;
}) => {
  const [status, setStatus] = useState('Ended');
  const [clickedOnViewParticipants, setClickedOnViewParticipants] = useState(false);
  const [clickedOnAddParticipants, setClickedOnAddParticipants] = useState(false);
  const [clickedOnEdit, setClickedOnEdit] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [clickedOnSession, setClickedOnSession] = useState(false);
  const [clickedSessionID, setClickedSessionID] = useState('');

  useEffect(() => {
    const now = moment();
    setStatus(
      meeting.isLive
        ? 'Live'
        : moment(meeting.startTime).isBefore(now) && moment(meeting.endTime).isAfter(now)
        ? 'Idle'
        : meeting.frequency == 'none'
        ? moment(meeting.startTime).isBefore(now)
          ? 'Ended'
          : 'Scheduled'
        : 'Scheduled'
    );
  }, [meeting]);

  return (
    <div className="w-full space-y-4 bg-gray-100 p-4 rounded-lg">
      {clickedOnAddParticipants ? (
        <AddMeetingParticipants
          meeting={meeting}
          setMeeting={setMeeting}
          setShow={setClickedOnAddParticipants}
          applicationID={meeting.applicationID}
        />
      ) : (
        clickedOnViewParticipants && (
          <ParticipantsList
            meeting={meeting}
            setMeeting={setMeeting}
            title="Participants"
            setShow={setClickedOnViewParticipants}
            setClickedOnAddParticipants={setClickedOnAddParticipants}
            applicationID={meeting.applicationID}
          />
        )
      )}
      {clickedOnEdit && (
        <EditMeeting
          setShow={setClickedOnEdit}
          meeting={meeting}
          setMeeting={setMeeting}
          applicationID={meeting.applicationID}
        />
      )}
      {clickedOnSession && (
        <SessionDetailsTable
          sessionID={clickedSessionID}
          meetingHostID={meeting.userID}
          session={sessions.filter(session => session.id == clickedSessionID)[0]}
          setShow={setClickedOnSession}
          applicationID={meeting.applicationID}
        />
      )}
      <div className="w-full flex items-center justify-between">
        <div className="flex-center gap-2">
          <div className="max-md:w-full text-5xl max-md:text-3xl font-semibold">{meeting.title}</div>
          <div className="relative group">
            <ToolTip
              content="Copy Meeting Link"
              styles={{
                fontSize: '10px',
                padding: '2px',
                width: '120px',
                top: '-40%',
                left: '50%',
                translate: '-50% 0',
                border: 'none',
              }}
            />
            <CopyClipboardButton
              // url={`organisations?oid=${currentOrg.id}&redirect_url=/meetings/${id}`}
              url=""
              iconOnly={true}
              size={28}
            />
          </div>
          <Pen onClick={() => setClickedOnEdit(true)} className="cursor-pointer" size={28} />
        </div>
        <button
          disabled={status != 'Live' && status != 'Idle'}
          // onClick={handleJoinMeeting}
          className="w-40 text-lg text-center font-medium px-4 py-2 bg-white disabled:hover:bg-white hover:bg-blue-50 active:bg-blue-100 text-primary_text transition-ease-500 rounded-lg cursor-pointer animate-fade_third disabled:opacity-50 disabled:hover:bg-primary_comp disabled:cursor-default"
        >
          {status == 'Live' || status == 'Idle' ? 'Join Meet' : 'Not Live'}
        </button>
      </div>

      <div className="">{meeting.description}</div>

      <Block
        label="Status"
        child={
          <div className="w-fit flex gap-2">
            <div
              className={`w-fit text-xs px-2 py-1 dark:text-primary_black ${
                meeting.isOpenForMembers ? 'bg-priority_low' : 'bg-priority_high'
              } rounded-full `}
            >
              {meeting.isOpenForMembers ? 'Open for all project members' : 'Restricted'}
            </div>
            <div
              className={`w-fit text-sm px-2 py-1 dark:text-primary_black ${
                status == 'Live' ? 'bg-priority_low' : status == 'Ended' ? 'bg-priority_high' : 'bg-priority_mid'
              } rounded-full `}
            >
              {status}
            </div>
          </div>
        }
      />
      <div className="w-full flex items-center justify-between max-md:flex-col">
        <Block label="Start Time" child={<div>{moment(meeting.startTime).format('hh:mm A, ddd MMM DD')}</div>} />
        <Block
          label="Expected End Time"
          child={<div>{moment(meeting.endTime).format('hh:mm A, ddd MMM DD')}</div>}
          alignEnd={true}
        />
      </div>
      <Block
        label="Scheduled by"
        child={
          <div className="w-fit flex-center gap-1 mt-1">
            <Link href={`/users/${meeting.user.username}`} className="flex-center gap-1 font-medium">
              <Image
                crossOrigin="anonymous"
                width={200}
                height={200}
                alt={'User Pic'}
                src={`${USER_PROFILE_PIC_URL}/${meeting.user?.profilePic}`}
                placeholder="blur"
                blurDataURL={meeting.user?.profilePicBlurHash || 'no-hash'}
                className={'w-6 h-6 rounded-full object-cover'}
              />
              <div className="hover-underline-animation after:bg-gray-700">{meeting.user.name}</div>
            </Link>
            on
            <span>{moment(meeting.createdAt).format('DD MMMM YYYY')}</span>
          </div>
        }
      />
      <div className="w-fit flex flex-col gap-1">
        <div className="text-sm font-medium uppercase text-gray-700 dark:text-white">Accepted Users</div>
        {meeting.participants && meeting.participants.length > 0 ? (
          <span
            onClick={() => setClickedOnViewParticipants(true)}
            className="w-fit flex-center gap-1 font-medium cursor-pointer"
          >
            <PictureList users={meeting.participants} size={6} gap={3} />
          </span>
        ) : (
          <span onClick={() => setClickedOnAddParticipants(true)} className="cursor-pointer">
            None +
          </span>
        )}
      </div>
      {sessions && sessions.length > 0 && (
        <SessionTable
          sessions={sessions}
          setClickedOnSession={setClickedOnSession}
          setClickedSessionID={setClickedSessionID}
          org={false}
        />
      )}
    </div>
  );
};

interface BlockProps {
  label: string;
  child: ReactNode;
  alignEnd?: boolean;
}

const Block = ({ label, child, alignEnd = false }: BlockProps) => (
  <div className={`flex flex-col ${alignEnd && 'items-end'} gap-1`}>
    <div className="text-sm font-medium uppercase text-gray-700 dark:text-white">{label}</div>
    {child}
  </div>
);

export default ApplicationView;
