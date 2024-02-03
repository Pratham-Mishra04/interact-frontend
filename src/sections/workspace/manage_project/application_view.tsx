import { Application } from '@/types';
import React, { useState } from 'react';
import { APPLICATION_RESUME_URL, APPLICATION_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import Image from 'next/image';
import getIcon from '@/utils/funcs/get_icon';
import Link from 'next/link';
import { ArrowArcLeft, ArrowUpRight } from '@phosphor-icons/react';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import getDomainName from '@/utils/funcs/get_domain_name';
import socketService from '@/config/ws';
import { SERVER_ERROR } from '@/config/errors';
import { initialApplication } from '@/types/initials';
import ConfirmDelete from '@/components/common/confirm_delete';
import { useSelector } from 'react-redux';
import { currentOrgIDSelector } from '@/slices/orgSlice';

interface Props {
  applicationIndex: number;
  applications: Application[];
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setApplications?: React.Dispatch<React.SetStateAction<Application[]>>;
  setFilteredApplications?: React.Dispatch<React.SetStateAction<Application[]>>;
  org?: boolean;
}

const ApplicationView = ({
  applicationIndex,
  applications,
  setShow,
  setApplications,
  setFilteredApplications,
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
      Toaster.stopLoad(toaster, 'Application added/removed from Shortlist', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }

    setMutex(false);
  };

  return (
    <>
      {clickedOnAccept ? (
        <ConfirmDelete
          setShow={setClickedOnAccept}
          handleDelete={handleAccept}
          title="Confirm Accept?"
          subtitle="You can later add/remove users from your project"
        />
      ) : (
        <></>
      )}
      {clickedOnReject ? (
        <ConfirmDelete setShow={setClickedOnReject} handleDelete={handleReject} title="Confirm Reject?" />
      ) : (
        <></>
      )}
      <div className="sticky max-lg:fixed top-[158px] bg-white max-lg:top-navbar max-lg:right-0 w-[55%] max-lg:w-full max-h-[70vh] max-lg:max-h-screen max-lg:h-base max-lg:z-50 max-lg:backdrop-blur-2xl max-lg:backdrop-brightness-90 overflow-y-auto flex flex-col justify-between gap-8 p-8 font-primary dark:text-white border-[1px] max-lg:border-0 border-primary_btn  dark:border-dark_primary_btn rounded-lg max-lg:rounded-none z-10">
        <div className="w-full flex flex-col gap-10 max-lg:gap-8">
          <ArrowArcLeft
            className="cursor-pointer lg:hidden"
            size={24}
            onClick={() => {
              setShow(false);
            }}
          />
          <div className="w-full flex max-lg:flex-col items-center gap-8">
            <Image
              crossOrigin="anonymous"
              width={100}
              height={100}
              alt={'User Pic'}
              src={`${USER_PROFILE_PIC_URL}/${application.user.profilePic}`}
              className={'rounded-full w-36 h-36'}
            />
            <div className="grow max-lg:w-3/5 max-md:w-full flex flex-col max-lg:items-center max-lg:text-center gap-1">
              <div className="w-full flex max-lg:flex-col flex-wrap items-center justify-between">
                <Link
                  target="_blank"
                  href={`/explore/user/${application.user.username}`}
                  className="flex items-center gap-1"
                >
                  <div className="text-2xl font-semibold hover-underline-animation after:bg-black">
                    {application.user.name}
                  </div>
                  <ArrowUpRight size={24} />
                </Link>
                <div className="flex gap-4">
                  {application.links?.map((link, index) => {
                    return (
                      <Link key={index} href={link} target="_blank">
                        {getIcon(getDomainName(link), 24)}
                      </Link>
                    );
                  })}
                </div>
              </div>
              <div className="font-medium">{application.user.tagline}</div>
              <div className="w-full flex justify-start max-lg:justify-center max-lg:mt-2 gap-6">
                <div className="flex gap-1">
                  <div className="font-bold">{application.user.noFollowers}</div>
                  <div>Follower{application.user.noFollowers != 1 ? 's' : ''}</div>
                </div>
                <div className="flex gap-1">
                  <div className="font-bold">{application.user.noFollowing}</div>
                  <div>Following</div>
                </div>
              </div>
              <div className="w-full flex flex-wrap items-center justify-start max-lg:justify-center gap-2 mt-2">
                {application.user.tags &&
                  application.user.tags.map(tag => {
                    return (
                      <div
                        className="flex-center text-xs px-2 py-1 border-[1px] border-primary_btn  dark:border-dark_primary_btn rounded-md"
                        key={tag}
                      >
                        {tag}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
          {application.email != '' ? (
            <div className="max-lg:w-3/5 max-md:w-full max-lg:text-center max-lg:mx-auto">
              Shared Email:{' '}
              <Link href={`mailto:${application.email}`} className="font-medium">
                {application.email}
              </Link>
            </div>
          ) : (
            <></>
          )}

          <div className="max-lg:w-3/5 max-md:w-full max-lg:text-center max-lg:mx-auto">{application.content}</div>
          {application.resume && application.resume != '' ? (
            <Link
              href={`${APPLICATION_RESUME_URL}/${application.resume}`}
              target="_blank"
              className="w-64 mx-auto p-2 flex-center bg-primary_comp dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active transition-ease-300 cursor-pointer rounded-lg font-medium text-lg"
            >
              View Resume
            </Link>
          ) : (
            <></>
          )}
        </div>

        {application.status == 0 || application.status == 1 ? (
          <div className="w-full flex justify-center gap-12 max-lg:gap-4 border-t-[1px] border-primary_btn pt-4">
            <div
              onClick={() => setClickedOnAccept(true)}
              className="w-32 p-2 flex-center dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active transition-ease-300 cursor-pointer rounded-lg font-medium text-lg"
            >
              Accept
            </div>
            <div
              onClick={() => setClickedOnReject(true)}
              className="w-32 p-2 flex-center dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active transition-ease-300 cursor-pointer rounded-lg font-medium text-lg"
            >
              Reject
            </div>
            <div
              onClick={handleShortlist}
              className={`w-32 p-2 flex-center ${
                application.status == 0
                  ? 'hover:bg-primary_comp_hover'
                  : 'bg-primary_comp_hover border-[1px] border-primary_btn  dark:border-dark_primary_btn'
              } hover:dark:bg-dark_primary_comp dark:active:bg-dark_primary_comp_active transition-ease-300 cursor-pointer rounded-lg font-medium text-lg`}
            >
              {application.status == 0 ? 'Shortlist' : 'Shortlisted'}
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default ApplicationView;
