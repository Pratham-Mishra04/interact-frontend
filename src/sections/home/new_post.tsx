import { SERVER_ERROR } from '@/config/errors';
import { EXPLORE_URL, ORG_URL, POST_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import postHandler from '@/handlers/post_handler';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { userSelector } from '@/slices/userSlice';
import { useSelector } from 'react-redux';
import NewPostImages from '@/components/home/new_post_images';
import NewPostHelper from '@/components/home/new_post_helper';
import { Announcement, Poll, Post, User } from '@/types';
import { useWindowWidth } from '@react-hook/window-size';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import getHandler from '@/handlers/get_handler';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setFeed?: React.Dispatch<React.SetStateAction<any[]>>;
  org?: boolean;
}

const NewPost = ({ setShow, setFeed, org = false }: Props) => {
  const [content, setContent] = useState<string>('');
  const [images, setImages] = useState<File[]>([]);
  const [showTipsModal, setShowTipsModal] = useState<boolean>(false);
  const [taggedUsernames, setTaggedUsernames] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  const user = useSelector(userSelector);

  useEffect(() => {
    document.documentElement.style.overflowY = 'hidden';
    document.documentElement.style.height = '100vh';

    return () => {
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.height = 'auto';
    };
  }, []);

  const fetchUsers = async (search: string) => {
    const URL = `${EXPLORE_URL}/users/trending?search=${search}&limit=${10}`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      const userData: User[] = res.data.users || [];
      setUsers(org ? userData : userData.filter(u => u.id != user.id));
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  const handleContentChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value, selectionStart } = e.target;

    const cursorPos = selectionStart;
    setCursorPosition(cursorPos);

    setContent(value);

    const lastWord = value.substring(0, cursorPos).split(' ').pop();

    // Detect backspace key press
    if ((e.nativeEvent as InputEvent).inputType === 'deleteContentBackward') {
      // Check if the last word starts with "@" (indicating a tagged user)
      if (lastWord && lastWord.startsWith('@')) {
        const usernameToRemove = lastWord.substring(1); // Remove "@" symbol
        handleRemoveTag(usernameToRemove);
      }
    } else {
      if (lastWord && lastWord.startsWith('@')) {
        // Remove "@" symbol
        const usernameToSearch = lastWord.substring(1);

        await fetchUsers(usernameToSearch);
        setShowUsers(true);
      } else if (showUsers) {
        setShowUsers(false);
      }
    }
  };

  const handleTagUser = (username: string) => {
    if (!taggedUsernames.includes(username)) setTaggedUsernames(prevUsernames => [...prevUsernames, username]);

    if (cursorPosition !== null) {
      // Find the last "@" symbol before the current cursor position
      const lastAtIndex = content.lastIndexOf('@', cursorPosition - 1);

      if (lastAtIndex !== -1) {
        // Replace the part of the content with the selected username
        setContent(prevContent => {
          const contentBefore = prevContent.substring(0, lastAtIndex);
          const contentAfter = prevContent.substring(cursorPosition);
          return `${contentBefore}@${username} ${contentAfter}`;
        });
      }
    }

    setShowUsers(false);
  };

  const handleRemoveTag = (username: string) => {
    setTaggedUsernames(prevUsernames => prevUsernames.filter(u => u !== username));

    if (cursorPosition !== null) {
      // Find the last occurrence of `@username` before the current cursor position
      const lastAtIndex = content.lastIndexOf(`@${username}`, cursorPosition - 1);

      if (lastAtIndex !== -1) {
        // Replace the tagged username with an empty string in the content
        setContent(prevContent => {
          const contentBefore = prevContent.substring(0, lastAtIndex);
          const contentAfter = prevContent.substring(lastAtIndex + `@${username}`.length);
          return `${contentBefore}${contentAfter}`;
        });
      }
    }

    setShowUsers(false);
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
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
    setContent(newText);
    textarea.focus();
    textarea.setSelectionRange(start + prefix.length, end + prefix.length);
  };

  const currentOrgID = useSelector(currentOrgIDSelector);

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
    taggedUsernames.forEach(username => formData.append('taggedUsernames', username));
    const URL = org ? `${ORG_URL}/${currentOrgID}/posts` : POST_URL;

    const res = await postHandler(URL, formData, 'multipart/form-data');

    if (res.statusCode === 201) {
      setContent('');
      setImages([]);
      setShow(false);
      if (setFeed) setFeed(prev => [res.data.post, ...prev]);
      Toaster.stopLoad(toaster, 'Posted!', 1);
      setShow(false);
    } else if (res.statusCode == 413) {
      Toaster.stopLoad(toaster, 'Image/s too large', 0);
    } else {
      if (res.data.message) {
        Toaster.stopLoad(toaster, res.data.message, 0);
      } else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
  };

  const width = useWindowWidth();

  return (
    <>
      <div className="fixed top-24 max-md:top-[calc(50%-75px)] w-[953px] max-lg:w-5/6 h-[560px] max-md:h-2/3 shadow-2xl dark:shadow-none backdrop-blur-xl bg-[#ffffff] dark:bg-[#ffe1fc22] flex flex-col justify-between max-md:items-end p-8 max-md:p-6 dark:text-white font-primary overflow-y-auto border-[1px] border-primary_btn  dark:border-dark_primary_btn rounded-lg right-1/2 translate-x-1/2 max-md:-translate-y-1/2 animate-fade_third z-30">
        <div className="w-full flex flex-col gap-6">
          <div className="flex gap-4 max-md:w-full">
            <Image
              crossOrigin="anonymous"
              className="w-16 h-16 rounded-full"
              width={50}
              height={50}
              alt="user"
              src={`${USER_PROFILE_PIC_URL}/${user.profilePic || 'default.jpg'}`}
            />
            <div className="grow flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="text-2xl font-semibold">{user.name}</div>
                  <div className="text-sm">@{user.username}</div>
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
                  <div className="w-full flex gap-4">
                    <NewPostImages setSelectedFiles={setImages} />
                    {images.length == 0 && <NewPostHelper setShow={setShowTipsModal} show={showTipsModal} />}
                  </div>
                  <textarea
                    id="textarea_id"
                    className="w-full bg-transparent focus:outline-none min-h-[154px]"
                    value={content}
                    onChange={handleContentChange}
                    onKeyDown={handleKeyDown}
                    maxLength={2000}
                    placeholder="Start a conversation..."
                  ></textarea>
                </div>
              )}
            </div>
          </div>
          {width <= 640 && (
            <div className="md:hidden w-full flex flex-col gap-8 relative">
              <div className="w-full flex gap-4">
                <NewPostImages setSelectedFiles={setImages} />
                {images.length == 0 && <NewPostHelper setShow={setShowTipsModal} show={showTipsModal} />}
              </div>
              <textarea
                id="textarea_id"
                className="w-full bg-transparent focus:outline-none min-h-[154px]"
                value={content}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                maxLength={2000}
                placeholder="Start a conversation..."
              ></textarea>
            </div>
          )}
        </div>

        <div
          onClick={handleSubmit}
          className="md:hidden w-[120px] h-[48px] bg-primary_comp dark:bg-dark_primary_comp hover:bg-primary_comp_hover active:bg-primary_comp_active dark:hover:bg-dark_primary_comp_hover dark:active:bg-dark_primary_comp_active transition-ease-300 shrink-0 flex-center text-lg font-semibold rounded-lg cursor-pointer"
        >
          Post
        </div>
        {showUsers && users.length > 0 && (
          <div className="w-full flex flex-wrap justify-center gap-4">
            {users.map(user => (
              <div
                key={user.id}
                onClick={() => handleTagUser(user.username)}
                className="w-1/4 hover:scale-105 flex items-center gap-2 rounded-md border-[1px] border-primary_btn p-2 hover:bg-primary_comp cursor-pointer transition-ease-300"
              >
                <Image
                  crossOrigin="anonymous"
                  width={50}
                  height={50}
                  alt={'User Pic'}
                  src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
                  className="rounded-full w-12 h-12"
                />
                <div className="">
                  <div className="text-sm font-semibold line-clamp-1">{user.name}</div>
                  <div className="text-xs text-gray-500">@{user.username}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div
        onClick={() => setShow(false)}
        className="bg-backdrop w-screen h-screen backdrop-blur-sm fixed top-0 left-0 animate-fade_third z-20"
      ></div>
    </>
  );
};

export default NewPost;
