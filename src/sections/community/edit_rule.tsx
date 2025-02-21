import { SERVER_ERROR } from '@/config/errors';
import { COMMUNITY_URL } from '@/config/routes';
import { Community, CommunityRule } from '@/types';
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
import { PencilSimple } from '@phosphor-icons/react';
import patchHandler from '@/handlers/patch_handler';
import deleteHandler from '@/handlers/delete_handler';

const EditRule = ({
  rule,
  communityID,
  setCommunity,
}: {
  rule: CommunityRule;
  communityID: string;
  setCommunity: React.Dispatch<React.SetStateAction<Community>>;
}) => {
  const [title, setTitle] = useState(rule.title);
  const [description, setDescription] = useState(rule.description);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEdit = async () => {
    if (title.trim() === '') {
      Toaster.error('Title cannot be empty');
      return;
    }

    const toaster = Toaster.startLoad('Editing Community Rule...');

    const formData = { title, description };
    const URL = `${COMMUNITY_URL}/${communityID}/rule/${rule.id}`;

    const res = await patchHandler(URL, formData);
    if (res.statusCode === 200) {
      if (setCommunity)
        setCommunity(prev => {
          return { ...prev, rules: [...(prev.rules || []), res.data.rule] };
        });
      Toaster.stopLoad(toaster, 'Community Rule Edited', 1);
      setIsDialogOpen(false);
    } else {
      Toaster.stopLoad(toaster, res.data.message || SERVER_ERROR, 0);
    }
  };

  const handleDelete = async () => {
    const toaster = Toaster.startLoad('Deleting Community Rule...');

    const URL = `${COMMUNITY_URL}/${communityID}/rule/${rule.id}`;

    const res = await deleteHandler(URL);
    if (res.statusCode === 204) {
      if (setCommunity)
        setCommunity(prev => {
          return { ...prev, rules: prev.rules?.filter(r => r.id != rule.id) };
        });
      Toaster.stopLoad(toaster, 'Community Rule Deleted', 1);
      setIsDialogOpen(false);
    } else {
      Toaster.stopLoad(toaster, res.data.message || SERVER_ERROR, 0);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-8 h-8 p-1" variant="outline" onClick={() => setIsDialogOpen(true)}>
          <PencilSimple size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md min-w-[30%]">
        <DialogHeader>
          <DialogTitle className="text-3xl">Edit Community Rule</DialogTitle>
          <DialogDescription>Let people know the do&apos;s and dont&apos;s of the Community.</DialogDescription>
        </DialogHeader>
        <div className="w-full max-lg:w-full text-primary_black flex flex-col gap-4 pb-8 max-lg:pb-4">
          <Input label="Community Rule Title" val={title} setVal={setTitle} maxLength={25} type="text" required />
          <TextArea label="Community Rule Description" val={description} setVal={setDescription} maxLength={500} />
        </div>
        <DialogFooter className="w-full flex-row gap-4">
          <Button onClick={handleDelete} type="button" variant="destructive" className="w-1/2">
            Delete
          </Button>
          <Button onClick={handleEdit} type="button" variant="outline" className="w-1/2">
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditRule;
