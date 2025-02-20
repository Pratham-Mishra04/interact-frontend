import { GenericBookmark } from '@/types';
import React, { FormEvent } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Props {
  bookmarks: GenericBookmark[];
  addBookmarkItemHandler: (bookmarks: GenericBookmark) => void;
  addBookmarkHandler: (el: FormEvent<HTMLFormElement>) => void;
  bookmarkTitle: string;
  setBookmarkTitle: React.Dispatch<React.SetStateAction<string>>;
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const BookmarkModal = ({
  bookmarks,
  addBookmarkItemHandler,
  addBookmarkHandler,
  bookmarkTitle,
  setBookmarkTitle,
  isDialogOpen,
  setIsDialogOpen,
}: Props) => {
  return (
    <>
      <Popover open={isDialogOpen} onOpenChange={val => setIsDialogOpen(val)}>
        <PopoverTrigger></PopoverTrigger>
        <PopoverContent className="flex flex-col gap-2 text-sm w-48 p-3" align="end">
          {bookmarks.length > 0 && (
            <div className="w-full flex flex-col gap-2">
              {bookmarks.map((bookmark, index: number) => {
                return (
                  <div
                    key={index}
                    className="w-full h-10 px-4 flex-center bg-primary_comp dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active rounded-md cursor-pointer line-clamp-1 transition-ease-300"
                    onClick={() => {
                      addBookmarkItemHandler(bookmark);
                    }}
                  >
                    {bookmark.title}
                  </div>
                );
              })}
            </div>
          )}
          <form className="w-fit mx-auto" onSubmit={addBookmarkHandler}>
            <input
              className={`w-full h-10 px-4 ${
                bookmarkTitle == '' ? 'text-center text-xs' : ''
              } flex-center rounded-md bg-transparent focus:outline-none`}
              value={bookmarkTitle}
              onChange={el => setBookmarkTitle(el.target.value)}
              placeholder="Create New Bookmark"
            />
          </form>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default BookmarkModal;
