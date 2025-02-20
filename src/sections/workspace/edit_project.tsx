import Checkbox from '@/components/form/checkbox';
import Input from '@/components/form/input';
import Links from '@/components/form/links';
import Select from '@/components/form/select';
import Tags from '@/components/form/tags';
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
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PencilSimple } from '@phosphor-icons/react/dist/ssr';
import EditorInput from '@/components/form/editor-input';

interface Props {
  project: Project;
  setProject?: React.Dispatch<React.SetStateAction<Project>>;
  setProjects?: React.Dispatch<React.SetStateAction<Project[]>>;
  org?: boolean;
}

const EditProject = ({ project, setProject, setProjects, org = false }: Props) => {
  const [description, setDescription] = useState(project.description);
  const [tagline, setTagline] = useState(project.tagline);
  const [isPrivate, setIsPrivate] = useState(project.isPrivate);
  const [category, setCategory] = useState(project.category);
  const [tags, setTags] = useState<string[]>(project.tags || []);
  const [links, setLinks] = useState<string[]>(project.links || []);
  const [privateLinks, setPrivateLinks] = useState<string[]>(project.privateLinks || []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

    if (tagline != project.tagline) formData.append('tagline', tagline);
    if (description != project.description) formData.append('description', description);
    // if (isArrEdited(tags, project.tags))
    tags?.forEach(tag => formData.append('tags', tag));
    // if (isArrEdited(links, project.links))
    links?.forEach(link => formData.append('links', link));
    // if (isArrEdited(privateLinks, project.privateLinks))
    privateLinks?.forEach(link => formData.append('privateLinks', link));
    if (category != project.category) formData.append('category', category);
    formData.append('isPrivate', String(isPrivate));

    const URL = org ? `${ORG_URL}/${currentOrgID}/projects/${project.slug}` : `${PROJECT_URL}/${project.slug}`;

    const res = await patchHandler(URL, formData, 'multipart/form-data');

    if (res.statusCode === 200) {
      const newProject = res.data.project;
      newProject.user = user;
      if (setProjects)
        setProjects(prev =>
          prev.map(project => {
            if (project.id == project.id) {
              return newProject;
            } else return project;
          })
        );
      if (setProject) {
        setProject(prev => {
          return {
            ...prev,
            description,
            tagline,
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
      setIsDialogOpen(false);
    } else Toaster.stopLoad(toaster, res.data.message || SERVER_ERROR, 0);

    setMutex(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <div className="w-full p-2 flex items-center gap-2 hover:bg-primary_comp dark:hover:bg-dark_primary_comp_hover rounded-lg cursor-pointer transition-ease-300">
          <PencilSimple className="cursor-pointer max-lg:w-6 max-lg:h-6" size={20} weight="regular" />
          Edit
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md min-w-[40%]">
        <DialogHeader>
          <DialogTitle className="text-3xl">Edit Project</DialogTitle>
        </DialogHeader>
        <div className="w-full h-fit flex flex-col max-lg:items-center gap-4 max-lg:gap-6 max-lg:pb-4">
          <Select label="Project Category" val={category} setVal={setCategory} options={categories} required={true} />
          <Input label="Project Tagline" val={tagline} setVal={setTagline} maxLength={50} required={true} />
          <EditorInput label="Project Description" val={description} setVal={setDescription} maxLength={1000} />
          <Tags label="Project Tags" tags={tags} setTags={setTags} maxTags={10} suggestions required />
          <Links label="Project Links" links={links} setLinks={setLinks} maxLinks={5} />
          <Checkbox label="Keep this Project Private" val={isPrivate} setVal={setIsPrivate} />
        </div>
        <DialogFooter className="w-full flex-center">
          <Button onClick={handleSubmit} type="button" variant="outline" className="w-1/2">
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProject;
