import { COMMENT_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import { Comment } from '@/types';
import { Trash } from '@phosphor-icons/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import LowerComment from '../lowers/lower_comment';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import Toaster from '@/utils/toaster';
import deleteHandler from '@/handlers/delete_handler';
import { SERVER_ERROR } from '@/config/errors';
import renderContentWithLinks from '@/utils/funcs/render_content_with_links';

interface Props {
  comment: Comment;
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  setNoComments?: React.Dispatch<React.SetStateAction<number>>;
}

const CommentComponent = ({ comment, setComments, setNoComments }: Props) => {
  const [clickedOnReply, setClickedOnReply] = useState(false);

  const loggedInUser = useSelector(userSelector);

  //TODO add confirm delete
  const deleteComment = async (commentID: string) => {
    const toaster = Toaster.startLoad('Deleting Comment');
    const URL = `${COMMENT_URL}/${commentID}`;
    const res = await deleteHandler(URL);
    if (res.statusCode == 204) {
      Toaster.stopLoad(toaster, 'Comment Deleted', 1);
      setComments(prev => prev.filter(c => c.id != commentID));
      if (setNoComments) setNoComments(prev => prev - 1);
    } else {
      if (res.data.message != '') Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
  };

  return (
    <div key={comment.id} className="w-full h-full flex gap-2">
      <div className="w-fit h-full flex flex-col items-center gap-2">
        <Link href={`/users/${comment.user.username}`} target="_blank">
          <Image
            crossOrigin="anonymous"
            width={50}
            height={50}
            alt={'User Pic'}
            src={`${USER_PROFILE_PIC_URL}/${comment.user.profilePic}`}
            placeholder="blur"
            blurDataURL={comment.user.profilePicBlurHash || 'no-hash'}
            className={`rounded-full ${comment.isRepliedComment ? 'w-6 h-6' : 'w-8 h-8'} cursor-pointer`}
          />
        </Link>
        <div
          className={`h-full w-[1px] bg-black dark:bg-dark_primary_btn rounded-lg ${
            clickedOnReply ? 'opacity-25' : 'opacity-5'
          } transition-ease-300`}
        ></div>
      </div>

      <div className="grow flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Link href={`/users/${comment.user.username}`} target="_blank" className="flex-center gap-1">
              <div className={`font-medium ${comment.isRepliedComment && 'text-sm'}`}>{comment.user.name}</div>
              <div className="text-xs font-medium text-gray-500">@{comment.user.username}</div>
            </Link>
          </div>
          {comment.userID == loggedInUser.id && (
            <Trash
              onClick={() => deleteComment(comment.id)}
              className="cursor-pointer mr-1 max-md:w-4 max-md:h-4 transition-all ease-in-out duration-200 hover:scale-110"
              size={18}
              weight="regular"
            />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="w-fit bg-primary_comp dark:bg-dark_primary_comp_hover px-4 py-2 max-md:px-2 max-md:py-1 text-sm max-md:text-xs rounded-xl max-md:rounded-lg">
            {renderContentWithLinks(comment.content, comment.taggedUsers)}
          </div>
          <LowerComment comment={comment} clickedOnReply={clickedOnReply} setClickedOnReply={setClickedOnReply} />
        </div>
      </div>
    </div>
  );
};

export default CommentComponent;
