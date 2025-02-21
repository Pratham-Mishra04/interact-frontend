import React, { useState, useEffect } from 'react';
import { Comment } from '@/types';
import getHandler from '@/handlers/get_handler';
import { useDispatch, useSelector } from 'react-redux';
import { setLikes, userSelector } from '@/slices/userSlice';
import { COMMENT_URL } from '@/config/routes';
import Semaphore from '@/utils/semaphore';
import { configSelector, setUpdatingLikes } from '@/slices/configSlice';
import { HeartStraight, Repeat } from '@phosphor-icons/react';
import SignUp from '../common/signup_box';
import moment from 'moment';
import Toaster from '@/utils/toaster';
import postHandler from '@/handlers/post_handler';
import { SERVER_ERROR } from '@/config/errors';
import CommentsLoader from '../loaders/comments';
import CommentComponent from '../comment/comment';
import CommentInput from '../comment/input';

interface Props {
  comment: Comment;
  clickedOnReply: boolean;
  setClickedOnReply: React.Dispatch<React.SetStateAction<boolean>>;
}

const LowerComment = ({ comment, clickedOnReply, setClickedOnReply }: Props) => {
  const [liked, setLiked] = useState(false);
  const [numLikes, setNumLikes] = useState(comment.noLikes);
  const [numReplies, setNumReplies] = useState(comment.noReplies);
  const [noUserClick, setNoUserClick] = useState(false);
  const [mutex, setMutex] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const limit = 10;

  const [replies, setReplies] = useState<Comment[]>([]);

  const [reply, setReply] = useState('');
  const [taggedUsernames, setTaggedUsernames] = useState<string[]>([]);

  const user = useSelector(userSelector);
  const likes = user.likes;

  const dispatch = useDispatch();

  const updatingLikes = useSelector(configSelector).updatingLikes;

  const semaphore = new Semaphore(updatingLikes, setUpdatingLikes);

  useEffect(() => {
    if (likes.includes(comment.id)) setLiked(true);
    getReplies();
  }, []);

  const getReplies = async () => {
    if (mutex) return;

    setMutex(true);
    setLoading(true);
    const URL = `${COMMENT_URL}/replies/${comment.id}?page=${page}&limit=${limit}`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode == 200) {
          const newReplies = [...replies, ...res.data.comments];
          if (newReplies.length === replies.length) setHasMore(false);
          setReplies(newReplies);
          setPage(prev => prev + 1);
          setLoading(false);
        } else {
          if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
          else {
            Toaster.error(SERVER_ERROR, 'error_toaster');
          }
        }
        setMutex(false);
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
        setMutex(false);
      });
  };

  const likeHandler = async () => {
    await semaphore.acquire();

    if (liked) setNumLikes(prev => prev - 1);
    else setNumLikes(prev => prev + 1);

    setLiked(prev => !prev);

    const URL = `${COMMENT_URL}/like/${comment.id}`;
    const res = await getHandler(URL);

    if (res.statusCode === 200) {
      const newLikes: string[] = [...likes];
      if (liked) newLikes.splice(newLikes.indexOf(comment.id), 1);
      else newLikes.push(comment.id);

      dispatch(setLikes(newLikes));
    } else {
      if (liked) setNumLikes(prev => prev + 1);
      else setNumLikes(prev => prev - 1);
      setLiked(prev => !prev);
    }

    semaphore.release();
  };

  const submitHandler = async () => {
    if (reply.trim() == '') return;
    const toaster = Toaster.startLoad('Adding your reply...');

    const formData = {
      commentID: comment.id,
      content: reply,
    };

    const res = await postHandler(COMMENT_URL, formData);
    if (res.statusCode === 201) {
      Toaster.stopLoad(toaster, 'Commented!', 1);
      setReplies([res.data.comment, ...replies]);
      setNumReplies(prev => prev + 1);
      setReply('');
    } else {
      if (res.data.message != '') Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
  };

  return (
    <>
      {noUserClick && <SignUp setShow={setNoUserClick} />}
      <div className="w-full flex flex-col gap-2">
        <div className="w-full flex items-center justify-between">
          <div className="flex gap-4 max-md:gap-3">
            <div className="flex-center gap-1">
              {numLikes > 0 && <div className="text-sm opacity-60">{numLikes}</div>}
              <HeartStraight
                onClick={() => {
                  if (user.id == '') setNoUserClick(true);
                  else likeHandler();
                }}
                className={`cursor-pointer max-md:w-4 max-md:h-4 ${
                  liked ? 'text-heart_filled' : 'text-black dark:text-white opacity-60'
                } transition-ease-300`}
                size={18}
                weight={liked ? 'fill' : 'regular'}
              />
            </div>
            {comment.level != 5 && (
              <div className="flex-center gap-1">
                {numReplies > 0 && <div className="text-sm max-md:text-xs opacity-60">{numReplies}</div>}
                <Repeat
                  onClick={() => {
                    if (user.id == '') setNoUserClick(true);
                    else setClickedOnReply(prev => !prev);
                  }}
                  className={`cursor-pointer max-md:w-4 max-md:h-4 ${
                    clickedOnReply ? 'text-blue-500' : 'text-black dark:text-white opacity-60'
                  } transition-ease-300`}
                  size={18}
                  weight={clickedOnReply ? 'duotone' : 'regular'}
                />
              </div>
            )}
          </div>
          <div className="text-xs max-md:text-xxs">• {moment(comment.createdAt).fromNow()}</div>
        </div>
        {clickedOnReply && (
          <div className="w-full flex flex-col gap-4">
            <CommentInput
              content={reply}
              setContent={setReply}
              taggedUsernames={taggedUsernames}
              setTaggedUsernames={setTaggedUsernames}
              type="comment"
              handleSubmit={submitHandler}
            />
            {loading && page == 1 ? (
              <CommentsLoader />
            ) : replies.length > 0 ? (
              <div className="w-full flex flex-col gap-4">
                {replies.map(comment => (
                  <CommentComponent
                    key={comment.id}
                    comment={comment}
                    setComments={setReplies}
                    setNoComments={setNumReplies}
                  />
                ))}
                {replies.length % limit == 0 && hasMore ? (
                  <div
                    onClick={getReplies}
                    className="w-fit mx-auto pt-4 text-xs text-gray-700 dark:text-white font-medium hover-underline-animation after:bg-gray-700 cursor-pointer"
                  >
                    Load More
                  </div>
                ) : (
                  replies.length < comment.noReplies && (
                    <div className="w-full text-center pt-4 text-sm">
                      Comments which do not follow the guidelines are flagged.
                    </div>
                  )
                )}
              </div>
            ) : comment.noReplies == 0 ? (
              <div className="w-fit mx-auto text-sm"> No Replies Yet :)</div>
            ) : (
              <div className="w-full text-center pt-4 text-sm">
                Comments which do not follow the guidelines are flagged.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default LowerComment;
