import React, { useState } from 'react';
import Image from 'next/image';
import { Post } from '@/types';
import { USER_PROFILE_PIC_URL, POST_PIC_URL, POST_URL, ORG_URL } from '@/config/routes';
import moment from 'moment';
import { CarouselProvider, Slider, Slide, Dot } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import Link from 'next/link';
import LowerPost from '../lowers/lower_post';
import { userIDSelector, userSelector } from '@/slices/userSlice';
import { useSelector } from 'react-redux';
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
import isArrEdited from '@/utils/funcs/check_array_edited';

interface Props {
  post: Post;
  showLowerPost?: boolean;
  showImage?: boolean;
  isRepost?: boolean;
  setFeed?: React.Dispatch<React.SetStateAction<any[]>>;
  org?: boolean;
}

const Post = ({ post, showLowerPost = true, showImage = true, isRepost = false, setFeed, org = false }: Props) => {
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

    const taggedUsers = (post.taggedUsers || []).map(u => u.username);
    const newTags = (caption.match(/@([\w-]+)/g) || []).map(match => match.substring(1));

    const formData = new FormData();
    formData.append('content', caption.replace(/\n{3,}/g, '\n\n'));
    if (isArrEdited(taggedUsers, newTags)) newTags.forEach(tag => formData.append('taggedUsernames[]', tag));

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
      className={`w-full relative overflow-clip bg-white dark:bg-transparent font-primary flex gap-1 rounded-lg dark:rounded-none dark:text-white border-gray-300 border-[1px] dark:border-x-0 dark:border-t-0 dark:border-dark_primary_btn ${
        !isRepost ? 'dark:border-b-[1px] p-4' : 'dark:border-b-0 p-2'
      }`}
    >
      {noUserClick && <SignUp setShow={setNoUserClick} />}
      {clickedOnDelete && <ConfirmDelete setShow={setClickedOnDelete} handleDelete={handleDelete} />}
      {clickedOnReport && <Report postID={post.id} setShow={setClickedOnReport} />}
      {clickedOnOptions &&
        (clickedOnEdit || (post.userID == loggedInUser.id && isRepost) ? (
          <></>
        ) : (
          <div className="w-1/4 h-fit flex flex-col bg-gray-100 bg-opacity-75 dark:bg-transparent absolute top-2 right-12 rounded-xl glassMorphism text-sm p-2 z-10 animate-fade_third">
            {(post.userID == loggedInUser.id || checkOrgAccess(ORG_SENIOR)) && (
              <div
                onClick={() => setClickedOnEdit(true)}
                className="w-full px-4 py-2 max-md:p-1 max-md:text-center hover:bg-[#ffffff] dark:hover:bg-[#ffffff19] transition-ease-100 rounded-lg cursor-pointer"
              >
                Edit
              </div>
            )}
            {(post.userID == loggedInUser.id || checkOrgAccess(ORG_SENIOR)) && (
              <div
                onClick={el => {
                  el.stopPropagation();
                  setClickedOnDelete(true);
                }}
                className="w-full px-4 py-2 max-md:p-1 max-md:text-center hover:bg-[#ffffff] dark:hover:bg-[#ffffff19] hover:text-primary_danger transition-ease-100 rounded-lg cursor-pointer"
              >
                Delete
              </div>
            )}

            {post.userID != loggedInUser.id && (
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
            )}
          </div>
        ))}
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
            width={100}
            height={100}
            alt={'User Pic'}
            src={`${USER_PROFILE_PIC_URL}/${post.user.profilePic}`}
            className={'rounded-full w-8 h-8'}
          />
        </Link>
      </div>
      <div className="w-[calc(100%-32px)] flex flex-col gap-1">
        <div className="w-full h-fit flex justify-between">
          <Link
            href={`${
              post.user.username != loggedInUser.username
                ? `/explore/${post.user.isOrganization ? 'organisation' : 'user'}/${post.user.username}`
                : `/${post.user.isOrganization ? 'organisation/' : ''}profile`
            }`}
            className="font-medium flex items-center gap-1"
          >
            {post.user.name}
            {post.user.isOrganization ? <Buildings weight="duotone" /> : <></>}
            <div className="text-xs font-normal text-gray-500">@{post.user.username}</div>
          </Link>
          <div className="flex-center gap-2 text-xs text-gray-400">
            {post.isEdited ? <div>(edited)</div> : <></>}
            <div>{moment(post.postedAt).fromNow()}</div>
            {clickedOnEdit || (post.userID == loggedInUser.id && isRepost) ? (
              <></>
            ) : (
              showLowerPost && (
                <div
                  onClick={el => {
                    el.stopPropagation();
                    setClickedOnOptions(prev => !prev);
                  }}
                  className="text-xxs cursor-pointer"
                >
                  •••
                </div>
              )
            )}
          </div>
        </div>
        {post.images && post.images.length > 0 && showImage && (
          <CarouselProvider
            naturalSlideHeight={580}
            naturalSlideWidth={1000}
            totalSlides={post.images.length}
            visibleSlides={1}
            infinite={true}
            dragEnabled={post.images.length != 1}
            touchEnabled={post.images.length != 1}
            isPlaying={false}
            className="w-full rounded-lg flex flex-col items-center justify-center relative"
          >
            <Slider className={`w-full rounded-lg`}>
              {post.images.map((image, index) => {
                return (
                  <Slide
                    index={index}
                    key={index}
                    className={`w-full rounded-lg flex items-center justify-center gap-2`}
                  >
                    <Image
                      crossOrigin="anonymous"
                      width={500}
                      height={500}
                      className="w-full"
                      alt={'Post Pic'}
                      src={`${POST_PIC_URL}/${image}`}
                      placeholder="blur"
                      blurDataURL={(post.hashes && post.hashes[index]) || 'no-hash'}
                    />
                  </Slide>
                );
              })}
            </Slider>
            <div className={`${post.images.length === 1 ? 'hidden' : ''} absolute bottom-5`}>
              {post.images.map((_, i) => {
                return <Dot key={i} slide={i} />;
              })}
            </div>
          </CarouselProvider>
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

            <div className="dark:text-white flex items-center gap-4 max-md:gap-1 absolute -bottom-8 right-0">
              <div
                onClick={() => setClickedOnEdit(false)}
                className="border-[1px] border-primary_black flex-center rounded-full w-20 max-md:w-12 max-md:text-xxs p-1 cursor-pointer"
              >
                cancel
              </div>
              {caption == post.content ? (
                <div className="bg-primary_black bg-opacity-50 text-white flex-center rounded-full w-16 max-md:w-12 max-md:text-xxs p-1 cursor-default">
                  save
                </div>
              ) : (
                <div
                  onClick={handleEdit}
                  className="bg-primary_black text-white flex-center rounded-full w-16 max-md:w-12 max-md:text-xxs p-1 cursor-pointer"
                >
                  save
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full text-sm  whitespace-pre-wrap mb-2">
            {renderContentWithLinks(post.content, post.taggedUsers)}
          </div>
        )}
        {showLowerPost && <LowerPost setFeed={setFeed} post={post} isRepost={isRepost} />}
      </div>
    </div>
  );
};

export default Post;
