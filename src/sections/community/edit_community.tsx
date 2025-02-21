import Input from '@/components/form/input';
import Select from '@/components/form/select';
import Tags from '@/components/form/tags';
import TextArea from '@/components/form/textarea';
import { Button } from '@/components/ui/button';
import { SERVER_ERROR } from '@/config/errors';
import { COMMUNITY_COVER_PIC_URL, COMMUNITY_PROFILE_PIC_URL, COMMUNITY_URL } from '@/config/routes';
import patchHandler from '@/handlers/patch_handler';
import { Community, CommunityAccess } from '@/types';
import categories from '@/utils/categories';
import Toaster from '@/utils/toaster';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog';
import React, { useState } from 'react';
import isArrEdited from '@/utils/funcs/check_array_edited';
import Image from 'next/image';
import { PencilSimple } from '@phosphor-icons/react/dist/ssr';
import { resizeImage } from '@/utils/resize_image';
import Checkbox from '@/components/form/checkbox';

const EditCommunity = ({
  community,
  setCommunity,
}: {
  community: Community;
  setCommunity: React.Dispatch<React.SetStateAction<Community>>;
}) => {
  const [title, setTitle] = useState(community.title);
  const [description, setDescription] = useState(community.description || '');
  const [tagline, setTagline] = useState(community.tagline);
  const [category, setCategory] = useState(community.category);
  const [access, setAccess] = useState(community.access as string);
  const [tags, setTags] = useState(community.tags || []);
  const [isOpen, setIsOpen] = useState(community.isOpen);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [profilePic, setProfilePic] = useState<File>();
  const [profilePicView, setProfilePicView] = useState(`${COMMUNITY_PROFILE_PIC_URL}/${community.profilePic}`);
  const [coverPic, setCoverPic] = useState<File>();
  const [coverPicView, setCoverPicView] = useState(`${COMMUNITY_COVER_PIC_URL}/${community.coverPic}`);

  const handleSubmit = async () => {
    if (title.trim() === '') {
      Toaster.error('Title cannot be empty');
      return;
    }
    if (category.trim() === '' || category === 'Select Category') {
      Toaster.error('Select Category');
      return;
    }

    const toaster = Toaster.startLoad('Editing the community...');

    const formData = new FormData();
    if (title != community.title) formData.append('title', title);
    if (description != community.description) formData.append('description', description);
    if (tagline != community.tagline) formData.append('tagline', tagline);
    if (isArrEdited(tags, community.tags, true)) tags?.forEach(tag => formData.append('tags', tag));
    if (category != community.category) formData.append('category', category);
    if (access != community.access) formData.append('access', access);
    if (isOpen != community.isOpen) formData.append('isOpen', String(isOpen));
    if (profilePic) formData.append('profilePic', profilePic);
    if (coverPic) formData.append('coverPic', coverPic);

    const URL = `${COMMUNITY_URL}/${community.id}`;

    const res = await patchHandler(URL, formData, 'multipart/form-data');
    if (res.statusCode === 200) {
      const newCommunity = res.data.community;
      if (setCommunity)
        setCommunity(prev => {
          return {
            ...prev,
            title,
            tagline,
            description,
            tags,
            category,
            access: access as CommunityAccess,
            profilePic: newCommunity.profilePic,
            coverPic: newCommunity.coverPic,
          };
        });
      Toaster.stopLoad(toaster, 'Community Edited', 1);
      setIsDialogOpen(false);
    } else if (res.statusCode === 413) {
      Toaster.stopLoad(toaster, 'Image too large', 0);
    } else {
      Toaster.stopLoad(toaster, res.data.message || SERVER_ERROR, 0);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsDialogOpen(true)}>Edit Community</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md min-w-[30%]">
        <DialogHeader>
          <DialogTitle className="text-3xl">Edit Community</DialogTitle>
          <DialogDescription>Create your own niche and gather like-minded people.</DialogDescription>
        </DialogHeader>
        <div className="w-full max-lg:w-full text-primary_black flex flex-col gap-4 pb-8 max-lg:pb-4">
          <div className="w-full relative mb-6">
            <input
              type="file"
              className="hidden"
              id="coverPic"
              multiple={false}
              onChange={async ({ target }) => {
                if (target.files && target.files[0]) {
                  const file = target.files[0];
                  if (file.type.split('/')[0] == 'image') {
                    const resizedPic = await resizeImage(file, 1800, 300);
                    setCoverPicView(URL.createObjectURL(resizedPic));
                    setCoverPic(resizedPic);
                  } else Toaster.error('Only Image Files can be selected');
                }
              }}
            />
            <label
              htmlFor="coverPic"
              className="w-full h-full bg-white flex justify-end bg-opacity-50 absolute opacity-0 hover:opacity-100 top-0 right-0 rounded-lg p-2 transition-ease-300"
            >
              <PencilSimple weight="duotone" />
            </label>
            <Image
              crossOrigin="anonymous"
              className="w-full h-full rounded-lg"
              width={600}
              height={100}
              alt="cover pic"
              src={coverPicView}
            />
            <input
              type="file"
              className="hidden"
              id="profilePic"
              multiple={false}
              onChange={async ({ target }) => {
                if (target.files && target.files[0]) {
                  const file = target.files[0];
                  if (file.type.split('/')[0] == 'image') {
                    const resizedPic = await resizeImage(file, 1280, 1280);
                    setProfilePicView(URL.createObjectURL(resizedPic));
                    setProfilePic(resizedPic);
                  } else Toaster.error('Only Image Files can be selected');
                }
              }}
            />
            <label
              htmlFor="profilePic"
              className="w-20 h-20 flex-center absolute bg-white bg-opacity-50 opacity-0 hover:opacity-100 right-1/2 translate-x-1/2 -translate-y-1/2 rounded-full border-white border-4 transition-ease-300 z-10"
            >
              <PencilSimple weight="duotone" />
            </label>
            <Image
              crossOrigin="anonymous"
              className="w-20 h-20 absolute right-1/2 translate-x-1/2 -translate-y-1/2 rounded-full border-white border-4"
              width={100}
              height={100}
              alt="profile pic"
              src={profilePicView}
            />
          </div>
          <Input label="Community Name" val={title} setVal={setTitle} maxLength={25} type="text" required />
          <Input label="Community Tagline" val={tagline} setVal={setTagline} maxLength={100} type="text" required />
          <Select label="Community Category" val={category} setVal={setCategory} options={categories} required />
          <Select
            label="Community Access"
            val={String(access).charAt(0).toUpperCase() + String(access).slice(1)}
            setVal={setAccess}
            options={['Open', 'Restricted', 'Closed']}
            required
            caption={
              access === 'Open'
                ? "Anyone can see community's posts and join."
                : access === 'Restricted'
                ? 'Community join and post seeing on request basis.'
                : 'No one can either join your community or see its posts.'
            }
          />
          <TextArea label="Community Description" val={description} setVal={setDescription} maxLength={1000} />
          <Tags label="Community Tags" tags={tags} setTags={setTags} maxTags={10} />
          <Checkbox
            label="Is the community public?"
            val={isOpen}
            setVal={setIsOpen}
            caption={
              isOpen ? "Anyone can see all of community's posts" : 'Non-members cannot see community-only posts.'
            }
          />
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

export default EditCommunity;
