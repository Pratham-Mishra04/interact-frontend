import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SidePrimeWrapper } from '@/wrappers/side';
import Select from '@/components/form/select';
import Input from '@/components/form/input';
import Tags from '@/components/form/tags';
import { communityCategories } from '@/utils/categories';
import Toaster from '@/utils/toaster';
import postHandler from '@/handlers/post_handler';
import { COMMUNITY_PROFILE_PIC_URL, COMMUNITY_URL } from '@/config/routes';
import { Community, CommunityMembership } from '@/types';
import { SERVER_ERROR } from '@/config/errors';
import { useDispatch } from 'react-redux';
import { setCommunityMemberships, userSelector } from '@/slices/userSlice';
import { useSelector } from 'react-redux';
import getHandler from '@/handlers/get_handler';
import Image from 'next/image';
import Link from 'next/link';
import Checkbox from '@/components/form/checkbox';
import SideLoader from '@/components/loaders/side';
import { Plus } from '@phosphor-icons/react';
import TextArea from '@/components/form/textarea';

const CommunitySide = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [ownedCommunities, setOwnedCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCommunities = async (communityType: 'joined' | 'owned') => {
    const URL = `${COMMUNITY_URL}/me?communityType=${communityType}`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      const communityData = res.data.communities || [];
      if (communityType == 'joined') setCommunities(communityData);
      else setOwnedCommunities(communityData);
      setLoading(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  useEffect(() => {
    fetchCommunities('joined');
    fetchCommunities('owned');
  }, []);

  return (
    <>
      <SidePrimeWrapper>
        <CreateCommunity setCommunities={setOwnedCommunities} />
      </SidePrimeWrapper>
      {loading ? (
        <>
          <SideLoader boxes={2} boxClassname="h-10" />
          <SideLoader boxes={2} boxClassname="h-10" />
        </>
      ) : (
        <>
          {ownedCommunities && ownedCommunities.length > 0 && (
            <SidePrimeWrapper title="Owned Communities">
              <div className="w-full flex flex-col gap-2">
                {ownedCommunities.map(community => (
                  <Link
                    href={`/community/${community.id}`}
                    key={community.id}
                    className="w-fit flex items-center gap-2 group"
                  >
                    <Image
                      width={20}
                      height={20}
                      src={`${COMMUNITY_PROFILE_PIC_URL}/${community.profilePic}`}
                      placeholder="blur"
                      blurDataURL={community.profilePicBlurHash || 'no-hash'}
                      alt=""
                      className="w-6 h-6 rounded-full cursor-pointer"
                    />
                    <div className="w-fit text-lg font-medium cursor-pointer">{community.title}</div>
                  </Link>
                ))}
              </div>
            </SidePrimeWrapper>
          )}
          {communities && communities.length > 0 && (
            <SidePrimeWrapper title="Joined Communities">
              <div className="w-full flex flex-col gap-2">
                {communities.map(community => (
                  <Link
                    href={`/community/${community.id}`}
                    key={community.id}
                    className="w-fit flex items-center gap-2 group"
                  >
                    <Image
                      width={50}
                      height={50}
                      src={`${COMMUNITY_PROFILE_PIC_URL}/${community.profilePic}`}
                      placeholder="blur"
                      blurDataURL={community.profilePicBlurHash || 'no-hash'}
                      alt=""
                      className="w-6 h-6 rounded-full cursor-pointer"
                    />
                    <div className="w-fit text-lg font-medium cursor-pointer">{community.title}</div>
                  </Link>
                ))}
              </div>
            </SidePrimeWrapper>
          )}
        </>
      )}
    </>
  );
};

const CreateCommunity = ({ setCommunities }: { setCommunities: React.Dispatch<React.SetStateAction<Community[]>> }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState('');
  const [access, setAccess] = useState('Open');
  const [tags, setTags] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const user = useSelector(userSelector);
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    if (title.trim() === '') {
      Toaster.error('Title cannot be empty');
      return;
    }
    if (category.trim() === '' || category === 'Select Category') {
      Toaster.error('Select Category');
      return;
    }

    const toaster = Toaster.startLoad('Creating your community...');

    const formData = {
      title,
      description,
      tagline,
      tags,
      category,
      access,
      isOpen,
    };

    const res = await postHandler(COMMUNITY_URL, formData, 'multipart/form-data');

    if (res.statusCode === 201) {
      const community: Community = res.data.community;
      const membership: CommunityMembership = res.data.membership;

      membership.community = community;

      if (setCommunities) setCommunities(prev => [community, ...prev]);
      setTitle('');
      setDescription('');
      setTagline('');
      setTags([]);
      setCategory('');
      setAccess('Open');
      dispatch(setCommunityMemberships([...(user.communityMemberships || []), membership]));

      Toaster.stopLoad(toaster, 'Community Created!', 1);
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
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="w-full dark:bg-dark_primary_comp_hover dark:hover:bg-dark_primary_comp_active"
        >
          Create your Community <Plus size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md min-w-[30%]">
        <DialogHeader>
          <DialogTitle className="text-3xl">Create Community</DialogTitle>
          <DialogDescription>Create your own niche and gather like-minded people.</DialogDescription>
        </DialogHeader>
        <div className="w-full max-lg:w-full text-primary_black flex flex-col gap-4 pb-8 max-lg:pb-4">
          <Input label="Community Name" val={title} setVal={setTitle} maxLength={25} type="text" required />
          <Input label="Community Tagline" val={tagline} setVal={setTagline} maxLength={100} type="text" required />
          <Select
            label="Community Category"
            val={category}
            setVal={setCategory}
            options={communityCategories}
            required
          />
          <Select
            label="Community Access"
            val={access}
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

export default CommunitySide;
