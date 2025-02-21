import { ORG_URL, PROJECT_URL } from '@/config/routes';
import postHandler from '@/handlers/post_handler';
import { ResourceBucket } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useState } from 'react';
import { SERVER_ERROR } from '@/config/errors';
import PrimaryButton from '@/components/buttons/primary_btn';
import Input from '@/components/form/input';
import TextArea from '@/components/form/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from '@phosphor-icons/react';
import { getResourcesAccessList } from '@/utils/funcs/misc';

interface Props {
  setShowResources?: React.Dispatch<React.SetStateAction<boolean>>;
  setResources?: React.Dispatch<React.SetStateAction<ResourceBucket[]>>;
  resourceType: 'org' | 'community' | 'project';
  resourceParentID: string;
}

const NewResource = ({ setShowResources, setResources, resourceType, resourceParentID }: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [viewAccess, setViewAccess] = useState(getResourcesAccessList(resourceType)[0]);
  const [editAccess, setEditAccess] = useState(getResourcesAccessList(resourceType)[1]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [mutex, setMutex] = useState(false);
  const [tab, setTab] = useState(0);

  const handleSubmit = async () => {
    if (title.trim().length == 0) {
      Toaster.error('Title cannot be empty');
      return;
    }

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Adding a new resource bucket');

    const URL = (resourceType == 'org' ? ORG_URL : PROJECT_URL) + `/${resourceParentID}/resource`;

    const formData = {
      title,
      description,
      viewAccess,
      editAccess,
    };

    const res = await postHandler(URL, formData);
    if (res.statusCode === 201) {
      const resource_bucket = res.data.resourceBucket;
      if (setResources) setResources(prev => [resource_bucket, ...prev]);
      setIsDialogOpen(false);
      if (setShowResources) setShowResources(true);
      Toaster.stopLoad(toaster, 'New Resource Bucket Added!', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
      setMutex(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={val => setIsDialogOpen(val)}>
      <DialogTrigger>
        {/* <Plus
          size={42}
          className="flex-center rounded-full hover:bg-white p-2 transition-ease-300 cursor-pointer"
          weight="regular"
        /> */}
        <Plus className="cursor-pointer" size={20} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tab == 0 ? 'Resource Bucket Info' : 'Manage Access'}</DialogTitle>
        </DialogHeader>
        {tab === 0 ? (
          <div className="w-full h-fit flex flex-col gap-4">
            <div className="w-full flex flex-col gap-4">
              <Input label="Resource Bucket Title" val={title} setVal={setTitle} maxLength={50} required={true} />
              <TextArea label="Resource Bucket Description" val={description} setVal={setDescription} maxLength={500} />
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-4">
            <div className="w-full flex justify-between items-start">
              <div>View Access -</div>
              <select
                onChange={el => setViewAccess(el.target.value)}
                value={viewAccess}
                className="w-1/2 max-lg:w-full h-12 border-[1px] border-primary_btn  dark:border-dark_primary_btn dark:text-white bg-primary_comp dark:bg-dark_primary_comp focus:outline-nonetext-sm rounded-lg block p-2"
              >
                {getResourcesAccessList(resourceType).map((c, i) => {
                  return (
                    <option className="bg-primary_comp_hover dark:bg-dark_primary_comp" key={i} value={c}>
                      {c}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="w-full flex justify-between items-start">
              <div className="flex flex-col gap-2">
                Create Access - <div className="text-xs ">(adding/removing files)</div>
              </div>
              <select
                onChange={el => setEditAccess(el.target.value)}
                value={editAccess}
                className="w-1/2 max-lg:w-full h-12 border-[1px] border-primary_btn  dark:border-dark_primary_btn dark:text-white bg-primary_comp dark:bg-dark_primary_comp focus:outline-nonetext-sm rounded-lg block p-2"
              >
                {getResourcesAccessList(resourceType).map((c, i) => {
                  return (
                    <option className="bg-primary_comp_hover dark:bg-dark_primary_comp" key={i} value={c}>
                      {c}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        )}
        <div className="w-full flex justify-between items-center mt-4">
          {tab == 0 ? <div></div> : <PrimaryButton onClick={() => setTab(0)} label="Back" />}
          <PrimaryButton
            onClick={() => {
              if (tab === 0) setTab(1);
              else if (tab === 1) handleSubmit();
            }}
            label={tab === 0 ? 'Next' : 'Create'}
            disabled={title.trim() == ''}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewResource;
