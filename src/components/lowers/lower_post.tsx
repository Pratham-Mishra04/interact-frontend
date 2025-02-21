import React, { useState, useEffect } from 'react';
import { Announcement, Poll, Post, PostBookmark } from '@/types';
import deleteHandler from '@/handlers/delete_handler';
import getHandler from '@/handlers/get_handler';
import { useDispatch, useSelector } from 'react-redux';
import { setLikes, setPostBookmarks, userIDSelector, userSelector } from '@/slices/userSlice';
import { BookmarkSimple, Export } from '@phosphor-icons/react';
import BookmarkPost from '../../sections/lowers/bookmark_post';
import { BOOKMARK_URL, POST_URL } from '@/config/routes';
import Semaphore from '@/utils/semaphore';
import { configSelector, setUpdateBookmark, setUpdatingLikes } from '@/slices/configSlice';
import { ChatCircleText, HeartStraight, Repeat } from '@phosphor-icons/react';
import RePost from '../../sections/home/repost';
import CommentPost from '@/sections/lowers/comment_post';
import socketService from '@/config/ws';
import SignUp from '../common/signup_box';
import Share from '@/sections/lowers/share';
import PostCard from '../cards/post';
import Link from 'next/link';

interface Props {
  post: Post;
  setFeed?: React.Dispatch<React.SetStateAction<(Post | Announcement | Poll)[]>>;
  isRepost?: boolean;
  initialCommentShowState?: boolean;
}

interface bookMarkStatus {
  isBookmarked: boolean;
  postItemID: string;
  bookmarkID: string;
}

const LowerPost = ({ post, setFeed, isRepost = false, initialCommentShowState = false }: Props) => {
  const [liked, setLiked] = useState(false);
  const [numLikes, setNumLikes] = useState(post.noLikes);
  const [numComments, setNumComments] = useState(post.noComments);
  const [bookmarkStatus, setBookmarkStatus] = useState<bookMarkStatus>({
    isBookmarked: false,
    postItemID: '',
    bookmarkID: '',
  });
  const [clickedOnComment, setClickedOnComment] = useState(initialCommentShowState);
  const [clickedOnShare, setClickedOnShare] = useState(false);
  const [clickedOnBookmark, setClickedOnBookmark] = useState(false);
  const [mutex, setMutex] = useState(false);

  const [noUserClick, setNoUserClick] = useState(false);

  const user = useSelector(userSelector);
  const likes = user.likes;
  const bookmarks = user.postBookmarks || [];

  const dispatch = useDispatch();

  const updatingLikes = useSelector(configSelector).updatingLikes;

  const semaphore = new Semaphore(updatingLikes, setUpdatingLikes);

  const userID = useSelector(userIDSelector) || '';

  const setBookmark = (isBookmarked: boolean, postItemID: string, bookmarkID: string) => {
    setBookmarkStatus({
      isBookmarked,
      postItemID,
      bookmarkID,
    });
  };

  function removePostItemFromBookmark(
    bookmarks: PostBookmark[],
    bookmarkId: string,
    postItemId: string
  ): PostBookmark[] {
    const updatedBookmarks = bookmarks.map(bookmark => {
      if (bookmark.id === bookmarkId) {
        const updatedPostItems = bookmark.postItems.filter(item => item.id !== postItemId);
        return { ...bookmark, postItems: updatedPostItems };
      }
      return bookmark;
    });

    return updatedBookmarks;
  }

  useEffect(() => {
    if (likes.includes(post.id)) setLiked(true);
    bookmarks.forEach(bookmarksObj => {
      if (bookmarksObj.postItems)
        bookmarksObj.postItems.forEach(postItem => {
          if (postItem.postID == post.id) setBookmark(true, postItem.id, bookmarksObj.id);
        });
    });
  }, []);

  const likeHandler = async () => {
    await semaphore.acquire();

    if (liked) setNumLikes(prev => prev - 1);
    else setNumLikes(prev => prev + 1);

    setLiked(prev => !prev);

    const URL = `${POST_URL}/like/${post.id}`;
    const res = await getHandler(URL);

    if (res.statusCode === 200) {
      const newLikes: string[] = [...likes];
      if (liked) {
        newLikes.splice(newLikes.indexOf(post.id), 1);
      } else {
        newLikes.push(post.id);
        if (post.userID != user.id) socketService.sendNotification(post.userID, `${user.name} liked your post!`);
      }
      dispatch(setLikes(newLikes));
    } else {
      if (liked) setNumLikes(prev => prev + 1);
      else setNumLikes(prev => prev - 1);
      setLiked(prev => !prev);
    }

    semaphore.release();
  };

  const removeBookmarkItemHandler = async () => {
    if (mutex) return;
    setMutex(true);
    setBookmark(false, bookmarkStatus.postItemID, bookmarkStatus.bookmarkID);

    const URL = `${BOOKMARK_URL}/post/item/${bookmarkStatus.postItemID}`;
    const res = await deleteHandler(URL);
    if (res.statusCode === 204) {
      const updatedBookmarks = removePostItemFromBookmark(
        bookmarks,
        bookmarkStatus.bookmarkID,
        bookmarkStatus.postItemID
      );
      dispatch(setPostBookmarks(updatedBookmarks));
      setBookmark(false, '', '');
      dispatch(setUpdateBookmark(true));
    } else {
      setBookmark(true, bookmarkStatus.postItemID, bookmarkStatus.bookmarkID);
    }
    setMutex(false);
  };

  return (
    <>
      {noUserClick && <SignUp setShow={setNoUserClick} />}
      {clickedOnComment && (
        <CommentPost
          setShow={setClickedOnComment}
          post={post}
          numComments={numComments}
          setNoComments={setNumComments}
        />
      )}
      {clickedOnShare && (
        <Share
          itemID={post.id}
          itemType="post"
          setShow={setClickedOnShare}
          clipboardURL={`/explore/post/${post.id}`}
          item={<PostCard post={post} />}
        />
      )}
      <div className={`w-full flex flex-col gap-1 ${isRepost ? 'justify-start' : ''}`}>
        <div className={`flex gap-3 max-md:gap-3 ${isRepost ? 'w-fit scale-100' : ''}`}>
          <HeartStraight
            onClick={() => {
              if (userID == '') setNoUserClick(true);
              else likeHandler();
            }}
            className={`cursor-pointer max-md:w-6 max-md:h-6 ${
              liked ? 'text-heart_filled' : 'text-black opacity-60 dark:text-gray-50'
            } transition-ease-300`}
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
          {post.userID != user.id &&
            !post.rePost &&
            (user.id ? (
              <RePost post={post} setFeed={setFeed} />
            ) : (
              <Repeat
                onClick={() => setNoUserClick(true)}
                className="cursor-pointer max-md:w-6 max-md:h-6 opacity-60"
                size={24}
                weight="regular"
              />
            ))}
          <Export
            onClick={() => {
              if (userID == '') setNoUserClick(true);
              else setClickedOnShare(true);
            }}
            className="cursor-pointer max-md:w-6 max-md:h-6 opacity-60"
            size={24}
            weight="regular"
          />
          <BookmarkSimple
            className={`cursor-pointer max-md:w-6 max-md:h-6 opacity-60 ${
              bookmarkStatus.isBookmarked ? 'text-[#7cb9ff]' : 'text-black opacity-60 dark:text-gray-50'
            } transition-ease-300`}
            onClick={() => {
              if (userID == '') setNoUserClick(true);
              else {
                if (bookmarkStatus.isBookmarked) removeBookmarkItemHandler();
                else setClickedOnBookmark(prev => !prev);
              }
            }}
            size={24}
            weight={bookmarkStatus.isBookmarked ? 'fill' : 'light'}
          />
          <BookmarkPost show={clickedOnBookmark} setShow={setClickedOnBookmark} post={post} setBookmark={setBookmark} />
        </div>

        <div
          className={`flex items-end justify-between font-primary text-sm gap-2 text-gray-400 dark:text-[#ffffffb6] ${
            isRepost ? 'w-fit scale-100' : 'w-full '
          }`}
        >
          <div className="w-fit flex-center gap-2">
            <div onClick={likeHandler} className="cursor-pointer">
              {numLikes} like{numLikes == 1 ? '' : 's'}
            </div>
            <div className="text-xs">•</div>
            <div onClick={() => setClickedOnComment(true)} className="cursor-pointer">
              {numComments} comment{numComments == 1 ? '' : 's'}
            </div>
          </div>
          {post.communityID && post.community && post.community.title && (
            <div className="text-xs max-md:text-xxs">
              <span className="max-md:hidden">Posted in </span>
              <Link
                href={`/community/${post.community.id}`}
                className="font-semibold hover:text-primary_text transition-ease-200"
                target="_blank"
              >
                {post.community.title}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LowerPost;
