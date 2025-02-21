import Input from '@/components/form/input';
import Links from '@/components/form/links';
import Select from '@/components/form/select';
import Tags from '@/components/form/tags';
import { SERVER_ERROR } from '@/config/errors';
import { PROJECT_URL } from '@/config/routes';
import postHandler from '@/handlers/post_handler';
import { setOwnerProjects, userSelector } from '@/slices/userSlice';
import { Project } from '@/types';
import categories from '@/utils/categories';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Plus } from '@phosphor-icons/react';
import Checkbox from '@/components/form/checkbox';
import { Button } from '@/components/ui/button';
import EditorInput from '@/components/form/editor-input';

interface Props {
  setProjects?: React.Dispatch<React.SetStateAction<Project[]>>;
  setTriggerReload?: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveTab?: React.Dispatch<React.SetStateAction<number>>;
}

const NewProject = ({ setProjects, setTriggerReload, setActiveTab }: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagline, setTagline] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [mutex, setMutex] = useState(false);

  const user = useSelector(userSelector);

  const dispatch = useDispatch();

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

    const URL = PROJECT_URL;

    const res = await postHandler(URL, formData, 'multipart/form-data');

    if (res.statusCode === 201) {
      const project = res.data.project;
      project.user = user;

      if (setProjects) setProjects(prev => [project, ...prev]);
      if (setTriggerReload) setTriggerReload(prev => !prev);

      setTitle('');
      setTagline('');
      setDescription('');
      setTags([]);
      setLinks([]);
      setIsDialogOpen(false);
      dispatch(setOwnerProjects([...(user.ownerProjects || []), project.id]));

      if (setActiveTab) setActiveTab(1);

      Toaster.stopLoad(toaster, 'Project Added', 1);
    } else if (res.statusCode == 413) {
      Toaster.stopLoad(toaster, 'Image too large', 0);
    } else {
      Toaster.stopLoad(toaster, res.data.message || SERVER_ERROR, 0);
    }
    setMutex(false);
  };

  useEffect(() => {
    const action = new URLSearchParams(window.location.search).get('action');
    if (action && action == 'new_project') setIsDialogOpen(true);
  }, []);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full dark:bg-dark_primary_comp_hover dark:hover:bg-dark_primary_comp_active">
          Create a New Project <Plus size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md min-w-[40%]">
        <DialogHeader>
          <DialogTitle className="text-3xl">New Project</DialogTitle>
        </DialogHeader>
        <div className="w-full h-fit flex flex-col max-lg:items-center gap-4 max-lg:gap-6 max-lg:pb-4">
          <Input label="Project Title" val={title} setVal={setTitle} maxLength={25} required={true} />
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

export default NewProject;
