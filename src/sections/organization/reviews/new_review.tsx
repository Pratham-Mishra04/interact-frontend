import React, { useState } from 'react';
import Image from 'next/image';
import { ORG_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import { useSelector, useDispatch } from 'react-redux';
import { profilePicSelector } from '@/slices/userSlice';
import Toaster from '@/utils/toaster';
import postHandler from '@/handlers/post_handler';
import { SERVER_ERROR } from '@/config/errors';
import { X } from '@phosphor-icons/react';
import { Review, ReviewCounts, ReviewData } from '@/types';
import StarRating from '@/components/organization/star_rating';
import { reviewModalOpenSelector, setReviewModalOpen } from '@/slices/feedSlice';
import { useTheme } from 'next-themes';

interface Props {
  orgID: string;
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  setReviewData: React.Dispatch<React.SetStateAction<ReviewData>>;
}

const NewReview = ({ orgID, setReviews, setReviewData }: Props) => {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [mutex, setMutex] = useState(false);

  const profilePic = useSelector(profilePicSelector) || 'default.jpg';

  const submitHandler = async () => {
    if (rating == 0) {
      Toaster.error('Add a rating');
      return;
    }
    if (content == '') {
      Toaster.error('Content cannot be empty');
      return;
    }

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Adding your review...');

    const formData = { content, rating, isAnonymous };

    const URL = `${ORG_URL}/${orgID}/reviews`;

    const res = await postHandler(URL, formData);
    if (res.statusCode === 201) {
      const review = res.data.review;
      setReviews(prev => [review, ...prev]);
      setReviewData(prev => {
        return {
          ...prev,
          counts: {
            ...prev.counts,
            [rating]: prev.counts[rating as keyof ReviewCounts] + 1,
          },
          average: Number(((prev.average * prev.total + rating) / (prev.total + 1)).toFixed(2)),
          total: prev.total + 1,
        };
      });
      setContent('');
      setRating(0);
      setIsAnonymous(false);
      dispatch(setReviewModalOpen(!open));
      Toaster.stopLoad(toaster, 'Review Added!', 1);
    } else {
      if (res.data.message != '') Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }

    setMutex(false);
  };
  const dispatch = useDispatch();

  const isDarkMode = (useTheme().theme || '') === 'dark';

  const open = useSelector(reviewModalOpenSelector);
  if (!open) {
    return <></>;
  }

  return (
    <>
      <div className="w-[90%] lg:w-[40%] flex flex-col items-center gap-4  fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[100] bg-navbar dark:bg-dark_primary_comp rounded-xl py-6 px-8 shadow-xl animate-fade_third">
        <X
          size={20}
          className="absolute top-4 right-4 cursor-pointer"
          onClick={() => dispatch(setReviewModalOpen(!open))}
        />
        <h1 className="heading self-start text-2xl lg:text-3xl font-semibold text-gradient">Add a review</h1>
        <div className="w-full flex justify-between gap-4">
          <Image
            crossOrigin="anonymous"
            className="w-8 h-8 lg:w-12 lg:h-12 rounded-full cursor-default mt-2 border-2 border-dark_primary_btn p-1"
            width={50}
            height={50}
            alt="user"
            src={`${USER_PROFILE_PIC_URL}/${isAnonymous ? 'default.jpg' : profilePic}`}
          />
          <textarea
            value={content}
            maxLength={500}
            onChange={el => setContent(el.target.value)}
            onKeyDown={el => {
              if (el.key === 'Enter') submitHandler();
            }}
            className="w-[calc(100%-32px)]  max-md:text-sm border-[2px] border-dashed p-2 dark:border-dark_primary_btn rounded-lg dark:text-white dark:bg-dark_primary_comp focus:outline-none min-h-[4rem] max-h-64 max-md:w-full"
            placeholder="Add a Review (500 characters)"
          />
        </div>

        <div className="w-full flex flex-col gap-4 lg:flex-row justify-between items-center">
          <div className="w-full lg:w-fit flex flex-col gap-2">
            <div className="w-fit flex gap-1">
              <StarRating
                size={30}
                color={isDarkMode ? '#478EE1' : '#9275b9ba'}
                strokeColor={isDarkMode ? '#478eeb86' : '#633267'}
                onSetRating={setRating}
              />
            </div>
            <label className="flex w-fit cursor-pointer select-none items-center text-sm gap-2">
              <div className="font-semibold">Make this Anonymous</div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={() => setIsAnonymous(prev => !prev)}
                  className="sr-only"
                />
                <div
                  className={`box block h-6 w-10 rounded-full ${
                    isAnonymous ? 'bg-blue-300' : 'bg-black'
                  } transition-ease-300`}
                ></div>
                <div
                  className={`absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white transition ${
                    isAnonymous ? 'translate-x-full' : ''
                  }`}
                ></div>
              </div>
            </label>
          </div>

          <div
            className="h-fit text-sm max-md:text-xs dark:bg-dark_primary_comp hover:bg-primary_comp_hover hover:border-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active font-medium border-[1px] border-primary_btn  dark:border-dark_primary_btn rounded-md py-2 px-6  flex-center cursor-pointer max-md:h-10 max-md:w-fit transition-ease-300 hover:text-primary_text self-end"
            onClick={() => {
              submitHandler();
            }}
          >
            Submit
          </div>
        </div>
      </div>
      <div
        className="overlay w-full h-full fixed top-0 left-0 bg-backdrop backdrop-blur-sm z-[80] animate-fade_third"
        onClick={() => dispatch(setReviewModalOpen(!open))}
      ></div>
    </>
  );
};

export default NewReview;
