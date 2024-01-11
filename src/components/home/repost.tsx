import React, { useState } from 'react';
import Image from 'next/image';
import { Post } from '@/types';
import { ORG_URL, POST_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import moment from 'moment';
import Link from 'next/link';
import LowerPost from '../lowers/lower_post';
import { userIDSelector, userSelector } from '@/slices/userSlice';
import { useSelector } from 'react-redux';
import PostComponent from './post';
import deleteHandler from '@/handlers/delete_handler';
import Toaster from '@/utils/toaster';
import patchHandler from '@/handlers/patch_handler';
import { SERVER_ERROR } from '@/config/errors';
import ConfirmDelete from '../common/confirm_delete';
import renderContentWithLinks from '@/utils/funcs/render_content_with_links';
import Report from '../common/report';
import SignUp from '../common/signup_box';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import checkOrgAccess from '@/utils/funcs/check_org_access';
import { ORG_SENIOR } from '@/config/constants';
import { Buildings } from '@phosphor-icons/react';

interface Props {
  post: Post;
  showLowerPost?: boolean;
  setFeed?: React.Dispatch<React.SetStateAction<Post[]>>;
  org?: boolean;
}

const RePost = ({ post, showLowerPost = true, setFeed, org = false }: Props) => {
  const loggedInUser = useSelector(userSelector);
  const [clickedOnOptions, setClickedOnOptions] = useState(false);
  const [clickedOnEdit, setClickedOnEdit] = useState(false);
  const [clickedOnDelete, setClickedOnDelete] = useState(false);
  const [clickedOnReport, setClickedOnReport] = useState(false);

  const [noUserClick, setNoUserClick] = useState(false);

  const [caption, setCaption] = useState(post.content);

  const userID = useSelector(userIDSelector) || '';

  const handleDelete = async () => {
    const toaster = Toaster.startLoad('Deleting your post...');

    const URL = org ? `${ORG_URL}/${currentOrgID}/posts/${post.id}` : `${POST_URL}/${post.id}`;

    const res = await deleteHandler(URL);

    if (res.statusCode === 204) {
      if (setFeed) setFeed(prev => prev.filter(p => p.id != post.id));
      setClickedOnDelete(false);
      Toaster.stopLoad(toaster, 'Post Deleted', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'b' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      wrapSelectedText('**', '**');
    }
  };

  const wrapSelectedText = (prefix: string, suffix: string) => {
    const textarea = document.getElementById('textarea_id') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = caption.substring(start, end);
    const newText = caption.substring(0, start) + prefix + selectedText + suffix + caption.substring(end);
    setCaption(newText);
    textarea.focus();
    textarea.setSelectionRange(start + prefix.length, end + prefix.length);
  };

  const currentOrgID = useSelector(currentOrgIDSelector);

  const handleEdit = async () => {
    if (caption == post.content || caption.trim().length == 0 || caption.replace(/\n/g, '').length == 0) {
      setClickedOnEdit(false);
      return;
    }
    const toaster = Toaster.startLoad('Editing Post...');

    const URL = org ? `${ORG_URL}/${currentOrgID}/posts/${post.id}` : `${POST_URL}/${post.id}`;

    const formData = {
      content: caption.replace(/\n{3,}/g, '\n\n'),
    };

    const res = await patchHandler(URL, formData);
    if (res.statusCode === 200) {
      if (setFeed)
        setFeed(prev =>
          prev.map(p => {
            if (p.id == post.id) return { ...p, content: caption.replace(/\n{3,}/g, '\n\n'), edited: true };
            else return p;
          })
        );
      setClickedOnEdit(false);
      Toaster.stopLoad(toaster, 'Post Edited', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  return (
    <div
      onClick={() => setClickedOnOptions(false)}
      className="w-full relative overflow-clip bg-white dark:bg-transparent font-primary flex gap-1 rounded-lg dark:rounded-none dark:text-white p-4 border-gray-300 border-[1px] dark:border-x-0 dark:border-t-0 dark:border-dark_primary_btn dark:border-b-[1px] max-md:p-4"
    >
      {noUserClick ? <SignUp setShow={setNoUserClick} /> : <></>}
      {clickedOnDelete ? <ConfirmDelete setShow={setClickedOnDelete} handleDelete={handleDelete} /> : <></>}
      {clickedOnReport ? <Report postID={post.id} setShow={setClickedOnReport} /> : <></>}
      {!clickedOnEdit && clickedOnOptions ? (
        <div className="w-1/4 h-fit flex flex-col bg-gray-100 bg-opacity-75 dark:bg-transparent absolute top-2 right-12 rounded-xl glassMorphism text-sm p-2 z-10 animate-fade_third">
          {post.userID == loggedInUser.id || checkOrgAccess(ORG_SENIOR) ? (
            <div
              onClick={() => setClickedOnEdit(true)}
              className="w-full px-4 py-2 max-md:p-1 max-md:text-center hover:bg-[#ffffff] dark:hover:bg-[#ffffff19] transition-ease-100 rounded-lg cursor-pointer"
            >
              Edit
            </div>
          ) : (
            <></>
          )}
          {post.userID == loggedInUser.id || checkOrgAccess(ORG_SENIOR) ? (
            <div
              onClick={el => {
                el.stopPropagation();
                setClickedOnDelete(true);
              }}
              className="w-full px-4 py-2 max-md:p-1 max-md:text-center hover:bg-[#ffffff] dark:hover:bg-[#ffffff19] hover:text-primary_danger transition-ease-100 rounded-lg cursor-pointer"
            >
              Delete
            </div>
          ) : (
            <></>
          )}

          {post.userID != loggedInUser.id ? (
            <div
              onClick={el => {
                el.stopPropagation();
                if (userID == '') setNoUserClick(true);
                else setClickedOnReport(true);
              }}
              className="w-full px-4 py-2 max-md:p-1 max-md:text-center hover:bg-[#ffffff] dark:hover:bg-[#ffffff19] hover:text-primary_danger transition-ease-100 rounded-lg cursor-pointer"
            >
              Report
            </div>
          ) : (
            <></>
          )}
        </div>
      ) : (
        <></>
      )}
      <div className="h-full">
        <Link
          href={`${
            post.user.username != loggedInUser.username
              ? `/explore/user/${post.user.isOrganization ? 'organisation/' : ''}${post.user.username}`
              : `/${post.user.isOrganization ? 'organisation/' : ''}profile`
          }`}
          className="rounded-full"
        >
          <Image
            crossOrigin="anonymous"
            width={50}
            height={50}
            alt={'User Pic'}
            src={`${USER_PROFILE_PIC_URL}/${post.user.profilePic}`}
            className={'rounded-full w-8 h-8'}
          />
        </Link>
      </div>
      <div className="grow max-w-[94%] max-md:max-w-[89%] flex flex-col gap-2">
        <div className="w-full h-fit flex justify-between">
          <Link
            href={`${
              post.user.username != loggedInUser.username
                ? `/explore/${post.user.isOrganization ? 'organisation' : 'user'}/${post.user.username}`
                : `/${post.user.isOrganization ? 'organisation/' : ''}profile`
            }`}
            className="font-medium flex items-center gap-1"
          >
            {post.user.username}
            {post.user.isOrganization ? <Buildings weight="duotone" /> : <></>}
          </Link>
          <div className="flex gap-2 font-light text-xs">
            <div>{moment(post.postedAt).fromNow()}</div>
            {!clickedOnEdit && showLowerPost ? (
              <div
                onClick={el => {
                  el.stopPropagation();
                  setClickedOnOptions(prev => !prev);
                }}
                className="text-xxs cursor-pointer"
              >
                •••
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>

        {post.isRePost && post.rePost ? (
          <PostComponent post={post.rePost} isRepost={true} />
        ) : (
          <div className="border-[1px] rounded-lg p-2 text-sm font-medium">* This post has been deleted *</div>
        )}

        {clickedOnEdit ? (
          <div className="relative">
            <textarea
              id="textarea_id"
              maxLength={2000}
              value={caption}
              autoFocus={true}
              onChange={el => setCaption(el.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full text-sm whitespace-pre-wrap rounded-md focus:outline-none dark:bg-dark_primary_comp p-2 my-2 max-h-72"
            />

            <div className="dark:text-white flex items-center gap-4 absolute -bottom-8 right-0">
              <div
                onClick={() => setClickedOnEdit(false)}
                className="text-sm hover-underline-animation after:bg-black dark:after:bg-white cursor-pointer"
              >
                cancel
              </div>
              <div
                onClick={handleEdit}
                className="text-sm hover:text-primary_text dark:hover:text-dark_primary_btn cursor-pointer transition-ease-200"
              >
                save
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full text-sm whitespace-pre-wrap mb-2">
            {renderContentWithLinks(post.content, post.taggedUsers)}
          </div>
        )}
        {showLowerPost ? <LowerPost post={post} /> : <></>}
      </div>
    </div>
  );
};

export default RePost;
