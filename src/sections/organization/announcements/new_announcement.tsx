import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import postHandler from '@/handlers/post_handler';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import NewPostHelper from '@/components/home/new_post_helper';
import { Announcement, Organization, User } from '@/types';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import Editor from '@/components/editor';

interface Props {
  organisation: Organization;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setAnnouncements?: React.Dispatch<React.SetStateAction<Announcement[]>>;
}

const NewAnnouncement = ({ organisation, setShow, setAnnouncements }: Props) => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    document.documentElement.style.overflowY = 'hidden';
    document.documentElement.style.height = '100vh';

    return () => {
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.height = 'auto';
    };
  }, []);

  const currentOrgID = useSelector(currentOrgIDSelector);

  const handleSubmit = async () => {
    if (title.trim() == '') {
      Toaster.error('Title cannot be empty!');
      return;
    }
    if (content.trim() == '' || content.replace(/\n/g, '').length == 0) {
      Toaster.error('Caption cannot be empty!');
      return;
    }

    const toaster = Toaster.startLoad('Adding your Post..');

    const formData = {
      title,
      content: content.replace(/\n{3,}/g, '\n\n'),
      isOpen,
    };

    const URL = `${ORG_URL}/${currentOrgID}/announcements`;

    const res = await postHandler(URL, formData);

    if (res.statusCode === 201) {
      setContent('');
      setShow(false);
      const announcement: Announcement = res.data.announcement;
      announcement.organization = organisation;
      if (setAnnouncements) setAnnouncements(prev => [announcement, ...prev]);
      Toaster.stopLoad(toaster, 'Announcement Added!', 1);
      setShow(false);
    } else {
      Toaster.stopLoad(toaster, res.data.message || SERVER_ERROR, 0);
    }
  };

  return (
    <>
      <div className="fixed top-24 max-md:top-[calc(50%-75px)] w-[953px] max-lg:w-5/6 h-[560px] max-md:h-2/3 shadow-2xl dark:shadow-none backdrop-blur-xl bg-[#ffffff] dark:bg-dark_primary_comp flex flex-col gap-8 justify-between max-md:items-end p-8 max-md:p-6 dark:text-white font-primary overflow-y-auto border-[1px] border-primary_btn  dark:border-dark_primary_btn rounded-lg right-1/2 translate-x-1/2 max-md:-translate-y-1/2 animate-fade_third z-30">
        <div className="flex gap-4 max-md:w-full">
          <Image
            crossOrigin="anonymous"
            className="w-16 h-16 rounded-full"
            width={50}
            height={50}
            alt="user"
            src={`${USER_PROFILE_PIC_URL}/${organisation.user.profilePic}`}
          />
          <div className="grow flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <div className="text-2xl font-semibold">{organisation.user.name}</div>
                <div className="text-sm">@{organisation.user.username}</div>
              </div>
              <div
                onClick={handleSubmit}
                className="max-md:hidden w-[120px] h-[48px] bg-primary_comp dark:bg-dark_primary_comp hover:bg-primary_comp_hover dark:hover:bg-dark_primary_comp_hover active:bg-primary_comp_active dark:active:bg-dark_primary_comp_active transition-ease-300 shrink-0 flex-center text-lg font-semibold rounded-lg cursor-pointer"
              >
                Post
              </div>
            </div>

            <div className="w-full flex flex-col gap-4 relative">
              <div className="w-full flex gap-4">
                <NewPostHelper />
              </div>
              <input
                type="text"
                value={title}
                maxLength={50}
                onChange={el => setTitle(el.target.value)}
                className="w-full text-lg font-medium border-[1px] border-dashed p-2 rounded-lg focus:outline-none"
                placeholder="Announcement Title"
              />
              <Editor
                editable
                setContent={setContent}
                placeholder="What the announcement?"
                limit={2000}
                className="min-h-[350px]"
              />
              <div className="w-fit flex-center gap-4">
                <label className="w-fit flex cursor-pointer select-none items-center text-sm gap-2">
                  <div className="font-semibold">Open for All</div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isOpen}
                      onChange={() => setIsOpen(prev => !prev)}
                      className="sr-only"
                    />
                    <div
                      className={`box block h-6 w-10 rounded-full ${
                        isOpen ? 'bg-blue-300' : 'bg-black'
                      } transition-ease-300`}
                    ></div>
                    <div
                      className={`absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white transition ${
                        isOpen ? 'translate-x-full' : ''
                      }`}
                    ></div>
                  </div>
                </label>
                <div className="text-sm font-medium text-gray-500">
                  (
                  {isOpen
                    ? 'Will be shown in the feed of your Followers'
                    : 'Will be shown in the feed of your Members Only'}
                  )
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        onClick={() => setShow(false)}
        className="bg-backdrop w-screen h-screen fixed top-0 left-0 animate-fade_third z-20"
      ></div>
    </>
  );
};

export default NewAnnouncement;
