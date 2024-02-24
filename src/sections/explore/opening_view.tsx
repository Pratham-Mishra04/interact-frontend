import LowerOpening from '@/components/lowers/lower_opening';
import { Opening } from '@/types';
import { initialOpening } from '@/types/initials';
import { ArrowArcLeft, Buildings } from '@phosphor-icons/react';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import ApplyOpening from './apply_opening';
import { useSelector } from 'react-redux';
import { userIDSelector, userSelector } from '@/slices/userSlice';
import Link from 'next/link';
import { useWindowWidth } from '@react-hook/window-size';
import SignUp from '@/components/common/signup_box';
import UpdateResume from '../settings/update_resume';

interface Props {
  opening: Opening;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setOpening: React.Dispatch<React.SetStateAction<Opening>>;
  org?: boolean;
  showBack?: boolean;
  fullWeight?: boolean;
}

const OpeningView = ({ opening, setShow, setOpening, org = false, showBack = false, fullWeight = false }: Props) => {
  const [clickedOnApply, setClickedOnApply] = useState(false);
  const [clickedOnAddResume, setClickedOnAddResume] = useState(false);

  const applications = useSelector(userSelector).applications;

  const width = useWindowWidth();

  useEffect(() => {
    if (width < 760) {
      document.documentElement.style.overflowY = 'hidden';
      document.documentElement.style.height = '100vh';

      return () => {
        document.documentElement.style.overflowY = 'auto';
        document.documentElement.style.height = 'auto';
      };
    }
  }, []);

  const userID = useSelector(userIDSelector) || '';

  return (
    <>
      {clickedOnAddResume ? (
        <UpdateResume setShow={setClickedOnAddResume} />
      ) : clickedOnApply ? (
        userID != '' ? (
          <ApplyOpening
            opening={opening}
            setShow={setClickedOnApply}
            setOpening={setOpening}
            setAddResume={setClickedOnAddResume}
            org={org}
          />
        ) : (
          <SignUp setShow={setClickedOnApply} />
        )
      ) : (
        <></>
      )}
      <div
        className={`sticky max-md:fixed top-[152px] bg-white dark:bg-transparent max-md:top-navbar max-md:right-0 ${
          fullWeight ? 'w-full' : 'w-[55%]'
        } max-md:w-full h-[70vh] max-md:max-h-screen max-md:h-base z-20 max-lg:z-50 max-md:backdrop-blur-2xl max-md:backdrop-brightness-90 overflow-y-auto flex flex-col gap-6 justify-between max-md:gap-8 px-12 py-10 max-md:p-8 font-primary dark:text-white border-[1px] max-md:border-0 border-primary_btn  dark:border-dark_primary_btn rounded-lg max-md:rounded-none max-md:animate-fade_third`}
      >
        <div className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-2 max-md:gap-6">
            <ArrowArcLeft
              className={`cursor-pointer ${!showBack ? 'md:hidden' : ''}`}
              size={24}
              onClick={() => {
                setShow(false);
                setOpening(initialOpening);
              }}
            />
            <div className="flex max-md:flex-col flex-wrap justify-between items-center max-md:items-start gap-2">
              <div className="font-bold text-4xl text-gradient">{opening.title}</div>
              <LowerOpening opening={opening} org={org} />
            </div>
            <div className="w-full flex items-center justify-between flex-wrap gap-2 text-sm">
              {org ? (
                <Link
                  href={`/explore/organisation/${opening.organization?.user.username}`}
                  target="_blank"
                  className="flex-center gap-1 hover-underline-animation after:bg-black font-semibold text-lg"
                >
                  {opening.organization?.title} <Buildings />
                </Link>
              ) : (
                <Link
                  href={`/explore?pid=${opening.project?.slug}`}
                  target="_blank"
                  className="hover-underline-animation after:bg-black font-semibold text-lg"
                >
                  {opening.project?.title}
                </Link>
              )}{' '}
              <div className="w-fit flex gap-2">
                <div className="flex gap-1">
                  <div>•</div>
                  <div>{moment(opening.createdAt).fromNow()}</div>
                </div>
                <div className="flex gap-1">
                  <div>•</div>
                  <div>
                    {opening.noApplications} application{opening.noApplications == 1 ? '' : 's'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="font-bold text-xl text-gradient">About this role</div>
            </div>
            <div className="whitespace-pre-wrap">{opening.description}</div>
            <div className="w-full flex flex-wrap gap-2">
              {opening.tags &&
                opening.tags.map(tag => {
                  return (
                    <Link
                      href={'/explore?search=' + tag}
                      target="_blank"
                      key={tag}
                      className="flex-center p-2 font-primary text-xs dark:text-white border-[1px] border-primary_btn  dark:border-dark_primary_btn rounded-xl"
                    >
                      {tag}
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>

        {applications?.includes(opening.id) ? (
          <div className="w-[120px] p-2 flex-center text-white font-medium border-[1px] border-primary_btn  dark:border-dark_primary_btn bg-gradient-to-r from-dark_secondary_gradient_start to-dark_secondary_gradient_end rounded-lg cursor-default">
            Applied
          </div>
        ) : (
          <div
            onClick={() => setClickedOnApply(true)}
            className="w-[120px] p-2 flex-center font-medium border-[1px] hover:text-white border-dark_primary_btn bg-gradient-to-r hover:from-dark_secondary_gradient_start hover:to-dark_secondary_gradient_end rounded-lg cursor-pointer"
          >
            Apply
          </div>
        )}
      </div>
    </>
  );
};

export default OpeningView;
