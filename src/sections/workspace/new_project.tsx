import Checkbox from '@/components/form/checkbox';
import Input from '@/components/form/input';
import Links from '@/components/form/links';
import Select from '@/components/form/select';
import Tags from '@/components/form/tags';
import TextArea from '@/components/form/textarea';

import CoverPic from '@/components/utils/new_cover';
import { SERVER_ERROR } from '@/config/errors';
import { PROJECT_URL } from '@/config/routes';
import postHandler from '@/handlers/post_handler';
import { userSelector } from '@/slices/userSlice';
import { Project } from '@/types';
import categories from '@/utils/categories';
import Toaster from '@/utils/toaster';
import { X } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setProjects?: React.Dispatch<React.SetStateAction<Project[]>>;
}

const NewProject = ({ setShow, setProjects }: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagline, setTagline] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [image, setImage] = useState<File>();

  const [mutex, setMutex] = useState(false);

  const user = useSelector(userSelector);

  const [randomImage, setRandomImage] = useState(`default_${Math.floor(Math.random() * 9) + 1}.jpg`);

  const handleSubmit = async () => {
    if (title.trim() == '') {
      Toaster.error('Title cannot be empty');
      return;
    }
    if (category.trim() == '' || category == 'Select Category') {
      Toaster.error('Select Category');
      return;
    }
    if (tagline.trim() == '') {
      Toaster.error('Tagline cannot be empty');
      return;
    }
    if (description.trim() == '') {
      Toaster.error('Description cannot be empty');
      return;
    }
    if (tags.length < 3) {
      Toaster.error('Enter at least 3 tags');
      return;
    }

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Adding your project...');

    const formData = new FormData();

    formData.append('title', title);
    formData.append('tagline', tagline);
    formData.append('description', description);
    tags.forEach(tag => formData.append('tags', tag));
    links.forEach(link => formData.append('links', link));
    formData.append('category', category);
    formData.append('isPrivate', String(isPrivate));

    if (image) formData.append('coverPic', image);
    else formData.append('coverPic', randomImage);

    const URL = PROJECT_URL;

    const res = await postHandler(URL, formData, 'multipart/form-data');

    if (res.statusCode === 201) {
      const project = res.data.project;
      project.user = user;
      if (setProjects) setProjects(prev => [project, ...prev]);
      Toaster.stopLoad(toaster, 'Project Added', 1);
      setTitle('');
      setTagline('');
      setDescription('');
      setTags([]);
      setLinks([]);
      setImage(undefined);
      setShow(false);
    } else if (res.statusCode == 413) {
      Toaster.stopLoad(toaster, 'Image too large', 0);
    } else {
      if (res.data.message) {
        Toaster.stopLoad(toaster, res.data.message, 0);
      } else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
    setMutex(false);
  };

  useEffect(() => {
    document.documentElement.style.overflowY = 'hidden';
    document.documentElement.style.height = '100vh';

    return () => {
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.height = 'auto';
    };
  }, []);

  return (
    <>
      <div className="fixed top-14 max-lg:top-0 w-5/6 max-lg:w-screen h-5/6 max-lg:h-screen backdrop-blur-2xl bg-white dark:bg-[#ffe1fc22] flex max-lg:flex-col justify-between rounded-lg p-8 gap-8 max-lg:gap-4 dark:text-white font-primary overflow-y-auto border-[1px] border-primary_btn  dark:border-dark_primary_btn right-1/2 translate-x-1/2 shadow-2xl animate-fade_third z-50">
        <X
          onClick={() => setShow(false)}
          className="lg:hidden absolute top-2 right-2 cursor-pointer"
          weight="bold"
          size={32}
        />
        <div className="w-80 max-lg:w-full lg:sticky lg:top-0">
          <CoverPic setSelectedFile={setImage} initialImage={randomImage} />
        </div>
        <div className="w-[calc(100%-320px)] max-lg:w-full h-full flex flex-col justify-between gap-2">
          <div className="w-full h-fit flex flex-col gap-6">
            <div className="w-full max-lg:w-full text-primary_black flex flex-col gap-4 pb-8 max-lg:pb-4">
              <input
                value={title}
                onChange={el => setTitle(el.target.value)}
                maxLength={20}
                type="text"
                placeholder="Untitled Project"
                className="w-full text-5xl max-lg:text-center max-lg:text-3xl font-bold bg-transparent focus:outline-none"
              />
              <Select
                label="Project Category"
                val={category}
                setVal={setCategory}
                options={categories}
                required={true}
              />
              <Input label="Project Tagline" val={tagline} setVal={setTagline} maxLength={50} required={true} />
              <TextArea label="Project Description" val={description} setVal={setDescription} maxLength={1000} />
              <Tags label="Project Tags" tags={tags} setTags={setTags} maxTags={10} required={true} />
              <Links label="Project Links" links={links} setLinks={setLinks} maxLinks={5} />
              <Checkbox label="Keep this Project Private" val={isPrivate} setVal={setIsPrivate} />
            </div>
          </div>

          <div className="w-full flex max-lg:justify-center justify-end">
            <button
              onClick={handleSubmit}
              className={`duration-300 relative group cursor-pointer text-white overflow-hidden h-14 max-lg:h-12 ${
                mutex ? 'w-64 max-lg:w-56 scale-90' : 'w-44 max-lg:w-36 hover:scale-90'
              } rounded-xl p-2 flex-center`}
            >
              <div
                className={`absolute right-32 -top-4 ${
                  mutex
                    ? 'top-0 right-2 scale-150'
                    : 'scale-125 group-hover:top-1 group-hover:right-2 group-hover:scale-150'
                } z-10 w-36 h-36 rounded-full duration-500 bg-[#6661c7]`}
              ></div>
              <div
                className={`absolute right-2 -top-4 ${
                  mutex
                    ? 'top-1 right-2 scale-150'
                    : 'scale-125 right-3 group-hover:top-1 group-hover:right-2 group-hover:scale-150'
                } z-10 w-24 h-24 rounded-full duration-500 bg-[#ada9ff]`}
              ></div>
              <div
                className={`absolute -right-10 top-0 ${
                  mutex ? 'top-1 right-2 scale-150' : 'group-hover:top-1 group-hover:right-2 group-hover:scale-150'
                } z-10 w-20 h-20 rounded-full duration-500 bg-[#cea9ff]`}
              ></div>
              <div
                className={`absolute right-20 -top-4 ${
                  mutex ? 'top-1 right-2 scale-125' : 'group-hover:top-1 group-hover:right-2 group-hover:scale-125'
                } z-10 w-16 h-16 rounded-full duration-500 bg-[#df96ff]`}
              ></div>
              <div
                className={`w-[96%] h-[90%] bg-gray-50 ${
                  mutex ? 'opacity-100' : 'opacity-0'
                } absolute rounded-xl z-10 transition-ease-500`}
              ></div>
              <p className={`z-10 font-bold text-xl max-lg:text-lg transition-ease-500`}>
                {mutex ? (
                  <>
                    <div className="w-fit text-gradient transition-ease-out-300 animate-fade_half">
                      Building your project!
                    </div>
                  </>
                ) : (
                  <div className="">Build Project</div>
                )}
              </p>
            </button>
          </div>

          {/* <div className="w-fit  text-3xl font-bold">Build Project</div> */}
        </div>
      </div>
      <div
        onClick={() => setShow(false)}
        className="bg-backdrop w-screen h-screen max-lg:w-[105vw] max-lg:h-[105vh] fixed top-0 left-0 animate-fade_third z-20"
      ></div>
    </>
  );
};

export default NewProject;
