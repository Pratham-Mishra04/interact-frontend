import React, { useState } from 'react';
import Image from 'next/image';
import { ORG_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import Toaster from '@/utils/toaster';
import postHandler from '@/handlers/post_handler';
import { SERVER_ERROR } from '@/config/errors';
import { X } from '@phosphor-icons/react';
import { Organization, Poll } from '@/types';
import Tags from '@/components/utils/edit_tags';

interface Props {
  orgID: string;
  setPolls: React.Dispatch<React.SetStateAction<Poll[]>>;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  organisation: Organization;
}

const NewPoll = ({ orgID, setPolls, setShow, organisation }: Props) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMultiAnswer, setIsMultiAnswer] = useState(false);

  const [mutex, setMutex] = useState(false);

  const submitHandler = async () => {
    if (content == '') {
      Toaster.error('Content cannot be empty');
      return;
    }
    if (options.length < 2) {
      Toaster.error('Add at least 2 options');
      return;
    }

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Adding your poll...');

    const formData = { title, content, isOpen, options, isMultiAnswer };

    const URL = `${ORG_URL}/${orgID}/polls`;

    const res = await postHandler(URL, formData);
    if (res.statusCode === 201) {
      const poll: Poll = res.data.poll;
      poll.organization = organisation;
      setPolls(prev => [poll, ...prev]);
      setContent('');
      setShow(false);
      Toaster.stopLoad(toaster, 'Poll Added!', 1);
    } else {
      if (res.data.message != '') Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }

    setMutex(false);
  };

  return (
    <>
      <div className="w-[90%] lg:w-[40%] flex flex-col items-center gap-4  fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[100] bg-navbar rounded-xl py-6 px-8 shadow-xl animate-fade_third">
        <X size={20} className="absolute top-4 right-4 cursor-pointer" onClick={() => setShow(false)} />
        <h1 className="heading self-start text-2xl lg:text-3xl font-semibold text-gradient">Add a Poll</h1>
        <div className="w-full flex gap-4">
          <Image
            crossOrigin="anonymous"
            className="w-8 h-8 lg:w-12 lg:h-12 rounded-full cursor-default border-2 border-dark_primary_btn p-1"
            width={50}
            height={50}
            alt="user"
            src={`${USER_PROFILE_PIC_URL}/${organisation.user.profilePic}`}
          />
          <div className="w-[calc(100%-32px)] flex flex-col gap-2">
            <input
              type="text"
              maxLength={50}
              onChange={el => setTitle(el.target.value)}
              className="w-full h-8 lg:h-12 text-lg font-medium p-2 focus:outline-none"
              placeholder="Poll Title (Optional)"
            />
            <textarea
              value={content}
              maxLength={500}
              onChange={el => setContent(el.target.value)}
              className="w-full max-md:text-sm border-[2px] border-dashed p-2 rounded-lg dark:text-white dark:bg-dark_primary_comp focus:outline-none min-h-[4rem] max-h-64 max-md:w-full"
              placeholder="What is this Poll About? (500 characters)"
            />
          </div>
        </div>

        <div className="w-full flex flex-col gap-2">
          <div>Add Options for the Poll ({options.length}/10)</div>
          <Tags tags={options} setTags={setOptions} maxTags={10} borderStyle="dashed" lowerOnly={false} />
        </div>

        <div className="w-full flex flex-col gap-4 lg:flex-row justify-between items-center">
          <div className="w-fit flex gap-4 flex-wrap">
            <label className="flex w-fit cursor-pointer select-none items-center text-sm gap-2">
              <div className="font-semibold">Open for All</div>
              <div className="relative">
                <input type="checkbox" checked={isOpen} onChange={() => setIsOpen(prev => !prev)} className="sr-only" />
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
            </label>{' '}
            <label className="flex w-fit cursor-pointer select-none items-center text-sm gap-2">
              <div className="font-semibold">Multiple Answers Allowed</div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isMultiAnswer}
                  onChange={() => setIsMultiAnswer(prev => !prev)}
                  className="sr-only"
                />
                <div
                  className={`box block h-6 w-10 rounded-full ${
                    isMultiAnswer ? 'bg-blue-300' : 'bg-black'
                  } transition-ease-300`}
                ></div>
                <div
                  className={`absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white transition ${
                    isMultiAnswer ? 'translate-x-full' : ''
                  }`}
                ></div>
              </div>
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <div
              className="w-full h-fit text-sm max-md:text-xs dark:bg-dark_primary_comp hover:bg-primary_comp_hover hover:border-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active font-medium border-[1px] border-primary_btn  dark:border-dark_primary_btn rounded-md py-2 px-6  flex-center cursor-pointer max-md:h-10 max-md:w-fit transition-ease-300 hover:text-primary_text self-end"
              onClick={() => {
                submitHandler();
              }}
            >
              Submit
            </div>
            <div className="text-gray-400 text-xs font-semibold">*cannot be changed later</div>
          </div>
        </div>
      </div>
      <div
        className="overlay w-full h-full fixed top-0 left-0 bg-backdrop z-[80] animate-fade_third"
        onClick={() => setShow(false)}
      ></div>
    </>
  );
};

export default NewPoll;
