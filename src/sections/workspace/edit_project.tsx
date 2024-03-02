import Links from '@/components/utils/edit_links';
import Tags from '@/components/utils/edit_tags';
import Images from '@/components/utils/new_cover';
import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL, PROJECT_URL } from '@/config/routes';
import patchHandler from '@/handlers/patch_handler';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import { userSelector } from '@/slices/userSlice';
import { Project } from '@/types';
import categories from '@/utils/categories';
import Toaster from '@/utils/toaster';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

interface Props {
  projectToEdit: Project;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setProjectToEdit?: React.Dispatch<React.SetStateAction<Project>>;
  setProjects?: React.Dispatch<React.SetStateAction<Project[]>>;
  org?: boolean;
}

const EditProject = ({ projectToEdit, setShow, setProjectToEdit, setProjects, org = false }: Props) => {
  const [description, setDescription] = useState(projectToEdit.description);
  const [tagline, setTagline] = useState(projectToEdit.tagline);
  const [isPrivate, setIsPrivate] = useState(projectToEdit.isPrivate);
  const [category, setCategory] = useState(projectToEdit.category);
  const [tags, setTags] = useState<string[]>(projectToEdit.tags || []);
  const [links, setLinks] = useState<string[]>(projectToEdit.links || []);
  const [privateLinks, setPrivateLinks] = useState<string[]>(projectToEdit.privateLinks || []);
  const [image, setImage] = useState<File>();

  const [mutex, setMutex] = useState(false);

  const user = useSelector(userSelector);

  const currentOrgID = useSelector(currentOrgIDSelector);

  const handleSubmit = async () => {
    if (description.trim() == '') {
      Toaster.error('Enter Description');
      return;
    }
    if (category.trim() == '') {
      Toaster.error('Select Category');
      return;
    }
    if (category == 'Select Category') {
      Toaster.error('Select Category');
      return;
    }
    if (tags.length == 0) {
      Toaster.error('Tags cannot be empty');
      return;
    }

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Editing your project...');

    const formData = new FormData();

    if (tagline != projectToEdit.tagline) formData.append('tagline', tagline);
    if (description != projectToEdit.description) formData.append('description', description);
    // if (isArrEdited(tags, projectToEdit.tags))
    tags.forEach(tag => formData.append('tags', tag));
    // if (isArrEdited(links, projectToEdit.links))
    links.forEach(link => formData.append('links', link));
    // if (isArrEdited(privateLinks, projectToEdit.privateLinks))
    privateLinks.forEach(link => formData.append('privateLinks', link));
    if (category != projectToEdit.category) formData.append('category', category);
    formData.append('isPrivate', String(isPrivate));
    if (image) formData.append('coverPic', image);

    const URL = org
      ? `${ORG_URL}/${currentOrgID}/projects/${projectToEdit.slug}`
      : `${PROJECT_URL}/${projectToEdit.slug}`;

    const res = await patchHandler(URL, formData, 'multipart/form-data');

    if (res.statusCode === 200) {
      const newProject = res.data.project;
      newProject.user = user;
      if (setProjects)
        setProjects(prev =>
          prev.map(project => {
            if (project.id == projectToEdit.id) {
              return newProject;
            } else return project;
          })
        );
      if (setProjectToEdit) {
        setProjectToEdit(prev => {
          return {
            ...prev,
            description,
            tagline,
            coverPic: newProject.coverPic,
            tags,
            links,
            privateLinks,
            category,
            isPrivate,
          };
        });
      }
      Toaster.stopLoad(toaster, 'Project Edited', 1);
      setTagline('');
      setDescription('');
      setTags([]);
      setLinks([]);
      setImage(undefined);
      setShow(false);
    } else if (res.statusCode == 413) {
      Toaster.stopLoad(toaster, 'Image too large', 0);
    } else {
      Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
    setMutex(false);
  };

  return (
    <>
      <div className="fixed top-12 max-lg:top-20 w-[953px] max-lg:w-5/6 h-[680px] max-lg:h-5/6 backdrop-blur-2xl bg-white dark:bg-[#ffe1fc22] flex max-lg:flex-col justify-between rounded-lg max-lg:rounded-md p-8 pb-2 gap-8 max-lg:gap-4 dark:text-white font-primary overflow-y-auto border-[1px] border-primary_black  dark:border-dark_primary_btn right-1/2 translate-x-1/2 shadow-2xl animate-fade_third z-30">
        <div className="w-2/5 max-lg:w-full lg:sticky lg:top-0">
          <Images initialImage={projectToEdit.coverPic} setSelectedFile={setImage} />
        </div>

        <div className="w-3/5 max-lg:w-full h-fit flex flex-col max-lg:items-center gap-4 max-lg:gap-6 max-lg:pb-4">
          <div className="w-fit text-5xl max-lg:text-3xl font-bold cursor-default">{projectToEdit.title}</div>

          <select
            onChange={el => setCategory(el.target.value)}
            value={category}
            className="w-fit h-12 border-[1px] border-primary_btn dark:border-dark_primary_btn dark:text-white bg-primary_comp dark:bg-[#10013b30] focus:outline-none text-sm rounded-lg block p-2"
          >
            {categories.map((c, i) => {
              return (
                <option className="bg-primary_comp_hover dark:bg-[#10013b30]" key={i} value={c}>
                  {c}
                </option>
              );
            })}
          </select>

          <div className="w-full flex flex-col gap-2">
            <div className="text-xs ml-1 font-medium uppercase text-gray-500">Tags ({tags.length || 0}/10)</div>
            <Tags tags={tags} setTags={setTags} maxTags={10} />
          </div>

          <div className="w-full flex flex-col gap-2">
            <div className="text-xs ml-1 font-medium uppercase text-gray-500">Tagline ({tagline.trim().length}/40)</div>
            <input
              value={tagline}
              onChange={el => setTagline(el.target.value)}
              type="text"
              maxLength={40}
              placeholder="Write your Tagline here..."
              className="w-full text-primary_black focus:outline-none border-[1px] border-primary_btn dark:border-dark_primary_btn rounded-lg text-lg p-2 font-medium bg-transparent"
            />
          </div>

          <div className="w-full">
            <div className="text-xs ml-1 font-medium uppercase text-gray-500">
              Description ({description.trim().length}/1000)
            </div>
            <textarea
              value={description}
              onChange={el => setDescription(el.target.value)}
              placeholder="add a professional bio"
              maxLength={1000}
              className="w-full min-h-[160px] max-h-[200px] focus:outline-none text-primary_black border-[1px] border-primary_btn  dark:border-dark_primary_btn rounded-lg p-2 text-sm bg-transparent"
            />
          </div>

          <div className="w-full flex flex-col gap-2">
            <div className="text-xs ml-1 font-medium uppercase text-gray-500">Public Links ({links.length || 0}/5)</div>
            <Links links={links} setLinks={setLinks} maxLinks={5} />
          </div>

          <div className="w-full flex flex-col gap-2">
            <div className="text-xs ml-1 font-medium uppercase text-gray-500">
              Private Links ({privateLinks.length || 0}/5)
            </div>
            <Links title="Private Links" links={privateLinks} setLinks={setPrivateLinks} />
          </div>

          <label className="flex w-fit cursor-pointer select-none items-center text-sm gap-2">
            <div>Keep this Project Private</div>
            <div className="relative">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={() => setIsPrivate(prev => !prev)}
                className="sr-only"
              />
              <div
                className={`box block h-6 w-10 rounded-full ${
                  isPrivate ? 'bg-blue-300' : 'bg-black'
                } transition-ease-300`}
              ></div>
              <div
                className={`absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white transition ${
                  isPrivate ? 'translate-x-full' : ''
                }`}
              ></div>
            </div>
          </label>
          <div
            onClick={handleSubmit}
            className="w-36 h-12 font-semibold border-[1px] border-primary_btn dark:border-dark_primary_btn dark:shadow-xl dark:text-white bg-dark:dark_primary_btn hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active flex-center rounded-lg transition-ease-300 cursor-pointer"
          >
            Edit Project
          </div>
        </div>
      </div>

      <div
        onClick={() => setShow(false)}
        className="bg-backdrop w-screen h-screen max-lg:backdrop-blur-sm fixed top-0 left-0 animate-fade_third z-20"
      ></div>
    </>
  );
};

export default EditProject;
