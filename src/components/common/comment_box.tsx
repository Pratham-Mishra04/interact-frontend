import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
// import LowerComment from '@/components/common/lowerComment';
import { COMMENT_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import Toaster from '@/utils/toaster';
import Cookies from 'js-cookie';
import Image from 'next/image';
import { Comment, Post, Project } from '@/types';
import deleteHandler from '@/handlers/delete_handler';
import { useRouter } from 'next/router';
import moment from 'moment';
import getHandler from '@/handlers/get_handler';
import Loader from '@/components/common/loader';
import Link from 'next/link';
import { profilePicSelector, userSelector } from '@/slices/userSlice';
import { useSelector } from 'react-redux';
import postHandler from '@/handlers/post_handler';
import Trash from '@phosphor-icons/react/dist/icons/Trash';

interface Props {
  type: string;
  item: Project | Post;
  setNoComments: React.Dispatch<React.SetStateAction<number>>;
}

const CommentBox = ({ type, item, setNoComments }: Props) => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState<Comment[]>([]);

  const [commentBody, setCommentBody] = useState('');

  useEffect(() => {
    getComments();
  }, [item]);

  const getComments = async () => {
    // const URL = `${COMMENT_URL}/${type}/${item.id}?page=${page}&limit=${10}`;
    const URL = `${COMMENT_URL}/${type}/${item.id}`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode == 200) {
          const newComments = [...comments, ...res.data.comments];
          if (newComments.length === comments.length) setHasMore(false);
          setComments(newComments);
          setPage(prev => prev + 1);

          setLoading(false);
        } else {
          if (res.data.message) Toaster.error(res.data.message);
          else {
            Toaster.error('Internal Server Error');
            console.log(res);
          }
        }
      })
      .catch(err => {
        console.log(err);
        Toaster.error('Internal Server Error');
      });
  };

  const submitHandler = async () => {
    const toaster = Toaster.startLoad('Adding your comment...');

    const formData =
      type === 'post'
        ? {
            postID: item.id,
            content: commentBody,
          }
        : type === 'project'
        ? {
            projectID: item.id,
            content: commentBody,
          }
        : {};

    const res = await postHandler(COMMENT_URL, formData);
    if (res.statusCode === 201) {
      Toaster.stopLoad(toaster, 'Commented!', 1);
      const newComments = [res.data.comment, ...comments];
      setComments(newComments);
      setNoComments(prev => prev + 1);
      setCommentBody('');
    } else {
      if (res.data.message == 1) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, 'Internal Server error', 0);
        console.log(res);
      }
    }
  };

  const deleteComment = async (commentID: string) => {
    const toaster = Toaster.startLoad('Deleting Comment');
    const URL = `${COMMENT_URL}/${commentID}`;
    const res = await deleteHandler(URL);
    if (res.statusCode == 204) {
      Toaster.stopLoad(toaster, 'Comment Deleted', 1);
      const newComments: Comment[] = [];
      comments.forEach(comment => {
        if (comment.id !== commentID) newComments.push(comment);
      });
      setComments(newComments);
      setNoComments(prev => prev - 1);
    } else {
      if (res.data.message == 1) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, 'Internal Server error', 0);
        console.log(res);
      }
    }
  };

  const profilePic = useSelector(userSelector).profilePic;
  const loggedInUser = useSelector(userSelector);

  return (
    <div className="w-full h-full overflow-auto flex flex-col px-12 py-8 font-primary gap-8 max-md:px-4">
      <div className="w-full flex gap-2">
        <Image
          crossOrigin="anonymous"
          className="w-12 max-md:w-8 h-12 max-md:h-8 rounded-full cursor-default"
          width={10000}
          height={10000}
          alt="user"
          src={`${USER_PROFILE_PIC_URL}/${profilePic}`}
        />
        <div className="w-full flex justify-between max-md:flex-col relative max-md:gap-2 max-md:items-end">
          <textarea
            value={commentBody}
            onChange={el => {
              setCommentBody(el.target.value);
            }}
            onKeyDown={el => {
              if (el.key === 'Enter') submitHandler();
            }}
            className="w-4/5 text-lg max-md:text-sm px-4 py-2 rounded-xl text-black dark:text-white dark:bg-dark_primary_comp focus:outline-none min-h-[3rem] max-h-64 max-md:w-full"
            placeholder={`Comment on this ${type}`}
          />
          <div
            className="h-fit max-md:text-xs dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active font-medium border-[1px] border-primary_btn  dark:border-dark_primary_btn rounded-md py-2 px-3  flex-center cursor-pointer max-md:h-10 max-md:w-fit transition-ease-300"
            onClick={submitHandler}
          >
            Comment
          </div>
        </div>
      </div>
      {loading ? (
        <Loader />
      ) : (
        <>
          {comments.length > 0 ? (
            // <InfiniteScroll dataLength={comments.length} next={getComments} hasMore={hasMore} loader={<Loader />}>
            <div className="w-full flex flex-col gap-8">
              {comments.map(comment => {
                return (
                  <div key={comment.id} className="flex flex-col gap-2">
                    <div className="w-full flex justify-between items-center">
                      <div className="flex gap-2">
                        <Link
                          href={`${
                            comment.user.username != loggedInUser.username
                              ? `/explore/user/${comment.user.username}`
                              : '/profile'
                          }`}
                          className="rounded-full"
                        >
                          <Image
                            crossOrigin="anonymous"
                            width={10000}
                            height={10000}
                            alt={'User Pic'}
                            src={`${USER_PROFILE_PIC_URL}/${comment.user.profilePic}`}
                            className={'rounded-full w-12 max-md:w-8 h-12 max-md:h-8 cursor-pointer'}
                          />
                        </Link>
                        <div className="flex flex-col">
                          <Link
                            href={`${
                              comment.user.username != loggedInUser.username
                                ? `/explore/user/${comment.user.username}`
                                : '/profile'
                            }`}
                            className="text-xl max-md:text-lg font-semibold"
                          >
                            {comment.user.name}
                          </Link>
                          <div className="flex gap-1 items-center">
                            <Link
                              href={`${
                                comment.user.username != loggedInUser.username
                                  ? `/explore/user/${comment.user.username}`
                                  : '/profile'
                              }`}
                              className="text-sm max-md:text-xs"
                            >
                              @{comment.user.username}
                            </Link>
                            <div className="text-xs max-md:text-xxs">•</div>
                            <div className="text-xs max-md:text-xxs">{moment(comment.createdAt).fromNow()}</div>
                          </div>
                        </div>
                      </div>
                      <Trash
                        onClick={() => {
                          deleteComment(comment.id);
                        }}
                        className="cursor-pointer mr-1 max-md:w-4 max-md:h-4 transition-all ease-in-out duration-200 hover:scale-110"
                        size={24}
                        weight="regular"
                      />
                    </div>
                    <div className="pl-14 max-md:pl-10">
                      <div className="w-fit dark:bg-dark_primary_comp_hover py-2 px-4 max-md:text-sm rounded-xl">
                        {comment.content}
                      </div>
                      {/* <LowerComment comment={comment} type={type} /> */}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // </InfiniteScroll>
            <div className="font-Inconsolata text-2xl">No Comments Yet:)</div>
          )}
        </>
      )}
    </div>
  );
};

export default CommentBox;
