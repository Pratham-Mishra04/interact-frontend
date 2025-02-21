import { BOOKMARK_URL } from '@/config/routes';
import deleteHandler from '@/handlers/delete_handler';
import BookmarkOpening from '@/sections/lowers/bookmark_opening';
import { setUpdateBookmark } from '@/slices/configSlice';
import { userSelector, setOpeningBookmarks, userIDSelector } from '@/slices/userSlice';
import { Opening } from '@/types';
import { BookmarkSimple } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { OpeningBookmark } from '@/types';
import SignUp from '../common/signup_box';
import TooltipIcon from '../common/tooltip_icon';

interface Props {
  opening: Opening;
}

interface bookMarkStatus {
  isBookmarked: boolean;
  openingItemID: string;
  bookmarkID: string;
}

const OpeningBookmarkIcon = ({ opening }: Props) => {
  const [bookmarkStatus, setBookmarkStatus] = useState<bookMarkStatus>({
    isBookmarked: false,
    openingItemID: '',
    bookmarkID: '',
  });
  const [clickedOnBookmark, setClickedOnBookmark] = useState(false);
  const [mutex, setMutex] = useState(false);

  const [noUserClick, setNoUserClick] = useState(false);

  const userID = useSelector(userIDSelector) || '';

  const bookmarks = useSelector(userSelector).openingBookmarks || [];
  const dispatch = useDispatch();
  const setBookmark = (isBookmarked: boolean, openingItemID: string, bookmarkID: string) => {
    setBookmarkStatus({
      isBookmarked,
      openingItemID,
      bookmarkID,
    });
  };

  function removePostItemFromBookmark(
    bookmarks: OpeningBookmark[],
    bookmarkId: string,
    openingItemID: string
  ): OpeningBookmark[] {
    const updatedBookmarks = bookmarks.map(bookmark => {
      if (bookmark.id === bookmarkId) {
        const updatedPostItems = bookmark.openingItems.filter(item => item.id !== openingItemID);
        return { ...bookmark, projectItems: updatedPostItems };
      }
      return bookmark;
    });

    return updatedBookmarks;
  }

  useEffect(() => {
    bookmarks.forEach(bookmarksObj => {
      if (bookmarksObj.openingItems)
        bookmarksObj.openingItems.forEach(openingItem => {
          if (openingItem.openingID == opening.id) setBookmark(true, openingItem.id, bookmarksObj.id);
        });
    });

    return () => {
      setBookmark(false, '', '');
    };
  }, [opening.id]);

  const removeBookmarkItemHandler = async () => {
    if (mutex) return;
    setMutex(true);
    setBookmark(false, bookmarkStatus.openingItemID, bookmarkStatus.bookmarkID);

    const URL = `${BOOKMARK_URL}/opening/item/${bookmarkStatus.openingItemID}`;
    const res = await deleteHandler(URL);
    if (res.statusCode === 204) {
      const updatedBookmarks = removePostItemFromBookmark(
        bookmarks,
        bookmarkStatus.bookmarkID,
        bookmarkStatus.openingItemID
      );
      dispatch(setOpeningBookmarks(updatedBookmarks));
      setBookmark(false, '', '');
      dispatch(setUpdateBookmark(true));
    } else {
      setBookmark(true, bookmarkStatus.openingItemID, bookmarkStatus.bookmarkID);
    }
    setMutex(false);
  };

  return (
    <>
      {noUserClick && <SignUp setShow={setNoUserClick} />}
      <div className="w-fit flex">
        <BookmarkOpening
          show={clickedOnBookmark}
          setShow={setClickedOnBookmark}
          opening={opening}
          setBookmark={setBookmark}
        />
        <TooltipIcon
          label="Bookmark"
          icon={
            <BookmarkSimple
              className="cursor-pointer max-md:w-[32px] max-md:h-[32px]"
              onClick={() => {
                if (userID == '') setNoUserClick(true);
                else {
                  if (bookmarkStatus.isBookmarked) removeBookmarkItemHandler();
                  else setClickedOnBookmark(prev => !prev);
                }
              }}
              size={32}
              weight={bookmarkStatus.isBookmarked ? 'duotone' : 'light'}
            />
          }
          excludeHoverEffect
        />
      </div>
    </>
  );
};

export default OpeningBookmarkIcon;
