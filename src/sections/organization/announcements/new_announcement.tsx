import { SERVER_ERROR } from '@/config/errors';
import { EXPLORE_URL, ORG_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import postHandler from '@/handlers/post_handler';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { userSelector } from '@/slices/userSlice';
import { useSelector } from 'react-redux';
import NewPostHelper from '@/components/home/new_post_helper';
import { Announcement, Post, User } from '@/types';
import { useWindowWidth } from '@react-hook/window-size';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import getHandler from '@/handlers/get_handler';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setAnnouncements?: React.Dispatch<React.SetStateAction<Announcement[]>>;
}

const NewAnnouncement = ({ setShow, setAnnouncements }: Props) => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [isOpen, setIsOpen] = useState(true);
  const [showTipsModal, setShowTipsModal] = useState<boolean>(false);
  const [taggedUsernames, setTaggedUsernames] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  let profilePic = useSelector(userSelector).profilePic;
  let name = useSelector(userSelector).name;
  let username = useSelector(userSelector).username;

  useEffect(() => {
    document.documentElement.style.overflowY = 'hidden';
    document.documentElement.style.height = '100vh';

    profilePic = profilePic == '' ? 'default.jpg' : profilePic;
    name = name == '' ? 'Interact User' : name;
    username = username == '' ? 'interactUser' : username;

    return () => {
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.height = 'auto';
    };
  }, []);

  const fetchUsers = async (search: string) => {
    const URL = `${EXPLORE_URL}/users/trending?search=${search}&limit=${10}`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      setUsers(res.data.users || []);
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
    if (title.trim() == '') {
      Toaster.error('Title cannot be empty!');
      return;
    }
    if (content.trim() == '' || content.replace(/\n/g, '').length == 0) {
      Toaster.error('Caption cannot be empty!');
      return;
    }

    const toaster = Toaster.startLoad('Adding your Post..');

    const formData = {
      title,
      content: content.replace(/\n{3,}/g, '\n\n'),
      isOpen,
      taggedUsernames,
    };

    const URL = `${ORG_URL}/${currentOrgID}/announcements`;

    const res = await postHandler(URL, formData);

    if (res.statusCode === 201) {
      setContent('');
      setShow(false);
      if (setAnnouncements) setAnnouncements(prev => [res.data.announcement, ...prev]);
      Toaster.stopLoad(toaster, 'Announcement Added!', 1);
      setShow(false);
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
      <div className="fixed top-24 max-md:top-[calc(50%-75px)] w-[953px] max-lg:w-5/6 h-[560px] max-md:h-2/3 shadow-2xl dark:shadow-none backdrop-blur-xl bg-[#ffffff] dark:bg-[#ffe1fc22] flex flex-col gap-8 justify-between max-md:items-end p-8 max-md:p-6 dark:text-white font-primary overflow-y-auto border-[1px] border-primary_btn  dark:border-dark_primary_btn rounded-lg right-1/2 translate-x-1/2 max-md:-translate-y-1/2 animate-fade_third z-30">
        <div className="flex gap-4 max-md:w-full">
          <Image
            crossOrigin="anonymous"
            className="w-16 h-16 rounded-full"
            width={50}
            height={50}
            alt="user"
            src={`${USER_PROFILE_PIC_URL}/${profilePic}`}
          />
          <div className="grow flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <div className="text-2xl font-semibold">{name}</div>
                <div className="text-sm">@{username}</div>
              </div>
              <div
                onClick={handleSubmit}
                className="max-md:hidden w-[120px] h-[48px] bg-primary_comp dark:bg-dark_primary_comp hover:bg-primary_comp_hover dark:hover:bg-dark_primary_comp_hover active:bg-primary_comp_active dark:active:bg-dark_primary_comp_active transition-ease-300 shrink-0 flex-center text-lg font-semibold rounded-lg cursor-pointer"
              >
                Post
              </div>
            </div>

            <div className="w-full flex flex-col gap-4 relative">
              <div className="w-full flex gap-4">
                <NewPostHelper setShow={setShowTipsModal} show={showTipsModal} announcement={true} />
              </div>
              <input
                type="text"
                value={title}
                maxLength={50}
                onChange={el => setTitle(el.target.value)}
                className="w-full text-lg font-medium border-[2px] border-dashed p-2 rounded-lg focus:outline-none"
                placeholder="Announcement Title"
              />
              <textarea
                id="textarea_id"
                className="w-full border-[2px] border-dashed p-2 rounded-lg dark:text-white dark:bg-dark_primary_comp focus:outline-none min-h-[16rem] max-h-64 max-md:w-full"
                value={content}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                maxLength={1000}
                placeholder="What's the announcement?"
              ></textarea>
              <div className="w-fit flex-center gap-4">
                <label className="w-fit flex cursor-pointer select-none items-center text-sm gap-2">
                  <div className="font-semibold">Open for All</div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isOpen}
                      onChange={() => setIsOpen(prev => !prev)}
                      className="sr-only"
                    />
                    <div
                      className={`box block h-6 w-10 rounded-full ${
                        isOpen ? 'bg-blue-300' : 'bg-black'
                      } transition-ease-300`}
                    ></div>
                    <div
                      className={`absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white transition ${
                        isOpen ? 'translate-x-full' : ''
                      }`}
                    ></div>
                  </div>
                </label>
                <div className="text-sm font-medium text-gray-500">
                  (
                  {isOpen
                    ? 'Will be shown in the feed of your Followers'
                    : 'Will be shown in the feed of your Members Only'}
                  )
                </div>
              </div>
            </div>
          </div>
        </div>

        {showUsers && users.length > 0 && (
          <div className="w-full pl-16 flex flex-wrap justify-center gap-4">
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
        className="bg-backdrop w-screen h-screen fixed top-0 left-0 animate-fade_third z-20"
      ></div>
    </>
  );
};

export default NewAnnouncement;
