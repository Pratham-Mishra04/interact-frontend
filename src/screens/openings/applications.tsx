import Loader from '@/components/common/loader';
import { USER_PROFILE_PIC_URL, WORKSPACE_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { Application } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import moment from 'moment';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { setExploreTab } from '@/slices/feedSlice';
import NoApplications from '@/components/fillers/applications';
import { SERVER_ERROR } from '@/config/errors';
import { X, Plus, Check, Buildings } from '@phosphor-icons/react';
import { getProjectPicHash, getProjectPicURL } from '@/utils/funcs/safe_extract';

const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const getApplications = () => {
    const URL = `${WORKSPACE_URL}/applications`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          setApplications(res.data.applications || []);
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
    getApplications();
  }, []);

  const isOrg = (application: Application): boolean => {
    if (application.organizationID) return true;
    return false;
  };

  return (
    <div>
      {loading ? (
        <Loader />
      ) : applications.length > 0 ? (
        <div className="w-full flex flex-col gap-4">
          {applications.map(application => {
            return (
              <Link
                href={`/openings?oid=${application.openingID}`}
                onClick={() => dispatch(setExploreTab(1))}
                key={application.id}
                className="w-full relative font-primary dark:text-white border-[1px] border-gray-400 bg-gray-100 dark:bg-transparent  dark:border-dark_primary_btn rounded-lg p-6 max-lg:p-2 flex items-center gap-6 max-lg:gap-4 dark:hover:bg-dark_primary_comp_hover transition-ease-300 cursor-pointer animate-fade_third"
              >
                {(() => {
                  switch (application.status) {
                    case -1:
                      return (
                        <div className="absolute top-0 right-2 -translate-y-1/2 flex gap-1 items-center px-2 py-1 rounded-xl text-xs max-md:text-xxs bg-[#fbbebe] text-primary_black">
                          Rejected
                          <X weight="bold" size={16} />
                        </div>
                      );
                    case 0:
                      return (
                        <div className="absolute top-0 right-2 -translate-y-1/2 flex gap-1 items-center px-2 py-1 rounded-xl text-xs max-md:text-xxs bg-[#ffffff] text-primary_black">
                          Waiting
                        </div>
                      );
                    case 1:
                      return (
                        <div className="absolute top-0 right-2 -translate-y-1/2 flex gap-1 items-center px-2 py-1 rounded-xl text-xs max-md:text-xxs bg-[#fbf9be] text-primary_black">
                          Shortlisted
                          <Plus weight="bold" size={16} />
                        </div>
                      );
                    case 2:
                      return (
                        <div className="absolute top-0 right-2 -translate-y-1/2 flex gap-1 items-center px-2 py-1 rounded-xl text-xs max-md:text-xxs bg-[#bffbbe] text-primary_black">
                          Accepted
                          <Check weight="bold" size={16} />
                        </div>
                      );
                    default:
                      return <></>;
                  }
                })()}

                {isOrg(application) ? (
                  <Image
                    crossOrigin="anonymous"
                    width={100}
                    height={100}
                    alt={'User Pic'}
                    src={`${USER_PROFILE_PIC_URL}/${application.organization?.user.profilePic}`}
                    placeholder="blur"
                    blurDataURL={application.organization?.user.profilePicBlurHash || 'no-hash'}
                    className={'w-[120px] h-[120px] max-lg:w-[90px] max-lg:h-[90px] rounded-lg object-cover'}
                  />
                ) : (
                  <Image
                    crossOrigin="anonymous"
                    width={100}
                    height={100}
                    alt={'User Pic'}
                    src={getProjectPicURL(application.project)}
                    className={'w-fit h-[100px] max-lg:w-[90px] max-lg:h-[90px] rounded-lg object-cover'}
                    placeholder="blur"
                    blurDataURL={getProjectPicHash(application.project)}
                  />
                )}

                <div className="grow flex items-center justify-between">
                  <div className="w-5/6 flex flex-col gap-2">
                    <div className="w-fit font-bold text-2xl max-lg:text-lg text-gradient line-clamp-2">
                      {application.opening.title}
                    </div>
                    <div className="line-clamp-1 font-medium max-lg:text-sm">
                      {isOrg(application) ? (
                        <span className="w-fit flex-center gap-1">
                          {application.organization?.title} <Buildings />
                        </span>
                      ) : (
                        application.project?.title
                      )}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-xs">
                      {moment(application.createdAt).fromNow()}
                    </div>
                  </div>
                  {/* <div className="text-sm max-lg:text-xs">{getApplicationStatus(application.status)}</div> */}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <NoApplications />
      )}
    </div>
  );
};

export default Applications;
