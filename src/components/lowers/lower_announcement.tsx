import React, { useState, useEffect } from 'react';
import { Announcement, Post } from '@/types';
import getHandler from '@/handlers/get_handler';
import { useDispatch, useSelector } from 'react-redux';
import { setLikes, userIDSelector, userSelector } from '@/slices/userSlice';
import Export from '@phosphor-icons/react/dist/icons/Export';
import { ORG_URL, POST_URL } from '@/config/routes';
import Semaphore from '@/utils/semaphore';
import { configSelector, setUpdatingLikes } from '@/slices/configSlice';
import { ChatCircleText, HeartStraight, Lock, LockOpen } from '@phosphor-icons/react';
import SignUp from '../common/signup_box';
import CommentAnnouncement from '@/sections/lowers/comment_announcement';
import ShareAnnouncement from '@/sections/lowers/share_announcement';

interface Props {
  announcement: Announcement;
  setFeed?: React.Dispatch<React.SetStateAction<Post[]>>;
}

const LowerAnnouncement = ({ announcement, setFeed }: Props) => {
  const [liked, setLiked] = useState(false);
  const [numLikes, setNumLikes] = useState(announcement.noLikes);
  const [numComments, setNumComments] = useState(announcement.noComments);
  const [clickedOnComment, setClickedOnComment] = useState(false);
  const [clickedOnShare, setClickedOnShare] = useState(false);

  const [noUserClick, setNoUserClick] = useState(false);

  const user = useSelector(userSelector);
  const likes = user.likes;

  const dispatch = useDispatch();

  const updatingLikes = useSelector(configSelector).updatingLikes;

  const semaphore = new Semaphore(updatingLikes, setUpdatingLikes);

  const userID = useSelector(userIDSelector) || '';

  useEffect(() => {
    if (likes.includes(announcement.id)) setLiked(true);
  }, []);

  const likeHandler = async () => {
    await semaphore.acquire();

    if (liked) setNumLikes(prev => prev - 1);
    else setNumLikes(prev => prev + 1);

    setLiked(prev => !prev);

    const URL = `${ORG_URL}/${announcement.organizationID}/announcements/like/${announcement.id}`;
    const res = await getHandler(URL);

    if (res.statusCode === 200) {
      const newLikes: string[] = [...likes];
      if (liked) newLikes.splice(newLikes.indexOf(announcement.id), 1);
      else newLikes.push(announcement.id);

      dispatch(setLikes(newLikes));
    } else {
      if (liked) setNumLikes(prev => prev + 1);
      else setNumLikes(prev => prev - 1);
      setLiked(prev => !prev);
    }

    semaphore.release();
  };

  return (
    <>
      {noUserClick ? <SignUp setShow={setNoUserClick} /> : <></>}
      {clickedOnComment ? (
        <CommentAnnouncement
          setShow={setClickedOnComment}
          announcement={announcement}
          numComments={numComments}
          setNoComments={setNumComments}
        />
      ) : (
        <></>
      )}
      {clickedOnShare ? <ShareAnnouncement setShow={setClickedOnShare} announcement={announcement} /> : <></>}

      <div className="w-full flex flex-col gap-2">
        <div className="flex gap-3 max-md:gap-3">
          <HeartStraight
            onClick={() => {
              if (userID == '') setNoUserClick(true);
              else likeHandler();
            }}
            className={`cursor-pointer max-md:w-6 max-md:h-6 ${liked ? 'text-heart_filled' : 'text-black opacity-60'}`}
            size={24}
            weight={liked ? 'fill' : 'regular'}
          />
          <ChatCircleText
            onClick={() => {
              if (userID == '') setNoUserClick(true);
              else setClickedOnComment(true);
            }}
            className="cursor-pointer max-md:w-6 max-md:h-6 opacity-60"
            size={24}
            weight="regular"
          />
          <Export
            onClick={() => {
              if (userID == '') setNoUserClick(true);
              else setClickedOnShare(true);
            }}
            className="cursor-pointer max-md:w-6 max-md:h-6 opacity-60"
            size={24}
            weight="regular"
          />
        </div>

        <div className="w-full flex justify-between items-center text-gray-400">
          <div className="flex items-center font-primary text-sm gap-2 dark:text-[#ffffffb6]">
            <div onClick={likeHandler} className="cursor-pointer">
              {numLikes} like{numLikes == 1 ? '' : 's'}
            </div>
            <div className="text-xs">•</div>
            <div onClick={() => setClickedOnComment(true)} className="cursor-pointer">
              {' '}
              {numComments} comment{numComments == 1 ? '' : 's'}
            </div>
          </div>

          <div className="text-sm font-medium flex-center gap-1">
            {announcement.isOpen ? (
              <>
                <LockOpen /> <div>Open</div>
              </>
            ) : (
              <>
                <Lock /> <div>Only for members</div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LowerAnnouncement;
