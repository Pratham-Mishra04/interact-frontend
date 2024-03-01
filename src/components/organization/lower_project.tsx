import React, { useState, useEffect } from 'react';
import { Project, ProjectBookmark } from '@/types';
import deleteHandler from '@/handlers/delete_handler';
import getHandler from '@/handlers/get_handler';
import { useDispatch, useSelector } from 'react-redux';
import { setLikes, setProjectBookmarks, userSelector } from '@/slices/userSlice';
// import clickedOnSharePost from './clickedOnShare_project';
import BookmarkSimple from '@phosphor-icons/react/dist/icons/BookmarkSimple';
import Export from '@phosphor-icons/react/dist/icons/Export';
import ChatTeardrop from '@phosphor-icons/react/dist/icons/ChatTeardrop';
import Kanban from '@phosphor-icons/react/dist/icons/Kanban';
import ClockCounterClockwise from '@phosphor-icons/react/dist/icons/ClockCounterClockwise';
import BookmarkProject from '../../sections/lowers/bookmark_project';
import { BOOKMARK_URL, PROJECT_URL } from '@/config/routes';
import Semaphore from '@/utils/semaphore';
import { configSelector, setUpdateBookmark, setUpdatingLikes } from '@/slices/configSlice';
import { HeartStraight } from '@phosphor-icons/react';
import ShareProject from '@/sections/lowers/share_project';
import CommentProject from '@/sections/lowers/comment_project';
import socketService from '@/config/ws';
import Tasks from '@/sections/workspace/tasks';
import NewTask from '@/sections/tasks/new_task';
import History from '@/sections/workspace/history';
import checkOrgAccess from '@/utils/funcs/check_org_access';
import { ORG_SENIOR } from '@/config/constants';

interface Props {
  project: Project;
}

interface bookMarkStatus {
  isBookmarked: boolean;
  projectItemID: string;
  bookmarkID: string;
}

const LowerProject = ({ project }: Props) => {
  const [liked, setLiked] = useState(false);
  const [numLikes, setNumLikes] = useState(project.noLikes);
  const [numComments, setNumComments] = useState(project.noComments);
  const [numShares, setNumShares] = useState(project.noShares);
  const [bookmarkStatus, setBookmarkStatus] = useState<bookMarkStatus>({
    isBookmarked: false,
    projectItemID: '',
    bookmarkID: '',
  });
  const [clickedOnComment, setClickedOnComment] = useState(false);
  const [clickedOnShare, setClickedOnShare] = useState(false);
  const [clickedOnBookmark, setClickedOnBookmark] = useState(false);
  const [clickedOnTasks, setClickedOnTasks] = useState(false);
  const [clickedOnNewTask, setClickedOnNewTask] = useState(false);
  const [clickedOnHistory, setClickedOnHistory] = useState(false);
  const [mutex, setMutex] = useState(false);

  const user = useSelector(userSelector);
  const likes = user.likes;
  const bookmarks = user.projectBookmarks || [];

  const dispatch = useDispatch();

  const updatingLikes = useSelector(configSelector).updatingLikes;

  const semaphore = new Semaphore(updatingLikes, setUpdatingLikes);

  const setBookmark = (isBookmarked: boolean, projectItemID: string, bookmarkID: string) => {
    setBookmarkStatus({
      isBookmarked,
      projectItemID,
      bookmarkID,
    });
  };

  function removePostItemFromBookmark(
    bookmarks: ProjectBookmark[],
    bookmarkId: string,
    projectItemId: string
  ): ProjectBookmark[] {
    const updatedBookmarks = bookmarks.map(bookmark => {
      if (bookmark.id === bookmarkId) {
        const updatedPostItems = bookmark.projectItems.filter(item => item.id !== projectItemId);
        return { ...bookmark, projectItems: updatedPostItems };
      }
      return bookmark;
    });

    return updatedBookmarks;
  }

  useEffect(() => {
    if (likes.includes(project.id)) setLiked(true);
    bookmarks.forEach(bookmarksObj => {
      if (bookmarksObj.projectItems)
        bookmarksObj.projectItems.forEach(projectItem => {
          if (projectItem.projectID == project.id) setBookmark(true, projectItem.id, bookmarksObj.id);
        });
    });
  }, []);

  const likeHandler = async () => {
    await semaphore.acquire();

    if (liked) setNumLikes(prev => prev - 1);
    else setNumLikes(prev => prev + 1);

    setLiked(prev => !prev);

    const URL = `${PROJECT_URL}/like/${project.id}`;
    const res = await getHandler(URL);

    if (res.statusCode === 200) {
      const newLikes: string[] = [...likes];
      if (liked) {
        newLikes.splice(newLikes.indexOf(project.id), 1);
      } else {
        newLikes.push(project.id);
        if (project.userID != user.id)
          socketService.sendNotification(project.userID, `${user.name} liked your project!`);
      }
      dispatch(setLikes(newLikes));
    } else {
      if (liked) setNumLikes(prev => prev + 1);
      else setNumLikes(prev => prev - 1);
      setLiked(prev => !prev);
    }

    semaphore.release();
  };

  const removeBookmarkItemHandler = async () => {
    if (mutex) return;
    setMutex(true);
    setBookmark(false, bookmarkStatus.projectItemID, bookmarkStatus.bookmarkID);

    const URL = `${BOOKMARK_URL}/project/item/${bookmarkStatus.projectItemID}`;
    const res = await deleteHandler(URL);
    if (res.statusCode === 204) {
      const updatedBookmarks = removePostItemFromBookmark(
        bookmarks,
        bookmarkStatus.bookmarkID,
        bookmarkStatus.projectItemID
      );
      dispatch(setProjectBookmarks(updatedBookmarks));
      setBookmark(false, '', '');
      dispatch(setUpdateBookmark(true));
    } else {
      setBookmark(true, bookmarkStatus.projectItemID, bookmarkStatus.bookmarkID);
    }
    setMutex(false);
  };

  return (
    <>
      {clickedOnTasks ? (
        <Tasks
          setShow={setClickedOnTasks}
          setClickedOnNewTask={setClickedOnNewTask}
          project={project}
          org={checkOrgAccess(ORG_SENIOR)}
        />
      ) : (
        <></>
      )}
      {clickedOnNewTask ? (
        <NewTask setShow={setClickedOnNewTask} setShowTasks={setClickedOnTasks} project={project} />
      ) : (
        <></>
      )}

      {clickedOnBookmark ? (
        <BookmarkProject setShow={setClickedOnBookmark} project={project} setBookmark={setBookmark} />
      ) : (
        <></>
      )}
      {clickedOnComment ? (
        <CommentProject
          setShow={setClickedOnComment}
          project={project}
          numComments={numComments}
          setNoComments={setNumComments}
        />
      ) : (
        <></>
      )}
      {clickedOnShare ? (
        <ShareProject setShow={setClickedOnShare} project={project} setNoShares={setNumShares} />
      ) : (
        <></>
      )}
      {clickedOnHistory ? <History setShow={setClickedOnHistory} projectID={project.id} org={true} /> : <></>}

      <div className="flex flex-col gap-8 max-lg:gap-3 max-lg:p-0 max-lg:flex-row">
        {checkOrgAccess(ORG_SENIOR) || user.memberProjects.includes(project.id) ? (
          <Kanban
            className="cursor-pointer hover:bg-[#ababab3e] max-lg:hover:bg-transparent p-2 max-lg:p-0 transition-ease-300 rounded-full max-lg:w-6 max-lg:h-6"
            onClick={() => setClickedOnTasks(true)}
            size={48}
            weight="regular"
          />
        ) : (
          <></>
        )}

        <ClockCounterClockwise
          className="cursor-pointer hover:bg-[#ababab3e] max-lg:hover:bg-transparent p-2 max-lg:p-0 transition-ease-300 rounded-full max-lg:w-6 max-lg:h-6"
          onClick={() => setClickedOnHistory(true)}
          size={48}
          weight="regular"
        />
        <div className="h-[1px] w-full bg-black max-lg:hidden"></div>
        <div className="flex-center flex-col">
          <HeartStraight
            onClick={likeHandler}
            className="cursor-pointer rounded-full max-lg:w-6 max-lg:h-6"
            size={32}
            weight={liked ? 'fill' : 'regular'}
            fill={liked ? '#fe251b' : '#000000'}
          />
          {/* <div className="text-xs">{numLikes}</div> */}
        </div>
        <div className="flex-center flex-col">
          <Export
            onClick={() => setClickedOnShare(true)}
            className="cursor-pointer rounded-full max-lg:w-6 max-lg:h-6"
            size={32}
            weight="regular"
          />
          {/* <div className="text-xs">{numShares}</div> */}
        </div>
        <div className="flex-center flex-col">
          <ChatTeardrop
            onClick={() => setClickedOnComment(true)}
            className="cursor-pointer rounded-full max-lg:w-6 max-lg:h-6"
            size={32}
          />
          {/* <div className="text-xs">{numComments}</div> */}
        </div>
        <BookmarkSimple
          className="cursor-pointer p-2 max-lg:p-0 rounded-full max-lg:w-6 max-lg:h-6"
          onClick={() => {
            if (bookmarkStatus.isBookmarked) removeBookmarkItemHandler();
            else setClickedOnBookmark(prev => !prev);
          }}
          size={48}
          weight={bookmarkStatus.isBookmarked ? 'fill' : 'light'}
          fill={bookmarkStatus.isBookmarked ? '#478EE1' : '#000000'}
        />
      </div>
    </>
  );
};

export default LowerProject;
