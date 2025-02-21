import { OPENING_URL, ORG_URL } from '@/config/routes';
import postHandler from '@/handlers/post_handler';
import { Project } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useState } from 'react';
import { SERVER_ERROR } from '@/config/errors';
import { useSelector } from 'react-redux';
import { currentOrgSelector } from '@/slices/orgSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from '@phosphor-icons/react';
import Input from '@/components/form/input';
import Tags from '@/components/form/tags';
import TextArea from '@/components/form/textarea';
import { Button } from '@/components/ui/button';

interface Props {
  project: Project;
  setProject?: React.Dispatch<React.SetStateAction<Project>>;
  org?: boolean;
}

const AddOpening = ({ project, setProject, org = false }: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [mutex, setMutex] = useState(false);

  const currentOrgID = useSelector(currentOrgSelector).id;

  const handleSubmit = async () => {
    if (title.trim() == '') {
      Toaster.error('Title Cannot be Empty');
      return;
    }
    if (description.trim() == '') {
      Toaster.error('Description Cannot be Empty');
      return;
    }
    if (tags.length == 0) {
      Toaster.error('Tags Cannot be Empty');
      return;
    }

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Adding your opening...');

    const formData = {
      title,
      description,
      tags,
    };

    const URL = org ? `${ORG_URL}/${currentOrgID}/openings/${project.id}` : `${OPENING_URL}/${project.id}`;

    const res = await postHandler(URL, formData);

    if (res.statusCode === 201) {
      const opening = res.data.opening;
      if (setProject)
        setProject(prev => {
          return { ...prev, openings: [opening, ...prev.openings] };
        });
      Toaster.stopLoad(toaster, 'Opening Added', 1);
      setTitle('');
      setDescription('');
      setTags([]);
      setIsDialogOpen(false);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
    setMutex(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={val => setIsDialogOpen(val)}>
      <DialogTrigger>
        <Plus className="cursor-pointer" size={20} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Opening</DialogTitle>
        </DialogHeader>
        <div className="w-full flex flex-col gap-4">
          <Input label="Opening Title" val={title} setVal={setTitle} required maxLength={25} />
          <TextArea label="Opening Description" val={description} setVal={setDescription} required maxLength={1000} />
          <Tags label="Opening Tags" tags={tags} setTags={setTags} maxTags={10} />
        </div>
        <Button onClick={handleSubmit} variant="outline">
          Add Opening
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default AddOpening;
