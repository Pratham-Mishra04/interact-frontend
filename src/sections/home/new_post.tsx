import { SERVER_ERROR } from '@/config/errors';
import { COMMUNITY_PROFILE_PIC_URL, COMMUNITY_URL, ORG_URL, POST_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import postHandler from '@/handlers/post_handler';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { userSelector } from '@/slices/userSlice';
import { useSelector } from 'react-redux';
import NewPostImages from '@/components/home/new_post_images';
import NewPostHelper from '@/components/home/new_post_helper';
import { useWindowWidth } from '@react-hook/window-size';
import { currentOrgSelector } from '@/slices/orgSlice';
import ModalWrapper from '@/wrappers/modal';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Checkbox from '@/components/form/checkbox';
import Editor from '@/components/editor';
import { useLocalDraft } from '@/hooks/use-local-draft';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setFeed?: React.Dispatch<React.SetStateAction<any[]>>;
  org?: boolean;
  initialCommunityID?: string;
}

const NewPost = ({ setShow, setFeed, org = false, initialCommunityID = '' }: Props) => {
  const [content, setContent] = useState<string>('');
  const [images, setImages] = useState<File[]>([]);

  const { draft: postDraft, clearDraft} = useLocalDraft("post-draft", content);

  const user = useSelector(userSelector);
  const currentOrg = useSelector(currentOrgSelector);

  const [openCommunityDropdown, setOpenCommunityDropdown] = React.useState(false);
  const [communityID, setCommunityID] = React.useState(initialCommunityID);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    document.documentElement.style.overflowY = 'hidden';
    document.documentElement.style.height = '100vh';

    return () => {
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.height = 'auto';
    };
  }, []);

  const handleSubmit = async () => {
    if (content.trim() == '' || content.replace(/\n/g, '').length == 0) {
      Toaster.error('Caption cannot be empty!');
      return;
    }

    const toaster = Toaster.startLoad('Adding your Post..');
    const formData = new FormData();

    images.forEach(file => {
      formData.append('images', file);
    });
    formData.append('content', content.replace(/\n{3,}/g, '\n\n'));
    formData.append('isOpen', String(isOpen));

    const URL = org
      ? `${ORG_URL}/${currentOrg.id}/posts`
      : communityID
      ? `${COMMUNITY_URL}/${communityID}/posts`
      : POST_URL;

    const res = await postHandler(URL, formData, 'multipart/form-data');

    if (res.statusCode === 201) {
      setContent('');
      setImages([]);
      setShow(false);
      clearDraft();
      if (setFeed) setFeed(prev => [res.data.post, ...prev]);
      Toaster.stopLoad(toaster, 'Posted!', 1);
      setShow(false);
    } else if (res.statusCode == 413) {
      Toaster.stopLoad(toaster, 'Image/s too large', 0);
    } else {
      Toaster.stopLoad(toaster, res.data.message || SERVER_ERROR, 0);
    }
  };

  const width = useWindowWidth();

  return (
    <ModalWrapper setShow={setShow} top="1/2" width="2/3" height="2/3" blur={true} border={false}>
      <div className="w-full h-full flex flex-col justify-between items-end">
        <div className="w-full flex flex-col gap-6">
          <div className="flex gap-4 max-md:w-full">
            <Image
              crossOrigin="anonymous"
              className="w-16 h-16 rounded-full"
              width={50}
              height={50}
              alt="user"
              src={`${USER_PROFILE_PIC_URL}/${org ? currentOrg.coverPic : user.profilePic || 'default.jpg'}`}
            />
            <div className="grow flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="w-fit max-md:w-full flex-center max-md:justify-between max-md:flex-wrap gap-12 max-md:gap-4">
                  <div className="flex flex-col">
                    <div className="text-2xl font-semibold">{org ? currentOrg.title : user.name}</div>
                    {!org && <div className="text-sm">@{user.username}</div>}
                  </div>

                  {user.communityMemberships && user.communityMemberships.length > 0 && (
                    <Popover open={openCommunityDropdown} onOpenChange={setOpenCommunityDropdown}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCommunityDropdown}
                          className="w-[200px] justify-between"
                        >
                          {communityID
                            ? '@' +
                              user.communityMemberships?.find(membership => membership.communityID === communityID)
                                ?.community?.title
                            : 'Post in Community'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Search Community..." />
                          <CommandList>
                            <CommandEmpty>No Community Found.</CommandEmpty>
                            <CommandGroup>
                              {user.communityMemberships?.map(membership => (
                                <CommandItem
                                  key={membership.id}
                                  value={membership.communityID}
                                  onSelect={currentValue => {
                                    setCommunityID(currentValue === communityID ? '' : currentValue);
                                    setOpenCommunityDropdown(false);
                                  }}
                                >
                                  {communityID === membership.communityID ? (
                                    <Check className="mr-2 h-4 w-4" />
                                  ) : (
                                    <Image
                                      crossOrigin="anonymous"
                                      className="w-4 h-4 rounded-full mr-2"
                                      width={20}
                                      height={20}
                                      alt="profile pic"
                                      src={`${COMMUNITY_PROFILE_PIC_URL}/${membership.community?.profilePic}`}
                                    />
                                  )}

                                  {membership.community?.title}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>

                <div
                  onClick={handleSubmit}
                  className="max-md:hidden w-[120px] h-[48px] bg-primary_comp dark:bg-dark_primary_comp hover:bg-primary_comp_hover dark:hover:bg-dark_primary_comp_hover active:bg-primary_comp_active dark:active:bg-dark_primary_comp_active transition-ease-300 shrink-0 flex-center text-lg font-semibold rounded-lg cursor-pointer"
                >
                  Post
                </div>
              </div>
              {width > 640 && (
                <div className="w-full flex flex-col gap-8 relative">
                  <div className="w-full flex gap-4 items-center">
                    <NewPostImages setSelectedFiles={setImages} />
                    {images.length == 0 && <NewPostHelper />}
                  </div>
                  <Editor
                    editable
                    content={postDraft}
                    setContent={setContent}
                    placeholder="Start a conversation..."
                    limit={2000}
                    className="min-h-[350px]"
                  />
                  {communityID && (
                    <div className="w-full mt-4">
                      <Checkbox
                        label="Is the post open?"
                        val={isOpen}
                        setVal={setIsOpen}
                        caption={
                          isOpen
                            ? 'Post will be shown on your profile as well.'
                            : "Post will only be shown in the community's feed."
                        }
                        border={false}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {width <= 640 && (
            <div className="md:hidden w-full flex flex-col gap-8 relative">
              <div className="w-full flex gap-4 items-center">
                <NewPostImages setSelectedFiles={setImages} />
                {images.length == 0 && <NewPostHelper smallScreen={true} />}
              </div>
              <Editor
                editable
                setContent={setContent}
                placeholder="Start a conversation..."
                limit={2000}
                className="min-h-[350px]"
              />
              {communityID && (
                <div className="w-full my-4">
                  <Checkbox
                    label="Is the post open?"
                    val={isOpen}
                    setVal={setIsOpen}
                    caption={
                      isOpen
                        ? 'Post will be shown on your profile as well.'
                        : "Post will only be shown in the community's feed."
                    }
                    border={false}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        <div
          onClick={handleSubmit}
          className="md:hidden w-[120px] h-[48px] bg-primary_comp dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active transition-ease-300 shrink-0 flex-center text-lg font-semibold rounded-lg cursor-pointer"
        >
          Post
        </div>
      </div>
    </ModalWrapper>
  );
};

export default NewPost;
