import CommentBox from '@/components/common/comment_box';
import { Event } from '@/types';
import React, { useEffect } from 'react';

interface Props {
  event: Event;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  numComments: number;
  setNoComments: React.Dispatch<React.SetStateAction<number>>;
}

const CommentEvent = ({ event, setShow, numComments, setNoComments }: Props) => {
  useEffect(() => {
    if ((document.documentElement.style.overflowY = 'auto')) {
      document.documentElement.style.overflowY = 'hidden';
      document.documentElement.style.height = '100vh';

      return () => {
        document.documentElement.style.overflowY = 'auto';
        document.documentElement.style.height = 'auto';
      };
    }
  }, []);

  return (
    <>
      <div className="w-1/2 h-[90%] overflow-y-auto max-lg:w-5/6 max-lg:overflow-y-auto fixed backdrop-blur-xl dark:text-white bg-white dark:bg-[#ffe1fc22] z-30 translate-x-1/2 -translate-y-1/4 top-56 max-lg:top-1/4 right-1/2 flex flex-col font-primary p-8 max-lg:p-4 gap-2 border-2 shadow-xl dark:border-dark_primary_btn rounded-xl animate-fade_third">
        <div className="font-bold text-4xl text-gray-800 dark:text-white">Comments ({numComments})</div>
        <CommentBox item={event} type="event" setNoComments={setNoComments} />
      </div>
      <div
        onClick={() => setShow(false)}
        className=" bg-backdrop w-screen h-screen backdrop-blur-sm fixed top-0 right-0 animate-fade_third z-20"
      ></div>
    </>
  );
};

export default CommentEvent;
