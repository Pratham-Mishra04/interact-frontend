import { SERVER_ERROR } from '@/config/errors';
import { COMMUNITY_URL } from '@/config/routes';
import { Community } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog';
import Input from '@/components/form/input';
import TextArea from '@/components/form/textarea';
import { Button } from '@/components/ui/button';
import { Plus } from '@phosphor-icons/react';
import postHandler from '@/handlers/post_handler';

const AddRule = ({
  communityID,
  setCommunity,
}: {
  communityID: string;
  setCommunity: React.Dispatch<React.SetStateAction<Community>>;
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = async () => {
    if (title.trim() === '') {
      Toaster.error('Title cannot be empty');
      return;
    }

    const toaster = Toaster.startLoad('Submitting...');

    const formData = { title, description };
    const URL = `${COMMUNITY_URL}/${communityID}/rule`;

    const res = await postHandler(URL, formData);
    if (res.statusCode === 201) {
      if (setCommunity)
        setCommunity(prev => {
          return { ...prev, rules: [...(prev.rules || []), res.data.rule] };
        });
      setTitle('');
      setDescription('');
      Toaster.stopLoad(toaster, 'Community Rule Added', 1);
      setIsDialogOpen(false);
    } else {
      Toaster.stopLoad(toaster, res.data.message || SERVER_ERROR, 0);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-8 h-8 p-1" variant="outline" onClick={() => setIsDialogOpen(true)}>
          <Plus size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md min-w-[30%]">
        <DialogHeader>
          <DialogTitle className="text-3xl">Add a Community Rule</DialogTitle>
          <DialogDescription>Let people know the do&apos;s and dont&apos;s of the Community.</DialogDescription>
        </DialogHeader>
        <div className="w-full max-lg:w-full text-primary_black flex flex-col gap-4 pb-8 max-lg:pb-4">
          <Input label="Community Rule Title" val={title} setVal={setTitle} maxLength={25} type="text" required />
          <TextArea label="Community Rule Description" val={description} setVal={setDescription} maxLength={500} />
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

export default AddRule;
