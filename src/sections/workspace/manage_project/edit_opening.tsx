import { OPENING_URL, ORG_URL } from '@/config/routes';
import { Opening, Project } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useState } from 'react';
import patchHandler from '@/handlers/patch_handler';
import { SERVER_ERROR } from '@/config/errors';
import { useSelector } from 'react-redux';
import { currentOrgSelector } from '@/slices/orgSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PencilSimple } from '@phosphor-icons/react';
import Tags from '@/components/form/tags';
import Select from '@/components/form/select';
import Checkbox from '@/components/form/checkbox';
import TextArea from '@/components/form/textarea';

interface Props {
  opening: Opening;
  project: Project;
  setProject?: React.Dispatch<React.SetStateAction<Project>>;
  org?: boolean;
}

const EditOpening = ({ opening, project, setProject, org = false }: Props) => {
  const [description, setDescription] = useState(opening.description);
  const [tags, setTags] = useState<string[]>(opening.tags || []);
  const [active, setActive] = useState(opening.active);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [mutex, setMutex] = useState(false);

  const currentOrgID = useSelector(currentOrgSelector).id;

  const handleSubmit = async () => {
    if (tags.length == 0) {
      Toaster.error('Tags Cannot be Empty');
      return;
    }

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Editing your opening...');

    const formData = {
      description,
      tags,
      active,
    };

    const URL = org ? `${ORG_URL}/${currentOrgID}/openings/${opening.id}` : `${OPENING_URL}/${opening.id}`;

    const res = await patchHandler(URL, formData);
    if (res.statusCode === 200) {
      if (setProject)
        setProject(prev => {
          let openings = prev.openings;
          openings = openings.map(oldOpening => {
            if (oldOpening.id == opening.id) {
              return { ...oldOpening, description, tags, active };
            } else return oldOpening;
          });
          return { ...prev, openings };
        });
      Toaster.stopLoad(toaster, 'Opening Edited', 1);
      setIsDialogOpen(false);
    } else {
      Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
    setMutex(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={val => setIsDialogOpen(val)}>
      <DialogTrigger>
        <PencilSimple className="cursor-pointer" size={20} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Opening</DialogTitle>
        </DialogHeader>
        <div className="w-full flex flex-col gap-4">
          <TextArea label="Opening Description" val={description} setVal={setDescription} maxLength={1000} />
          <Tags label="Opening Tags" tags={tags} setTags={setTags} maxTags={10} />
          <Checkbox
            label="Is the Opening Active?"
            val={active}
            setVal={setActive}
            caption="setting it to inactive will automatically reject all pending applications"
          />
        </div>
        <Button onClick={handleSubmit} variant="outline">
          Edit Opening
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default EditOpening;
