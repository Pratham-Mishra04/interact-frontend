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
import Report from '../common/report';
import SignUp from '../common/signup_box';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import { ORG_SENIOR } from '@/config/constants';
import { Buildings } from '@phosphor-icons/react';
import isArrEdited from '@/utils/funcs/check_array_edited';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Editor from '@/components/editor';
import { useOrgAccess } from '@/hooks/use-org-access';

interface Props {
  post: Post;
  showLowerPost?: boolean;
  showImage?: boolean;
  isRepost?: boolean;
  setFeed?: React.Dispatch<React.SetStateAction<any[]>>;
  org?: boolean;
  clamp?: boolean;
  initialCommentShowState?: boolean;
}

const PostComponent = ({
  post,
  showLowerPost = true,
  showImage = true,
  isRepost = false,
  setFeed,
  org = false,
  clamp = false,
  initialCommentShowState = false,
}: Props) => {
  const loggedInUser = useSelector(userSelector);
  const [clickedOnEdit, setClickedOnEdit] = useState(false);
  const [clickedOnDelete, setClickedOnDelete] = useState(false);
  const [clickedOnReport, setClickedOnReport] = useState(false);

  const [noUserClick, setNoUserClick] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [caption, setCaption] = useState(post.content);

  const userID = useSelector(userIDSelector) || '';

  const isSenior = useOrgAccess(ORG_SENIOR, post.userID, true);

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
      className={`w-full relative bg-white dark:bg-transparent font-primary flex gap-1 ${
        !isRepost ? 'border-b-[1px] py-4' : 'rounded-lg border-[1px] p-2'
      } border-gray-300 dark:border-dark_primary_btn animate-fade_third`}
    >
      {noUserClick && <SignUp setShow={setNoUserClick} />}
      {clickedOnDelete && <ConfirmDelete setShow={setClickedOnDelete} handleDelete={handleDelete} />}
      {clickedOnReport && <Report postID={post.id} setShow={setClickedOnReport} />}
      <div className="h-full">
        <Link
          href={`/users/${post.user.isOrganization ? 'organisations/' : ''}${post.user.username}`}
          className="rounded-full"
        >
          <Image
            crossOrigin="anonymous"
            width={100}
            height={100}
            alt={'User Pic'}
            src={`${USER_PROFILE_PIC_URL}/${post.user.profilePic}`}
            placeholder="blur"
            blurDataURL={post.user.profilePicBlurHash || 'no-hash'}
            className="rounded-full w-8 h-8"
          />
        </Link>
      </div>
      <div className="w-[calc(100%-32px)] flex flex-col gap-1">
        <div className="w-full h-fit flex justify-between">
          <Link
            href={`/${post.user.isOrganization ? 'organisations' : 'users'}/${post.user.username}`}
            className="font-medium flex items-center gap-1"
          >
            {post.user.name}
            {post.user.isOrganization ? <Buildings weight="duotone" /> : <></>}
            <div className="text-xs font-normal text-gray-500">@{post.user.username}</div>
          </Link>
          <div className="flex-center gap-2 text-xs text-gray-400">
            {post.isEdited && <div>(edited)</div>}
            <div>{moment(post.postedAt).fromNow()}</div>
            {clickedOnEdit || (post.userID == loggedInUser.id && isRepost) ? (
              <></>
            ) : (
              showLowerPost && (
                <Popover open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <PopoverTrigger>
                    <div className="text-xxs cursor-pointer">•••</div>
                  </PopoverTrigger>
                  <PopoverContent className="w-40 p-2 text-sm" align="end">
                    {(post.userID == loggedInUser.id || isSenior) && (
                      <div
                        onClick={e => {
                          e.stopPropagation();
                          setClickedOnEdit(true);
                          setIsDialogOpen(false);
                        }}
                        className="w-full px-4 py-2 max-md:p-1 max-md:text-center hover:bg-primary_comp dark:hover:bg-dark_primary_comp_hover rounded-lg cursor-pointer transition-ease-300"
                      >
                        Edit
                      </div>
                    )}
                    {(post.userID == loggedInUser.id || isSenior) && (
                      <div
                        onClick={el => {
                          el.stopPropagation();
                          setClickedOnDelete(true);
                          setIsDialogOpen(false);
                        }}
                        className="w-full px-4 py-2 max-md:p-1 max-md:text-center hover:bg-primary_comp dark:hover:bg-dark_primary_comp_hover hover:text-primary_danger rounded-lg cursor-pointer transition-ease-100 "
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
                          setIsDialogOpen(false);
                        }}
                        className="w-full px-4 py-2 max-md:p-1 max-md:text-center hover:bg-primary_comp dark:hover:bg-dark_primary_comp_hover hover:text-primary_danger rounded-lg cursor-pointer transition-ease-100 "
                      >
                        Report
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
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
          <>
            <Editor
              className="w-full min-h-[150px] text-sm mb-2"
              content={caption}
              setContent={setCaption}
              limit={2000}
              editable
            />
            <div className="w-full dark:text-white flex items-center justify-end gap-2 max-md:gap-1">
              <div
                onClick={e => {
                  e.stopPropagation();
                  setClickedOnEdit(false);
                }}
                className="border-[1px] border-primary_black flex-center rounded-full w-16 max-md:w-12 text-xs max-md:text-xxs p-1 cursor-pointer"
              >
                cancel
              </div>
              <div
                onClick={caption !== post.content ? handleEdit : undefined}
                className={`bg-primary_black ${
                  caption === post.content ? 'bg-opacity-50 cursor-default' : 'cursor-pointer'
                } text-white flex-center rounded-full w-16 max-md:w-12 text-xs max-md:text-xxs p-1`}
              >
                save
              </div>
            </div>
          </>
        ) : (
          <Editor className="w-full text-sm mb-2" content={post.content} editable={false} />
        )}
        {showLowerPost && (
          <LowerPost
            setFeed={setFeed}
            post={post}
            isRepost={isRepost}
            initialCommentShowState={initialCommentShowState}
          />
        )}
      </div>
    </div>
  );
};

export default PostComponent;
