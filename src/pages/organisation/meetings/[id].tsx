import CopyClipboardButton from '@/components/buttons/copy_clipboard_btn';
import PrimaryButton from '@/components/buttons/primary_btn';
import ConfirmDelete from '@/components/common/confirm_delete';
import Loader from '@/components/common/loader';
import OrgSidebar from '@/components/common/org_sidebar';
import PictureList from '@/components/common/picture_list';
import Tags from '@/components/common/tags';
import RecordingsTable from '@/components/tables/meetings/recordings';
import SessionDetailsTable from '@/components/tables/meetings/session_details';
import SessionTable from '@/components/tables/meetings/sessions';
import ToolTip from '@/components/utils/tooltip';
import { ORG_MEMBER, ORG_SENIOR } from '@/config/constants';
import { SERVER_ERROR } from '@/config/errors';
import { USER_PROFILE_PIC_URL } from '@/config/routes';
import deleteHandler from '@/handlers/delete_handler';
import getHandler from '@/handlers/get_handler';
import postHandler from '@/handlers/post_handler';
import { useOrgAccess } from '@/hooks/use-org-access';
import AddMeetingParticipants from '@/sections/organization/meetings/add_participants';
import EditMeeting from '@/sections/organization/meetings/edit_meeting';
import ParticipantsList from '@/sections/organization/meetings/view_participants';
import { currentOrgSelector } from '@/slices/orgSlice';
import { userSelector } from '@/slices/userSlice';
import { Session } from '@/types';
import { initialMeeting } from '@/types/initials';
import { getUserFromState } from '@/utils/funcs/redux';
import renderContentWithLinks from '@/utils/funcs/render_content_with_links';
import { getNextSessionTime } from '@/utils/funcs/session_details';
import Toaster from '@/utils/toaster';
import OrgMembersOnlyAndProtect from '@/utils/wrappers/org_members_only';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import { Pen, Record, Trash } from '@phosphor-icons/react';
import moment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import { GetServerSidePropsContext } from 'next/types';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

interface Props {
  id: string;
}

const Meeting = ({ id }: Props) => {
  const [meeting, setMeeting] = useState(initialMeeting);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Ended');
  const [clickedOnSession, setClickedOnSession] = useState(false);
  const [clickedSessionID, setClickedSessionID] = useState('');
  const [clickedOnViewParticipants, setClickedOnViewParticipants] = useState(false);
  const [clickedOnAddParticipants, setClickedOnAddParticipants] = useState(false);
  const [clickedOnViewRecordings, setClickedOnViewRecordings] = useState(false);
  const [clickedOnEdit, setClickedOnEdit] = useState(false);
  const [clickedOnDelete, setClickedOnDelete] = useState(false);

  const user = useSelector(userSelector);
  const currentOrg = useSelector(currentOrgSelector);

  const isMember = useOrgAccess(ORG_MEMBER);
  const isSenior = useOrgAccess(ORG_SENIOR);

  const getMeeting = async () => {
    const URL = `/org/${currentOrg.id}/meetings/${id}`;
    const res = await getHandler(URL);
    if (res.statusCode === 200) {
      setMeeting(res.data.meeting);
      setLoading(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      }
      setLoading(false);
    }
  };

  const getSessions = async () => {
    const URL = `/org/${currentOrg.id}/meetings/sessions/${id}`;
    const res = await getHandler(URL);
    if (res.statusCode === 200) {
      setSessions(res.data.sessions);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      }
      window.location.assign('/organisation/meetings');
    }
  };

  const handleJoinMeeting = async () => {
    await getHandler(`/org/${currentOrg.id}/meetings/token/${id}`)
      .then(res => {
        if (res.statusCode === 200) {
          const authToken = res.data.authToken;
          if (!authToken || authToken == '') {
            Toaster.error(SERVER_ERROR, 'error_toaster');
            return;
          }
          window.location.assign(`/organisation/meetings/live?id=${id}&token=${authToken}`);
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

  useEffect(() => {
    getMeeting();
    getSessions();
  }, []);

  const handleDelete = async () => {
    const toaster = Toaster.startLoad('Deleting Meeting...');

    const URL = `/org/${currentOrg.id}/meetings/${meeting.id}`;

    const res = await deleteHandler(URL);
    if (res.statusCode === 204) {
      setClickedOnDelete(false);
      Toaster.stopLoad(toaster, 'Meeting Deleted', 1);
      window.location.assign('/organisation/meetings');
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
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

  const isParticipant = () => {
    if (meeting.isOpenForMembers) return true;
    return meeting.participants.map(u => u.id).includes(user.id) || meeting.userID == user.id;
  };

  const handleRSVP = async () => {
    const toaster = Toaster.startLoad('Confirming Participation...');

    const URL = `/org/${currentOrg.id}/meetings/rsvp/${meeting.id}`;

    const res = await postHandler(URL, {});
    if (res.statusCode === 200) {
      setMeeting(prev => {
        return { ...prev, rsvp: [...prev.rsvp, getUserFromState()] };
      });
      Toaster.stopLoad(toaster, 'Participation Confirmed!', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  return (
    <BaseWrapper title={`Meetings | ${currentOrg.title}`}>
      <OrgSidebar index={16} />
      <MainWrapper>
        <div className="w-full flex flex-col gap-4 p-base_padding">
          {clickedOnSession && (
            <SessionDetailsTable
              sessionID={clickedSessionID}
              meetingHostID={meeting.userID}
              session={sessions.filter(session => session.id == clickedSessionID)[0]}
              setShow={setClickedOnSession}
            />
          )}
          {clickedOnViewRecordings && <RecordingsTable meetingID={id} setShow={setClickedOnViewRecordings} />}
          {clickedOnAddParticipants ? (
            <AddMeetingParticipants meeting={meeting} setMeeting={setMeeting} setShow={setClickedOnAddParticipants} />
          ) : (
            clickedOnViewParticipants && (
              <ParticipantsList
                meeting={meeting}
                title="Participants"
                setShow={setClickedOnViewParticipants}
                setClickedOnAddParticipants={setClickedOnAddParticipants}
                setMeeting={setMeeting}
              />
            )
          )}
          {clickedOnEdit && <EditMeeting setShow={setClickedOnEdit} meeting={meeting} setMeeting={setMeeting} />}
          {clickedOnDelete && <ConfirmDelete handleDelete={handleDelete} setShow={setClickedOnDelete} />}
          {loading ? (
            <Loader />
          ) : (
            <div className="w-full flex flex-col gap-6">
              <div className="w-full flex flex-col gap-6">
                <div className="w-full flex flex-col gap-1">
                  <div className="w-full flex max-md:flex-col max-md:gap-4 md:items-center justify-between flex-wrap mb-4">
                    <div className="flex-center gap-2">
                      {/*
                      //TODO back button
                      <ArrowLeft size={24} /> */}
                      <div className="max-md:w-full text-5xl max-md:text-3xl font-semibold">{meeting.title}</div>
                      <div className="relative group">
                        <ToolTip
                          content="Copy Meeting Link"
                          styles={{
                            fontSize: '10px',
                            padding: '2px',
                            width: '120px',
                            top: '-60%',
                            left: '50%',
                            translate: '-50% 0',
                            border: 'none',
                          }}
                        />
                        <CopyClipboardButton
                          url={`organisations?oid=${currentOrg.id}&redirect_url=/meetings/${id}`}
                          iconOnly={true}
                          size={28}
                        />
                      </div>
                    </div>
                    <div className="w-fit flex-center gap-4">
                      {isMember && !meeting.isLive && sessions && sessions.length > 0 && (
                        <Record
                          onClick={() => setClickedOnViewRecordings(true)}
                          className=" cursor-pointer"
                          size={28}
                          weight="duotone"
                        />
                      )}
                      {!meeting.eventID && isSenior && (
                        <Pen onClick={() => setClickedOnEdit(true)} className="cursor-pointer" size={28} />
                      )}
                      {isSenior && (
                        <Trash onClick={() => setClickedOnDelete(true)} className="cursor-pointer" size={28} />
                      )}
                      <button
                        disabled={status != 'Live' && status != 'Idle'}
                        onClick={handleJoinMeeting}
                        className="w-40 text-lg text-center font-medium px-4 py-2 bg-white disabled:hover:bg-white hover:bg-blue-50 active:bg-blue-100 text-primary_text transition-ease-500 rounded-lg cursor-pointer animate-fade_third disabled:opacity-50 disabled:hover:bg-primary_comp disabled:cursor-default"
                      >
                        {status == 'Live' || status == 'Idle' ? 'Join Meet' : 'Not Live'}
                      </button>
                    </div>
                  </div>
                  <div className="w-full flex max-md:flex-col gap-8">
                    <div className="w-2/3 max-md:w-full flex flex-col gap-6">
                      <div className="flex items-center gap-2">
                        <div
                          className={`text-xs px-2 py-1 dark:text-primary_black ${
                            meeting.isOpenForMembers ? 'bg-priority_low' : 'bg-priority_high'
                          } rounded-full `}
                        >
                          {meeting.isOpenForMembers ? 'Open for members' : 'Restricted'}
                        </div>
                        <div
                          className={`text-xs px-2 py-1 dark:text-primary_black ${
                            meeting.allowExternalParticipants ? 'bg-priority_low' : 'bg-priority_high'
                          } rounded-full `}
                        >
                          {meeting.allowExternalParticipants
                            ? 'External Participants Allowed'
                            : 'External Participants Not Allowed'}
                        </div>
                      </div>
                      <div className="w-full flex flex-col gap-2">
                        <div className="">{renderContentWithLinks(meeting.description)}</div>
                        {meeting.tags && <Tags tags={meeting.tags} displayAll={true} />}
                      </div>

                      <div className="w-full flex items-center justify-between">
                        <Block
                          label="Status"
                          child={
                            <div
                              className={`w-fit text-sm px-2 py-1 dark:text-primary_black ${
                                status == 'Live'
                                  ? 'bg-priority_low'
                                  : status == 'Ended'
                                  ? 'bg-priority_high'
                                  : 'bg-priority_mid'
                              } rounded-full `}
                            >
                              {status}
                            </div>
                          }
                        />
                        <Block
                          label="Frequency"
                          child={
                            <div
                              className={`w-fit text-sm px-2 py-1 dark:text-primary_black ${
                                meeting.frequency == 'none' ? 'bg-blue-200' : 'bg-priority_mid'
                              } rounded-full capitalize`}
                            >
                              {meeting.frequency == 'none' ? 'One Time' : meeting.frequency}
                            </div>
                          }
                          alignEnd={true}
                        />
                      </div>

                      <div className="w-full flex items-center justify-between">
                        {meeting.frequency == 'none' ? (
                          <>
                            <Block
                              label="Start Time"
                              child={<div>{moment(meeting.startTime).format('hh:mm A, ddd MMM DD')}</div>}
                            />
                            <Block
                              label="Expected End Time"
                              child={<div>{moment(meeting.endTime).format('hh:mm A, ddd MMM DD')}</div>}
                              alignEnd={true}
                            />
                          </>
                        ) : (
                          <>
                            <Block label="Next Session Start Time" child={<div>{getNextSessionTime(meeting)}</div>} />
                            <Block
                              label="Expected End Time"
                              child={<div>{getNextSessionTime(meeting, true)}</div>}
                              alignEnd={true}
                            />
                          </>
                        )}
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

                      {(!meeting.isOpenForMembers || meeting.allowExternalParticipants) && (
                        <div className="w-fit flex flex-col gap-1">
                          <div className="text-sm font-medium uppercase text-gray-700 dark:text-white">
                            Accepted Users
                          </div>
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
                      )}
                    </div>

                    {!meeting.isLive &&
                      moment()
                        .utcOffset('+05:30')
                        .isBefore(moment(getNextSessionTime(meeting), 'hh:mm A, ddd MMM DD').utcOffset('+05:30')) && (
                        <div className="w-1/3 max-md:w-full flex flex-col gap-4">
                          {meeting.rsvp && meeting.rsvp.length > 0 && (
                            <div className="w-full bg-white flex flex-col gap-2 rounded-md p-4 shadow-md">
                              <div className="w-full text-2xl font-semibold text-primary_black">
                                Confirmed Participants
                              </div>
                              <div className="w-full max-h-52 overflow-y-auto flex flex-col gap-2">
                                {meeting.rsvp.map(user => (
                                  <div
                                    key={user.id}
                                    className="w-full h-12 bg-white rounded-xl border-gray-400 flex text-sm text-primary_black transition-ease-300"
                                  >
                                    <div className="w-full flex items-center gap-1">
                                      <Image
                                        crossOrigin="anonymous"
                                        width={50}
                                        height={50}
                                        alt={'User Pic'}
                                        src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
                                        placeholder="blur"
                                        blurDataURL={user.profilePicBlurHash || 'no-hash'}
                                        className="w-8 h-8 rounded-full z-[1]"
                                      />
                                      <div className="flex-center gap-2">
                                        <div className="font-medium text-lg">{user.name}</div>
                                        <div className="text-xs">@{user.username}</div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {isParticipant() && !meeting?.rsvp.map(u => u.id).includes(user.id) && (
                            <div className="w-full bg-white dark:bg-dark_primary_comp flex flex-col gap-2 rounded-md p-4 shadow-md">
                              <div className="w-full text-2xl font-semibold text-primary_black dark:text-white">
                                RSVP Now!
                              </div>
                              <div className="text-sm">
                                Looks like you haven&apos;t confirmed your presence yet. Click the button below and let
                                other participants know you&apos;ll be joining the meeting!
                              </div>
                              <div className="w-full flex-center mt-2">
                                <PrimaryButton
                                  label="Yes, i will be joining the meeting."
                                  width="fit"
                                  textSize="sm"
                                  onClick={handleRSVP}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                </div>
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
          )}
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.query;

  return {
    props: { id },
  };
}

export default OrgMembersOnlyAndProtect(Meeting);
