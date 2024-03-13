import { PROJECT_PIC_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import { OpeningBookmark } from '@/types';
import { Check } from '@phosphor-icons/react';
import Image from 'next/image';
import React, { useState } from 'react';
import ConfirmDelete from '../common/confirm_delete';

interface Props {
  bookmark: OpeningBookmark;
  setClick: React.Dispatch<React.SetStateAction<boolean>>;
  setBookmark: React.Dispatch<React.SetStateAction<OpeningBookmark>>;
  handleEdit: (bookmarkID: string, title: string) => Promise<number>;
  handleDelete: (bookmarkID: string) => Promise<void>;
}

const OpeningBookmark = ({ bookmark, setClick, setBookmark, handleEdit, handleDelete }: Props) => {
  let count = 0;
  const [clickedOnSettings, setClickedOnSettings] = useState(false);
  const [clickedOnEdit, setClickedOnEdit] = useState(false);
  const [clickedOnDelete, setClickedOnDelete] = useState(false);

  const [title, setTitle] = useState(bookmark.title);

  const handleSubmit = async (el: React.FormEvent<HTMLFormElement>) => {
    el.preventDefault();
    const status = await handleEdit(bookmark.id, title);
    if (status == 1) setClickedOnEdit(false);
  };
  return (
    <div className="w-96 max-md:w-80 max-md:h-[28rem] h-108 font-primary dark:text-white">
      {clickedOnDelete ? (
        <ConfirmDelete
          setShow={setClickedOnDelete}
          handleDelete={async () => {
            await handleDelete(bookmark.id);
            setClickedOnDelete(false);
          }}
        />
      ) : (
        <></>
      )}
      <div
        onClick={() => {
          setBookmark(bookmark);
          setClick(true);
        }}
        className="group relative cursor-pointer"
      >
        <div className="w-full h-full absolute p-2 top-2 left-2 hidden group-hover:flex gap-4 animate-fade_third z-20 rounded-lg cursor-pointer">
          <div
            onClick={el => {
              el.stopPropagation();
              setClickedOnSettings(prev => !prev);
            }}
            className="h-8 w-8 flex-center glassMorphism rounded-full dark:text-white p-1"
          >
            •••
          </div>
          {clickedOnSettings ? (
            <div className="w-1/2 h-fit rounded-2xl glassMorphism dark:text-white p-2">
              <div
                onClick={el => {
                  el.stopPropagation();
                  setClickedOnEdit(prev => !prev);
                  setClickedOnSettings(false);
                }}
                className="w-full px-4 py-3 hover:bg-[#ffffff] dark:hover:bg-[#ffffff19] transition-ease-100 rounded-lg"
              >
                {clickedOnEdit ? 'Cancel' : 'Edit'}
              </div>
              <div
                onClick={el => {
                  el.stopPropagation();
                  setClickedOnDelete(true);
                }}
                className="w-full px-4 py-3 hover:bg-[#ffffff] dark:hover:bg-[#ffffff19] transition-ease-100 rounded-lg"
              >
                Delete
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
        {bookmark.openingItems ? (
          <>
            {bookmark.openingItems.length == 0 ? (
              <div className="p-2">
                <div className="w-full h-[368px] max-md:h-[304px] bg-gray-300 dark:bg-[#c578bf63] rounded-md"></div>
              </div>
            ) : bookmark.openingItems.length == 1 ? (
              <>
                {bookmark.openingItems[0].opening.project?.coverPic ? (
                  <div className="p-2">
                    <Image
                      crossOrigin="anonymous"
                      className="w-full h-[368px] max-md:h-[304px] rounded-md object-cover"
                      width={500}
                      height={500}
                      alt=""
                      src={`${PROJECT_PIC_URL}/${bookmark.openingItems[0].opening.project.coverPic}`}
                      placeholder="blur"
                      blurDataURL={bookmark.openingItems[0].opening.project.blurHash || 'no-hash'}
                    />
                  </div>
                ) : bookmark.openingItems[0].opening.organization?.user.profilePic ? (
                  <div className="p-2">
                    <Image
                      crossOrigin="anonymous"
                      className="w-full h-[368px] max-md:h-[304px] rounded-md object-cover"
                      width={500}
                      height={500}
                      alt=""
                      src={`${USER_PROFILE_PIC_URL}/${bookmark.openingItems[0].opening.organization?.user.profilePic}`}
                    />
                  </div>
                ) : (
                  <div className="p-2">
                    <div className="w-full h-96 max-md:h-80 bg-gray-300 dark:bg-[#c578bf63] rounded-md"></div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-96 max-md:h-80 flex flex-wrap gap-2 p-2 items-center justify-center">
                {bookmark.openingItems.map(openingItem => {
                  if (
                    count >= 4 ||
                    (!openingItem.opening.project?.coverPic && !openingItem.opening.organization?.user.profilePic)
                  ) {
                    return <></>;
                  }
                  count++;
                  return openingItem.opening.project?.coverPic ? (
                    <Image
                      key={openingItem.openingID}
                      crossOrigin="anonymous"
                      className="w-[48%] h-[49%] object-cover rounded-md"
                      width={500}
                      height={500}
                      alt=""
                      src={`${PROJECT_PIC_URL}/${openingItem.opening.project.coverPic}`}
                      placeholder="blur"
                      blurDataURL={openingItem.opening.project.blurHash || 'no-hash'}
                    />
                  ) : (
                    <Image
                      key={openingItem.openingID}
                      crossOrigin="anonymous"
                      className="w-[48%] h-[49%] object-cover rounded-md"
                      width={500}
                      height={500}
                      alt=""
                      src={`${USER_PROFILE_PIC_URL}/${openingItem.opening.organization?.user.profilePic}`}
                    />
                  );
                })}
                {[...Array(4 - count)].map((_, index) => (
                  <div key={index} className="w-[48%] h-[49%] bg-gray-300 dark:bg-[#c578bf63] rounded-md"></div>
                ))}
              </div>
            )}
          </>
        ) : (
          <></>
        )}
      </div>
      <div className="w-full flex flex-col p-4">
        {clickedOnEdit ? (
          <form onSubmit={handleSubmit} className="w-full flex gap-2 items-center mb-2">
            <input
              value={title}
              onChange={el => setTitle(el.target.value)}
              className="w-full bg-transparent text-xl font-semibold border-[1px] p-2 rounded-md border-primary_btn  dark:border-dark_primary_btn focus:outline-none"
            />
            <button type="submit">
              <Check className="cursor-pointer" size={32} />
            </button>
          </form>
        ) : (
          <div className="w-full text-3xl font-semibold">{bookmark.title}</div>
        )}
        <div>
          {bookmark.openingItems.length || 0} Opening{bookmark.openingItems.length != 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

export default OpeningBookmark;
