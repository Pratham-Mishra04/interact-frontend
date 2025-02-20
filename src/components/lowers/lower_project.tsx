import React, { useState, useEffect } from 'react';
import { Project, ProjectBookmark } from '@/types';
import deleteHandler from '@/handlers/delete_handler';
import getHandler from '@/handlers/get_handler';
import { useDispatch, useSelector } from 'react-redux';
import {
  setEditorProjects,
  setLikes,
  setManagerProjects,
  setMemberProjects,
  setOwnerProjects,
  setProjectBookmarks,
  userIDSelector,
  userSelector,
} from '@/slices/userSlice';
import { Backspace, BookmarkSimple, DotsThreeVertical, Export, X } from '@phosphor-icons/react';
import BookmarkProject from '../../sections/lowers/bookmark_project';
import { BOOKMARK_URL, MEMBERSHIP_URL, ORG_URL, PROJECT_URL } from '@/config/routes';
import Semaphore from '@/utils/semaphore';
import { configSelector, setUpdateBookmark, setUpdatingLikes } from '@/slices/configSlice';
import { HeartStraight, WarningCircle } from '@phosphor-icons/react';
import socketService from '@/config/ws';
import Report from '../common/report';
import Toaster from '@/utils/toaster';
import SignUp from '../common/signup_box';
import Share from '@/sections/lowers/share';
import ProjectCard from '../cards/project';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { checkOrgProjectAccess, checkParticularOrgAccess, checkProjectAccess } from '@/utils/funcs/access';
import { ORG_MANAGER, ORG_SENIOR, PROJECT_EDITOR, PROJECT_MEMBER, PROJECT_OWNER } from '@/config/constants';
import EditProject from '@/sections/workspace/edit_project';
import { SERVER_ERROR } from '@/config/errors';
import router from 'next/router';
import ConfirmDelete from '../common/confirm_delete';
import ConfirmOTP from '../common/confirm_otp';
import { orgSelector } from '@/slices/orgSlice';

interface Props {
  project: Project;
  setProject?: React.Dispatch<React.SetStateAction<Project>>;
}

interface bookMarkStatus {
  isBookmarked: boolean;
  projectItemID: string;
  bookmarkID: string;
}

const LowerProject = ({ project, setProject }: Props) => {
  const [liked, setLiked] = useState(false);
  const [numLikes, setNumLikes] = useState(project.noLikes);
  const [bookmarkStatus, setBookmarkStatus] = useState<bookMarkStatus>({
    isBookmarked: false,
    projectItemID: '',
    bookmarkID: '',
  });
  const [clickedOnShare, setClickedOnShare] = useState(false);
  const [clickedOnBookmark, setClickedOnBookmark] = useState(false);
  const [clickedOnReport, setClickedOnReport] = useState(false);
  const [mutex, setMutex] = useState(false);

  const [noUserClick, setNoUserClick] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [clickedOnLeave, setClickedOnLeave] = useState(false);
  const [clickedOnDelete, setClickedOnDelete] = useState(false);

  const [clickedOnConfirmDelete, setClickedOnConfirmDelete] = useState(false);

  const dispatch = useDispatch();

  const updatingLikes = useSelector(configSelector).updatingLikes;

  const semaphore = new Semaphore(updatingLikes, setUpdatingLikes);

  const userID = useSelector(userIDSelector) || '';
  const user = useSelector(userSelector);
  const org = useSelector(orgSelector);

  const likes = user.likes;
  const bookmarks = user.projectBookmarks || [];

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
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
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

  const sendOTP = async () => {
    const toaster = Toaster.startLoad('Sending OTP');

    const URL = checkParticularOrgAccess(ORG_MANAGER, project.organization)
      ? `${ORG_URL}/${project.organizationID}/projects/delete/${project.id}`
      : `${PROJECT_URL}/delete/${project.id}`;

    const res = await getHandler(URL);

    if (res.statusCode === 200) {
      Toaster.stopLoad(toaster, 'OTP Sent to your registered mail', 1);
      setClickedOnDelete(false);
      setClickedOnConfirmDelete(true);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  const handleLeaveProject = async () => {
    const toaster = Toaster.startLoad('Leaving this project...');

    const URL = `${MEMBERSHIP_URL}/project/${project.id}`;
    const res = await deleteHandler(URL);

    if (res.statusCode === 204) {
      Toaster.stopLoad(toaster, 'Left the Project, reloading in 5 seconds...', 1);

      dispatch(setManagerProjects(user.managerProjects.filter(projectID => projectID != project.id)));
      dispatch(setEditorProjects(user.editorProjects.filter(projectID => projectID != project.id)));
      dispatch(setMemberProjects(user.memberProjects.filter(projectID => projectID != project.id)));

      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } else {
      Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  const handleDelete = async (otp: string) => {
    const toaster = Toaster.startLoad('Deleting your project...');

    const URL = checkParticularOrgAccess(ORG_MANAGER, project.organization)
      ? `${ORG_URL}/${project.organizationID}/projects/${project.id}`
      : `${PROJECT_URL}/${project.id}`;

    const res = await deleteHandler(URL, { otp });

    if (res.statusCode === 204) {
      Toaster.stopLoad(toaster, 'Project Deleted, redirecting in 5 seconds...', 1);

      dispatch(setOwnerProjects(user.ownerProjects.filter(projectID => projectID != project.id)));
      if (checkParticularOrgAccess(ORG_MANAGER, project.organization)) {
        dispatch(setManagerProjects(user.managerProjects.filter(projectID => projectID != project.id)));
        dispatch(setEditorProjects(user.editorProjects.filter(projectID => projectID != project.id)));
        dispatch(setMemberProjects(user.memberProjects.filter(projectID => projectID != project.id)));
      }

      setTimeout(() => {
        window.location.assign('/projects');
      }, 5000);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  return (
    <>
      {noUserClick && <SignUp setShow={setNoUserClick} />}
      {clickedOnShare && (
        <Share
          itemID={project.id}
          itemType="project"
          setShow={setClickedOnShare}
          clipboardURL={`/projects/${project.slug}&action=external`}
          item={<ProjectCard project={project} />}
        />
      )}
      {clickedOnReport && <Report projectID={project.id} setShow={setClickedOnReport} />}
      {clickedOnLeave && (
        <ConfirmDelete setShow={setClickedOnLeave} handleDelete={handleLeaveProject} title="Confirm Leave?" />
      )}
      {clickedOnDelete && <ConfirmDelete setShow={setClickedOnDelete} handleDelete={sendOTP} />}
      {clickedOnConfirmDelete && <ConfirmOTP setShow={setClickedOnConfirmDelete} handleSubmit={handleDelete} />}
      <div className="flex-center gap-6">
        <div className="flex-center gap-2">
          <HeartStraight
            onClick={() => {
              if (userID == '') setNoUserClick(true);
              else likeHandler();
            }}
            className={`cursor-pointer max-md:w-6 max-md:h-6 ${
              liked ? 'text-heart_filled' : 'text-black opacity-60 dark:text-white dark:opacity-100'
            } transition-ease-300`}
            size={28}
            weight={liked ? 'fill' : 'regular'}
          />
          <div className=""> {numLikes}</div>
        </div>
        <BookmarkSimple
          className={`cursor-pointer max-md:w-6 max-md:h-6 opacity-60 ${
            bookmarkStatus.isBookmarked ? 'text-[#7cb9ff]' : 'text-black opacity-60 dark:text-white dark:opacity-100'
          } transition-ease-300`}
          onClick={() => {
            if (userID == '') setNoUserClick(true);
            else {
              if (bookmarkStatus.isBookmarked) removeBookmarkItemHandler();
              else setClickedOnBookmark(prev => !prev);
            }
          }}
          size={28}
          weight={bookmarkStatus.isBookmarked ? 'fill' : 'light'}
        />
        <Popover open={isDialogOpen} onOpenChange={val => setIsDialogOpen(val)}>
          <PopoverTrigger>
            <DotsThreeVertical className="cursor-pointer max-lg:w-6 max-lg:h-6" size={28} weight="bold" />
          </PopoverTrigger>
          <PopoverContent className="flex flex-col gap-2 text-sm w-48 p-3" align="end">
            {checkOrgProjectAccess(
              { user, organization: org },
              PROJECT_EDITOR,
              project.id,
              ORG_SENIOR,
              project.organization,
              !!(project.organizationID && project.organizationID != '')
            ) && <EditProject project={project} setProject={setProject} />}
            <div
              onClick={() => {
                if (userID == '') setNoUserClick(true);
                else setClickedOnShare(true);
                setIsDialogOpen(false);
              }}
              className="w-full p-2 flex items-center gap-2 hover:bg-primary_comp dark:hover:bg-dark_primary_comp_hover rounded-lg cursor-pointer transition-ease-300"
            >
              <Export className="cursor-pointer max-lg:w-6 max-lg:h-6" size={20} weight="regular" />
              Share
            </div>
            {checkProjectAccess(user, PROJECT_MEMBER, project.id) &&
            !checkProjectAccess(user, PROJECT_OWNER, project.id) ? (
              <div
                onClick={() => {
                  setClickedOnLeave(true);
                  setIsDialogOpen(false);
                }}
                className="w-full p-2 flex items-center gap-2 hover:bg-primary_comp hover:text-primary_danger dark:hover:bg-dark_primary_comp_hover rounded-lg cursor-pointer transition-ease-300"
              >
                <Backspace className="cursor-pointer max-lg:w-6 max-lg:h-6" size={20} />
                Leave
              </div>
            ) : (
              <div
                onClick={() => {
                  if (userID == '') setNoUserClick(true);
                  else setClickedOnReport(true);
                  setIsDialogOpen(false);
                }}
                className="w-full p-2 flex items-center gap-2 hover:bg-primary_comp hover:text-primary_danger dark:hover:bg-dark_primary_comp_hover rounded-lg cursor-pointer transition-ease-300"
              >
                <WarningCircle className="cursor-pointer max-lg:w-6 max-lg:h-6" size={20} /> Report
              </div>
            )}
            {checkOrgProjectAccess(
              { user, organization: org },
              PROJECT_OWNER,
              project.id,
              ORG_MANAGER,
              project.organization,
              !!(project.organizationID && project.organizationID != '')
            ) && (
              <div
                onClick={() => {
                  setClickedOnDelete(true);
                  setIsDialogOpen(false);
                }}
                className="w-full p-2 flex items-center gap-2 hover:bg-primary_comp hover:text-primary_danger dark:hover:bg-dark_primary_comp_hover rounded-lg cursor-pointer transition-ease-300"
              >
                <X className="cursor-pointer max-lg:w-6 max-lg:h-6" size={20} />
                Delete
              </div>
            )}
          </PopoverContent>
        </Popover>
        <BookmarkProject
          show={clickedOnBookmark}
          setShow={setClickedOnBookmark}
          project={project}
          setBookmark={setBookmark}
        />
      </div>
    </>
  );
};

export default LowerProject;
