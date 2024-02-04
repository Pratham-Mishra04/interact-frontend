import { Application } from '@/types';
import React from 'react';
import Image from 'next/image';
import { PROJECT_PIC_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import moment from 'moment';

interface Props {
  application: Application;
  setClickedOnApplication: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedApplication: React.Dispatch<React.SetStateAction<Application>>;
  org?: boolean;
}

const ApplicationCard = ({ application, setClickedOnApplication, setClickedApplication, org }: Props) => {
  return (
    <div
      onClick={() => {
        setClickedApplication(application);
        setClickedOnApplication(true);
      }}
      className={`w-full font-primary dark:text-white border-[1px] border-primary_btn  dark:border-dark_primary_btn rounded-lg p-8 max-md:p-4 flex justify-between transition-ease-300 cursor-pointer`}
    >
      <div className="w-fit flex items-center gap-12  max-md:gap-4">
        {org ? (
          <Image
            crossOrigin="anonymous"
            width={50}
            height={50}
            alt={'User Pic'}
            src={`${USER_PROFILE_PIC_URL}/${application.opening.organization?.user.profilePic}`}
            className={'w-[120px] h-[120px] max-md:w-[90px] max-md:h-[90px] rounded-lg object-cover'}
          />
        ) : (
          <Image
            crossOrigin="anonymous"
            width={50}
            height={50}
            alt={'User Pic'}
            src={`${PROJECT_PIC_URL}/${application.opening.project?.coverPic}`}
            className={'w-[120px] h-[120px] max-md:w-[90px] max-md:h-[90px] rounded-lg object-cover'}
            placeholder="blur"
            blurDataURL={application.opening.project?.blurHash || 'no-hash'}
          />
        )}

        <div className="grow flex flex-col gap-4 max-md:gap-2">
          <div className="flex items-start justify-between">
            <div className="w-5/6 flex flex-col gap-1">
              <div className="font-bold text-2xl max-md:text-lg text-gradient">{application.opening.title}</div>
              <div className="text-lg max-md:text-sm">
                {org ? application.opening.organization?.title : application.opening.project?.title}
              </div>
            </div>
          </div>

          <div>{moment(application.createdAt).fromNow()}</div>
        </div>
      </div>
      <div>{application.status}</div>
    </div>
  );
};

export default ApplicationCard;
