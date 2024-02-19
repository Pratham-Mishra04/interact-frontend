import { Review } from '@/types';
import React, { useState } from 'react';
import Image from 'next/image';
import { ORG_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import { Trash, WarningCircle } from '@phosphor-icons/react';
import moment from 'moment';
import Toaster from '@/utils/toaster';
import deleteHandler from '@/handlers/delete_handler';
import { SERVER_ERROR } from '@/config/errors';
import ConfirmDelete from '../common/confirm_delete';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import LowerReview from '../lowers/lower_review';
import { ORG_MANAGER } from '@/config/constants';
import StarRating from '../organization/star_rating';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import Report from '../common/report';

interface Props {
  review: Review;
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
}

const ReviewCard = ({ review, setReviews }: Props) => {
  const [clickedOnDelete, setClickedOnDelete] = useState(false);
  const [clickedOnReport, setClickedOnReport] = useState(false);

  const [mutex, setMutex] = useState(false);

  const user = useSelector(userSelector);
  const currentOrgID = useSelector(currentOrgIDSelector);

  const handleDelete = async () => {
    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Deleting your review...');

    const URL = `${ORG_URL}/${review.organizationID}/reviews/${review.id}`;

    const res = await deleteHandler(URL);
    if (res.statusCode === 204) {
      setReviews(prev => prev.filter(r => r.id != review.id));

      Toaster.stopLoad(toaster, 'Review Deleted!', 1);
    } else {
      if (res.data.message != '') Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }

    setMutex(false);
  };

  return (
    <>
      {clickedOnDelete ? <ConfirmDelete setShow={setClickedOnDelete} handleDelete={handleDelete} /> : <></>}
      {clickedOnReport ? <Report setShow={setClickedOnReport} reviewID={review.id} /> : <></>}
      <div
        key={review.id}
        className="w-full flex flex-col gap-4 bg-white relative group hover:shadow-xl p-6 rounded-xl transition-ease-300"
      >
        {user.id == review.userID ? (
          <div
            onClick={el => setClickedOnDelete(true)}
            className=" hover:shadow-lg text-gray-500 text-xxs px-2 py-1 flex gap-2 absolute opacity-0 group-hover:opacity-100 top-2 right-2 transition-ease-300 rounded-lg "
          >
            <Trash onClick={() => setClickedOnDelete(true)} className="cursor-pointer" size={18} />
          </div>
        ) : user.organizationMemberships
            .filter(m => m.role == ORG_MANAGER)
            .map(m => m.organizationID)
            .includes(review.organizationID) ||
          (user.isOrganization && currentOrgID == review.organizationID) ? (
          <div
            onClick={el => setClickedOnReport(true)}
            className=" hover:shadow-lg text-gray-500 text-xxs px-2 py-1 flex gap-2 absolute opacity-0 group-hover:opacity-100 top-2 right-2 transition-ease-300 rounded-lg "
          >
            <WarningCircle className="cursor-pointer" size={18} />
          </div>
        ) : (
          <></>
        )}

        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image
              crossOrigin="anonymous"
              width={100}
              height={100}
              alt={'User Pic'}
              src={`${USER_PROFILE_PIC_URL}/${review.isAnonymous ? 'default.jpg' : review.user.profilePic}`}
              className={'rounded-full w-10 h-10'}
            />
            <div className="w-fit">
              <div className="text-xl font-medium">{review.isAnonymous ? 'Anonymous' : review.user.name}</div>
              <div className="text-xs">@{!review.isAnonymous ? review.user.username : 'interact_user'}</div>
            </div>
          </div>
          <div className="text-gray-400 font-medium text-xs">{moment(review.createdAt).fromNow()}</div>
        </div>

        <div className="w-full flex justify-between items-center">
          <LowerReview review={review} />
          <div className="w-fit flex gap-1">
            <StarRating
              fixRating={true}
              defaultRating={Math.floor(review.rating)}
              color={'#9275b9ba'}
              strokeColor={'#633267'}
              size={25}
            />
          </div>
        </div>

        <div className="text-primary_black text-sm">{review.content}</div>
      </div>
    </>
  );
};

export default ReviewCard;
