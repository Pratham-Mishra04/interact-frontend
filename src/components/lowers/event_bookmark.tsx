import { BOOKMARK_URL } from '@/config/routes';
import deleteHandler from '@/handlers/delete_handler';
import BookmarkEvent from '@/sections/lowers/bookmark_event';
import { setUpdateBookmark } from '@/slices/configSlice';
import { userSelector, setEventBookmarks, userIDSelector } from '@/slices/userSlice';
import { Event } from '@/types';
import { BookmarkSimple } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { EventBookmark } from '@/types';
import SignUp from '../common/signup_box';

interface Props {
  event: Event;
  size?: number;
}

interface bookMarkStatus {
  isBookmarked: boolean;
  eventItemID: string;
  bookmarkID: string;
}

const EventBookmarkIcon = ({ event, size = 32 }: Props) => {
  const [bookmarkStatus, setBookmarkStatus] = useState<bookMarkStatus>({
    isBookmarked: false,
    eventItemID: '',
    bookmarkID: '',
  });
  const [clickedOnBookmark, setClickedOnBookmark] = useState(false);
  const [mutex, setMutex] = useState(false);

  const [noUserClick, setNoUserClick] = useState(false);

  const userID = useSelector(userIDSelector) || '';

  const bookmarks = useSelector(userSelector).eventBookmarks || [];
  const dispatch = useDispatch();
  const setBookmark = (isBookmarked: boolean, eventItemID: string, bookmarkID: string) => {
    setBookmarkStatus({
      isBookmarked,
      eventItemID,
      bookmarkID,
    });
  };

  function removePostItemFromBookmark(
    bookmarks: EventBookmark[],
    bookmarkId: string,
    eventItemID: string
  ): EventBookmark[] {
    const updatedBookmarks = bookmarks.map(bookmark => {
      if (bookmark.id === bookmarkId) {
        const updatedPostItems = bookmark.eventItems.filter(item => item.id !== eventItemID);
        return { ...bookmark, eventItems: updatedPostItems };
      }
      return bookmark;
    });

    return updatedBookmarks;
  }

  useEffect(() => {
    bookmarks.forEach(bookmarksObj => {
      if (bookmarksObj.eventItems)
        bookmarksObj.eventItems.forEach(eventItem => {
          if (eventItem.eventID == event.id) setBookmark(true, eventItem.id, bookmarksObj.id);
        });
    });

    return () => {
      setBookmark(false, '', '');
    };
  }, [event.id]);

  const removeBookmarkItemHandler = async () => {
    if (mutex) return;
    setMutex(true);
    setBookmark(false, bookmarkStatus.eventItemID, bookmarkStatus.bookmarkID);

    const URL = `${BOOKMARK_URL}/event/item/${bookmarkStatus.eventItemID}`;
    const res = await deleteHandler(URL);
    if (res.statusCode === 204) {
      const updatedBookmarks = removePostItemFromBookmark(
        bookmarks,
        bookmarkStatus.bookmarkID,
        bookmarkStatus.eventItemID
      );
      dispatch(setEventBookmarks(updatedBookmarks));
      setBookmark(false, '', '');
      dispatch(setUpdateBookmark(true));
    } else {
      setBookmark(true, bookmarkStatus.eventItemID, bookmarkStatus.bookmarkID);
    }
    setMutex(false);
  };

  return (
    <>
      {noUserClick ? <SignUp setShow={setNoUserClick} /> : <></>}
      {clickedOnBookmark ? (
        <BookmarkEvent setShow={setClickedOnBookmark} event={event} setBookmark={setBookmark} />
      ) : (
        <></>
      )}
      <BookmarkSimple
        className="cursor-pointer max-md:w-[32px] max-md:h-[32px]"
        onClick={() => {
          if (userID == '') setNoUserClick(true);
          else {
            if (bookmarkStatus.isBookmarked) removeBookmarkItemHandler();
            else setClickedOnBookmark(prev => !prev);
          }
        }}
        size={size}
        weight={bookmarkStatus.isBookmarked ? 'duotone' : 'light'}
      />
    </>
  );
};

export default EventBookmarkIcon;
