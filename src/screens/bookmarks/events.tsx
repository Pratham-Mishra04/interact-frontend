import Bookmark from '@/components/bookmarks/event_bookmark';
import Loader from '@/components/common/loader';
import { SERVER_ERROR } from '@/config/errors';
import { BOOKMARK_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { EventBookmark } from '@/types';
import { initialEventBookmark } from '@/types/initials';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import BookmarkEvents from '@/sections/bookmarks/events';
import deleteHandler from '@/handlers/delete_handler';
import { userSelector, setEventBookmarks } from '@/slices/userSlice';
import { useSelector, useDispatch } from 'react-redux';
import { configSelector } from '@/slices/configSlice';
import { navbarOpenSelector } from '@/slices/feedSlice';
import patchHandler from '@/handlers/patch_handler';
import NoEventBookmarks from '@/components/fillers/event_bookmarks';

const Events = () => {
  const [bookmarks, setBookmarks] = useState<EventBookmark[]>([]);
  const [clickedOnBookmark, setClickedOnBookmark] = useState(false);
  const [clickedBookmark, setClickedBookmark] = useState<EventBookmark>(initialEventBookmark);
  const [loading, setLoading] = useState(true);

  const [mutex, setMutex] = useState(false);

  const open = useSelector(navbarOpenSelector);
  const bookmarksRedux = useSelector(userSelector).eventBookmarks;
  const updateBookmark = useSelector(configSelector).updateBookmark;

  const dispatch = useDispatch();

  const fetchBookmarks = async () => {
    setLoading(true);
    const URL = `${BOOKMARK_URL}/event`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      setBookmarks(res.data.bookmarks || []);
      setLoading(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  const checkAndFetchBookmarks = () => {
    if (!updateBookmark) return;
    fetchBookmarks();
  };

  const handleDeleteBookmark = async (bookmarkID: string) => {
    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Deleting Bookmark', bookmarkID);

    const URL = `${BOOKMARK_URL}/event/${bookmarkID}`;
    const res = await deleteHandler(URL);
    if (res.statusCode === 204) {
      let updatedBookmarks = [...bookmarksRedux];
      updatedBookmarks = updatedBookmarks.filter(el => el.id != bookmarkID);
      dispatch(setEventBookmarks(updatedBookmarks));
      setBookmarks(prev => prev.filter(el => el.id != bookmarkID));
      Toaster.stopLoad(toaster, 'Bookmark Deleted', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
    setMutex(false);
  };

  const handleEditBookmark = async (bookmarkID: string, title: string): Promise<number> => {
    if (mutex) return 0;
    setMutex(true);

    const toaster = Toaster.startLoad('Updating the Bookmark...');
    const formData = new FormData();
    formData.append('title', title);

    const URL = `${BOOKMARK_URL}/event/${bookmarkID}`;

    const res = await patchHandler(URL, formData, 'multipart/form-data');

    if (res.statusCode === 200) {
      const updatedBookmarks = bookmarks.map(bookmark => {
        if (bookmark.id == bookmarkID) return { ...bookmark, title };
        else return bookmark;
      });
      setBookmarks(updatedBookmarks);
      dispatch(setEventBookmarks(updatedBookmarks));

      Toaster.stopLoad(toaster, 'Bookmark Updated!', 1);
      setMutex(false);
      return 1;
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
      setMutex(false);
      return 0;
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  return (
    <div>
      {clickedOnBookmark ? (
        <BookmarkEvents
          bookmark={clickedBookmark}
          setClick={setClickedOnBookmark}
          fetchBookmarks={checkAndFetchBookmarks}
        />
      ) : (
        <>
          {loading ? (
            <Loader />
          ) : (
            <>
              {bookmarks.length > 0 ? (
                <div
                  className={`w-fit mx-auto justify-center px-4 max-md:px-0 pt-12 max-md:pt-4 grid grid-cols-3 ${
                    open ? 'gap-x-4' : 'gap-x-12'
                  } max-md:grid-cols-1 max-lg:grid-cols-2 transition-ease-out-500`}
                >
                  {bookmarks.map(bookmark => {
                    return (
                      <Bookmark
                        key={bookmark.id}
                        bookmark={bookmark}
                        setClick={setClickedOnBookmark}
                        setBookmark={setClickedBookmark}
                        handleEdit={handleEditBookmark}
                        handleDelete={handleDeleteBookmark}
                      />
                    );
                  })}
                </div>
              ) : (
                <NoEventBookmarks />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Events;
