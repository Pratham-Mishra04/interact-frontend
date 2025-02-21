import React, { useState, useEffect } from 'react';
import { COMMENT_URL } from '@/config/routes';
import Toaster from '@/utils/toaster';
import { Announcement, Application, Comment, Event, Post, Project, Task } from '@/types';
import getHandler from '@/handlers/get_handler';
import { userSelector } from '@/slices/userSlice';
import { useSelector } from 'react-redux';
import postHandler from '@/handlers/post_handler';
import socketService from '@/config/ws';
import { SERVER_ERROR } from '@/config/errors';
import CommentsLoader from '../loaders/comments';
import CommentComponent from './comment';
import CommentInput from './input';
import { Lock } from '@phosphor-icons/react';
import Link from 'next/link';

interface Props {
  type: string;
  item: Project | Post | Event | Announcement | Task | Application;
  setNoComments?: React.Dispatch<React.SetStateAction<number>>;
  userFetchURL?: string;
}

const CommentBox = ({ type, item, setNoComments, userFetchURL }: Props) => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState<Comment[]>([]);

  const [commentBody, setCommentBody] = useState('');
  const [taggedUsernames, setTaggedUsernames] = useState<string[]>([]);

  const limit = 10;

  useEffect(() => {
    if (loggedInUser.id) getComments();
  }, [item.id]);

  const getComments = async () => {
    setLoading(true);
    const URL = `${COMMENT_URL}/${type}/${item.id}?page=${page}&limit=${limit}`;
    getHandler(URL, undefined, true)
      .then(res => {
        if (res.statusCode == 200) {
          const newComments = [...comments, ...res.data.comments];
          if (newComments.length === comments.length) setHasMore(false);
          setComments(newComments);
          setPage(prev => prev + 1);

          setLoading(false);
        } else {
          Toaster.error(res.data.message || SERVER_ERROR, 'error_toaster');
        }
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  const submitHandler = async () => {
    if (commentBody.trim() == '') return;
    const toaster = Toaster.startLoad('Adding your comment...');

    const formData =
      type === 'post'
        ? {
            postID: item.id,
            content: commentBody,
            taggedUsernames,
          }
        : type === 'project'
        ? {
            projectID: item.id,
            content: commentBody,
            taggedUsernames,
          }
        : type === 'event'
        ? {
            eventID: item.id,
            content: commentBody,
            taggedUsernames,
          }
        : type === 'announcement'
        ? {
            announcementID: item.id,
            content: commentBody,
            taggedUsernames,
          }
        : type === 'task'
        ? {
            taskID: item.id,
            content: commentBody,
            taggedUsernames,
          }
        : {
            applicationID: item.id,
            content: commentBody,
            taggedUsernames,
          };

    const res = await postHandler(COMMENT_URL, formData);
    if (res.statusCode === 201) {
      Toaster.stopLoad(toaster, 'Commented!', 1);
      const newComments = [res.data.comment, ...comments];
      setComments(newComments);
      if (setNoComments) setNoComments(prev => prev + 1);
      setCommentBody('');
      if (item.userID && item.userID != loggedInUser.id)
        socketService.sendNotification(item.userID, `${loggedInUser.name} commented on your ${type}!`);
    } else {
      if (res.data.message != '') Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
  };

  const loggedInUser = useSelector(userSelector);

  return (
    <div className="w-full h-full flex flex-col font-primary gap-4">
      <CommentInput
        content={commentBody}
        setContent={setCommentBody}
        taggedUsernames={taggedUsernames}
        setTaggedUsernames={setTaggedUsernames}
        type={type}
        handleSubmit={submitHandler}
        userFetchURL={userFetchURL}
      />
      {!loggedInUser.id ? (
        <div className="w-full h-48 flex-center flex-col gap-1 backdrop-blur-sm rounded-lg z-10">
          <div className="bg-white dark:bg-dark_primary_comp flex-center gap-1 border-primary_black border-[1px] rounded-lg px-2 py-1">
            <Lock /> Locked
          </div>
          <Link href={'/login'} className="font-medium hover-underline-animation after:bg-black dark:after:bg-white">
            Sign up to see what&apos;s here
          </Link>
        </div>
      ) : loading && page == 1 ? (
        <CommentsLoader />
      ) : comments.length > 0 ? (
        <div className="w-full flex flex-col gap-4 px-3">
          {comments.map(comment => (
            <CommentComponent
              key={comment.id}
              comment={comment}
              setComments={setComments}
              setNoComments={setNoComments}
            />
          ))}
          {loading ? (
            <CommentsLoader />
          ) : comments.length % limit == 0 && hasMore ? (
            <div
              onClick={getComments}
              className="w-fit mx-auto pt-4 text-xs text-gray-700 dark:text-white font-medium hover-underline-animation after:bg-gray-700 cursor-pointer"
            >
              Load More
            </div>
          ) : (
            comments.length < item.noComments && (
              <div className="w-full text-center pt-4 text-sm">
                Comments which do not follow the guidelines are flagged.
              </div>
            )
          )}
        </div>
      ) : item.noComments == 0 ? (
        <div className="w-fit mx-auto text-xl"> No Comments Yet :)</div>
      ) : (
        <div className="w-full text-center pt-4 text-sm">Comments which do not follow the guidelines are flagged.</div>
      )}
    </div>
  );
};

export default CommentBox;
