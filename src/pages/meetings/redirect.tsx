import Loader from '@/components/common/loader';
import Sidebar from '@/components/common/sidebar';
import Tags from '@/components/common/tags';
import Separator from '@/components/ui/separator';
import { ORG_MEMBER, PROJECT_MEMBER } from '@/config/constants';
import { SERVER_ERROR } from '@/config/errors';
import { USER_COVER_PIC_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { userSelector } from '@/slices/userSlice';
import { Meeting } from '@/types';
import { initialMeeting } from '@/types/initials';
import { checkParticularOrgAccess, checkProjectAccess } from '@/utils/funcs/access';
import renderContentWithLinks from '@/utils/funcs/render_content_with_links';
import { getProjectPicHash, getProjectPicURL } from '@/utils/funcs/safe_extract';
import { getNextSessionTime } from '@/utils/funcs/session_details';
import Toaster from '@/utils/toaster';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import moment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import React, { ReactNode, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const Redirect = () => {
  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState(initialMeeting);
  const [status, setStatus] = useState('Ended');

  const user = useSelector(userSelector);

  const getMeeting = (id: string) => {
    const URL = `/meetings/quick/${id}`;
    getHandler(URL, undefined, true)
      .then(res => {
        if (res.statusCode === 200) {
          const meeting: Meeting = res.data.meeting;
          if (res.data.project) meeting.project = res.data.project;

          setMeeting(meeting);
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
    const searchParams = new URLSearchParams(window.location.search);

    const id = searchParams.get('id');
    if (!id) {
      Toaster.error('Invalid Meeting ID', 'error_toaster');
      return;
    }

    getMeeting(id);
  }, [window.location.search]);

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

  const handleJoinMeeting = () => {
    if (meeting.organizationID) {
      handleJoinOrgMeeting();
    } else if (meeting.applicationID) {
      handleJoinApplicationMeeting();
    } else {
      Toaster.error('Invalid Meeting', 'error_toaster');
    }
  };

  const handleJoinOrgMeeting = async () => {
    await getHandler(`/org/${meeting.organizationID}/meetings/token/${meeting.id}`)
      .then(res => {
        if (res.statusCode === 200) {
          const authToken = res.data.authToken;
          if (!authToken || authToken == '') {
            Toaster.error(SERVER_ERROR, 'error_toaster');
            return;
          }
          window.location.assign(`/organisation/meetings/live?id=${meeting.id}&token=${authToken}`);
        } else {
          Toaster.error(res.data.message || SERVER_ERROR, 'error_toaster');
        }
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  const handleJoinApplicationMeeting = async () => {
    await getHandler(
      `/applications/meeting/token/${
        !checkProjectAccess(user, PROJECT_MEMBER, meeting.project?.id) ? 'applicant/' : ''
      }${meeting.applicationID}`
    )
      .then(res => {
        if (res.statusCode === 200) {
          const authToken = res.data.authToken;
          if (!authToken || authToken == '') {
            Toaster.error(SERVER_ERROR, 'error_toaster');
            return;
          }
          window.location.assign(`/meetings/live?id=${meeting.id}&token=${authToken}`);
        } else {
          Toaster.error(res.data.message || SERVER_ERROR, 'error_toaster');
        }
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  return (
    <BaseWrapper>
      <Sidebar index={-1} />
      <MainWrapper restrictWidth>
        <div className="w-2/3 mx-auto h-fit bg-white dark:bg-dark_primary_comp rounded-md space-y-6 p-4">
          {loading ? (
            <Loader />
          ) : (
            <>
              <Image
                crossOrigin="anonymous"
                width={600}
                height={200}
                alt={'Cover Pic'}
                src={
                  meeting.project
                    ? getProjectPicURL(meeting.project)
                    : `${USER_COVER_PIC_URL}/${meeting.organization.user.coverPic}`
                }
                placeholder="blur"
                blurDataURL={
                  meeting.project
                    ? getProjectPicHash(meeting.project)
                    : meeting.organization.user.coverPicBlurHash || 'no-hash'
                }
                className="w-full h-64 rounded-t-md"
              />
              <div className="w-full space-y-2">
                <div className="max-md:w-full text-4xl max-md:text-2xl font-semibold">{meeting.title}</div>
                <div className="">{renderContentWithLinks(meeting.description)}</div>
                {meeting.tags && <Tags tags={meeting.tags} displayAll={true} />}
              </div>
              <Separator />
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
              <button
                disabled={status != 'Live' && status != 'Idle'}
                onClick={handleJoinMeeting}
                className="w-full text-lg text-center font-medium px-4 py-2 bg-white disabled:hover:bg-white hover:bg-blue-50 active:bg-blue-100 text-primary_text transition-ease-500 rounded-lg cursor-pointer animate-fade_third disabled:opacity-50 disabled:hover:bg-primary_comp disabled:cursor-default"
              >
                {status == 'Live' || status == 'Idle' ? 'Join Meet' : 'Not Live'}
              </button>
              <div className="w-fit mx-auto">
                {checkParticularOrgAccess(ORG_MEMBER, meeting.organization) ? (
                  <Link
                    href={`/organisations?oid=${meeting.organizationID}&redirect_url=/meetings/${meeting.id}`}
                    className="hover-underline-animation after:bg-black dark:after:bg-white"
                  >
                    View This Meeting in Organisation
                  </Link>
                ) : (
                  checkProjectAccess(user, PROJECT_MEMBER, meeting.project?.id) && (
                    <Link
                      href={`/projects/${meeting.project?.slug}`}
                      className="hover-underline-animation after:bg-black dark:after:bg-white"
                    >
                      View This Meeting in Project Application
                    </Link>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </MainWrapper>
    </BaseWrapper>
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

export default Redirect;
