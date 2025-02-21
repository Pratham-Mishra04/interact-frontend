import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL, POST_URL } from '@/config/routes';
import postHandler from '@/handlers/post_handler';
import Toaster from '@/utils/toaster';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Announcement, Poll, Post } from '@/types';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import Editor from '@/components/editor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Repeat } from '@phosphor-icons/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PostCard from '@/components/cards/post';

interface Props {
  post: Post;
  setFeed?: React.Dispatch<React.SetStateAction<(Post | Announcement | Poll)[]>>;
  org?: boolean;
}

const RePost = ({ post, setFeed, org = false }: Props) => {
  const [content, setContent] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentOrgID = useSelector(currentOrgIDSelector);

  const handleSubmit = async () => {
    const toaster = Toaster.startLoad('Adding your Post..');
    const formData = new FormData();

    formData.append('content', content.replace(/\n{3,}/g, '\n\n'));
    formData.append('rePostID', post.id);

    const URL = org ? `${ORG_URL}/${currentOrgID}/posts` : POST_URL;

    const res = await postHandler(URL, formData, 'multipart/form-data');

    if (res.statusCode === 201) {
      if (setFeed) setFeed(prev => [res.data.post, ...prev]);
      Toaster.stopLoad(toaster, 'Posted!', 1);
      setContent('');
      setIsDialogOpen(false);
      setIsDropdownOpen(false);
    } else {
      Toaster.stopLoad(toaster, res.data.message || SERVER_ERROR, 0);
    }
  };

  return (
    <div>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger>
          <Repeat className="cursor-pointer max-md:w-6 max-md:h-6 opacity-60" size={24} weight="regular" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleSubmit}>
            <div>
              <div className="text-base font-medium">Quick Repost</div>
              <div className="text-gray-600 text-xs">Repost instantly to share {post.user.name}&apos;s post.</div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setIsDialogOpen(true);
              setIsDropdownOpen(false);
            }}
          >
            <div>
              <div className="text-base font-medium">Add to Conversation</div>
              <div className="text-gray-600 text-xs">Create a new post with {post.user.name}&apos;s post attached.</div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="min-w-[720px]">
          <DialogHeader>
            <DialogTitle>Repost {post.user.name}&apos;s post with your thoughts</DialogTitle>
          </DialogHeader>
          <div className="w-full flex flex-col gap-4">
            <PostCard post={post} />
            <Editor
              editable
              setContent={setContent}
              placeholder="Add to conversation..."
              limit={2000}
              className="w-full min-h-[150px]"
            />
            <div className="w-full flex justify-end">
              <div
                onClick={handleSubmit}
                className="w-[120px] h-[48px] bg-primary_comp dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active transition-ease-300 shrink-0 flex-center text-lg font-semibold rounded-lg cursor-pointer"
              >
                Post
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RePost;
