import Tags from '@/components/utils/edit_tags';
import React, { useState } from 'react';
import Toaster from '@/utils/toaster';
import { useSelector } from 'react-redux';
import { currentOrgSelector } from '@/slices/orgSlice';
import postHandler from '@/handlers/post_handler';
import { Opening } from '@/types';
import { SERVER_ERROR } from '@/config/errors';
import Image from 'next/image';
import { USER_PROFILE_PIC_URL } from '@/config/routes';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  openings: Opening[];
  setOpenings: React.Dispatch<React.SetStateAction<Opening[]>>;
}

const NewOpening = ({ setShow, openings, setOpenings }: Props) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const currentOrg = useSelector(currentOrgSelector);

  const handleSubmit = async () => {
    const toaster = Toaster.startLoad('Submitting...');
    if (title.trim() == '') {
      Toaster.error("Title can't be empty");
      return;
    }
    if (description.trim() == '') {
      Toaster.error("Description can't be empty");
      return;
    }
    if (tags.length < 3) {
      Toaster.error('Atleast 3 tags');
      return;
    }

    const formData = {
      title,
      description,
      tags,
    };

    const URL = `org/${currentOrg.id}/openings`;

    const res = await postHandler(URL, formData);
    if (res.statusCode === 201) {
      const addOpening = [...openings, res.data.opening];
      setOpenings(addOpening);
      setDescription('');
      setTitle('');
      setTags([]);
      setShow(false);
      Toaster.stopLoad(toaster, 'Opening created', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
  };

  return (
    <>
      <div className="fixed top-24 max-lg:top-20 w-[953px] max-lg:w-5/6 h-[540px] max-lg:h-3/4 backdrop-blur-2xl bg-white dark:bg-[#ffe1fc22] flex flex-col justify-between rounded-lg p-10 max-lg:p-6 dark:text-white font-primary overflow-y-auto border-[1px] border-gray-400  dark:border-dark_primary_btn right-1/2 translate-x-1/2 animate-fade_third z-30">
        <div className="w-full flex flex-col gap-12">
          <div className="w-full flex max-lg:flex-col gap-12 max-lg:gap-6 items-start max-md:items-center">
            <Image
              crossOrigin="anonymous"
              width={100}
              height={100}
              alt={'User Pic'}
              src={`${USER_PROFILE_PIC_URL}/${currentOrg.coverPic}`}
              className="w-[160px] h-[160px] max-lg:w-[200px] max-lg:h-[200px] rounded-lg object-cover"
            />
            <div className="max-lg:w-full grow flex flex-col gap-4">
              <input
                value={title}
                onChange={el => setTitle(el.target.value)}
                maxLength={25}
                type="text"
                placeholder="Opening Title"
                className="w-full text-4xl max-lg:text-3xl font-bold bg-transparent focus:outline-none"
              />
              <div className="text-lg font-medium cursor-default">@{currentOrg.title}</div>
              <div className="w-full flex flex-col gap-2">
                <div className="text-xs ml-1 font-medium uppercase text-gray-500">Tags ({tags.length || 0}/10)</div>
                <Tags tags={tags} setTags={setTags} maxTags={10} />
              </div>
            </div>
          </div>
          <textarea
            value={description}
            onChange={el => setDescription(el.target.value)}
            maxLength={500}
            className="w-full min-h-[48px] max-h-40 bg-transparent focus:outline-none"
            placeholder="Start typing role description..."
          />
        </div>
        <div className="w-full flex justify-end">
          <div
            onClick={handleSubmit}
            className="w-36 h-12 font-semibold border-[1px] border-gray-400  dark:border-dark_primary_btn dark:shadow-xl dark:text-white bg-dark:dark_primary_btn hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active flex-center rounded-lg transition-ease-300 cursor-pointer"
          >
            Add Opening
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

export default NewOpening;
