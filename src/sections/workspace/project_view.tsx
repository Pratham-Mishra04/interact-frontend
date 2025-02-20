import { SERVER_ERROR } from '@/config/errors';
import { MEMBERSHIP_URL, ORG_URL, PROJECT_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { Project } from '@/types';
import { initialProject } from '@/types/initials';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Buildings, CaretLeft, CaretRight, X } from '@phosphor-icons/react';
import ProjectViewLoader from '@/components/loaders/workspace_project_view';
import { useRouter } from 'next/router';
import Collaborators from '@/components/explore/collaborators';
import { useDispatch, useSelector } from 'react-redux';
import {
  setEditorProjects,
  setManagerProjects,
  setMemberProjects,
  setOwnerProjects,
  userSelector,
} from '@/slices/userSlice';
import EditProject from './edit_project';
import Links from '@/components/explore/show_links';
import deleteHandler from '@/handlers/delete_handler';
import { useSwipeable } from 'react-swipeable';
import ConfirmDelete from '@/components/common/confirm_delete';
import ConfirmOTP from '@/components/common/confirm_otp';
import renderContentWithLinks from '@/utils/funcs/render_content_with_links';
import Tags from '@/components/common/tags';
import { checkOrgProjectAccess, checkParticularOrgAccess, checkProjectAccess } from '@/utils/funcs/access';
import { ORG_MANAGER, ORG_SENIOR, PROJECT_EDITOR, PROJECT_MEMBER, PROJECT_OWNER } from '@/config/constants';
import { orgSelector } from '@/slices/orgSlice';
import { getProjectPicHash, getProjectPicURL } from '@/utils/funcs/safe_extract';
import Editor from '@/components/editor';

interface Props {
  projectSlugs: string[];
  clickedProjectIndex: number;
  clickedProject: Project;
  setClickedProjectIndex: React.Dispatch<React.SetStateAction<number>>;
  setClickedOnProject: React.Dispatch<React.SetStateAction<boolean>>;
  fadeIn: boolean;
  setFadeIn: React.Dispatch<React.SetStateAction<boolean>>;
  setProjects?: React.Dispatch<React.SetStateAction<Project[]>>;
}

const ProjectView = ({
  projectSlugs,
  clickedProjectIndex,
  clickedProject,
  setClickedProjectIndex,
  setClickedOnProject,
  fadeIn,
  setFadeIn,
  setProjects,
}: Props) => {
  const [project, setProject] = useState<Project>(initialProject);
  const [loading, setLoading] = useState(true);

  const [clickedOnReadMore, setClickedOnReadMore] = useState(false);
  const [clickedOnLeave, setClickedOnLeave] = useState(false);
  const [clickedOnDelete, setClickedOnDelete] = useState(false);

  const [clickedOnConfirmDelete, setClickedOnConfirmDelete] = useState(false);

  const router = useRouter();

  const user = useSelector(userSelector);

  const dispatch = useDispatch();

  const fetchProject = async (abortController: AbortController) => {
    setLoading(true);
    let slug = '';
    try {
      slug = projectSlugs[clickedProjectIndex];
    } finally {
      let URL = checkProjectAccess(user, PROJECT_MEMBER, clickedProject.id, clickedProject)
        ? `${PROJECT_URL}/${slug}`
        : `${ORG_URL}/${clickedProject.organizationID}/projects/${slug}`;

      if (
        !clickedProject.organizationID ||
        !user.organizationMemberships?.map(m => m.organizationID).includes(clickedProject.organizationID)
      )
        URL = `${PROJECT_URL}/${slug}`;

      const res = await getHandler(URL, abortController.signal);
      if (res.statusCode == 200) {
        const projectData: Project = res.data.project;
        projectData.privateLinks = res.data.privateLinks;
        setProject(projectData);
        setLoading(false);
      } else {
        if (res.status != -1) {
          if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
          else Toaster.error(SERVER_ERROR, 'error_toaster');
        }
      }
    }
  };

  const handleLeaveProject = async () => {
    const toaster = Toaster.startLoad('Leaving this project...');

    const URL = `${MEMBERSHIP_URL}/project/${project.id}`;

    const res = await deleteHandler(URL);

    if (res.statusCode === 204) {
      if (setProjects) setProjects(prev => prev.filter(p => p.id != project.id));
      setClickedProjectIndex(-1);
      const { query } = router;
      if (router.pathname == '/workspace') {
        delete query.project;

        router.replace({
          pathname: router.pathname,
          query: { ...query },
        });
      }
      setClickedOnLeave(false);
      setClickedOnProject(false);
      Toaster.stopLoad(toaster, 'Left the Project', 1);
    } else {
      Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  const org = useSelector(orgSelector);

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

  const handleDelete = async (otp: string) => {
    const toaster = Toaster.startLoad('Deleting your project...');

    const URL = checkParticularOrgAccess(ORG_MANAGER, project.organization)
      ? `${ORG_URL}/${project.organizationID}/projects/${project.id}`
      : `${PROJECT_URL}/${project.id}`;

    const res = await deleteHandler(URL, { otp });

    if (res.statusCode === 204) {
      if (setProjects) setProjects(prev => prev.filter(p => p.id != project.id));

      dispatch(setOwnerProjects(user.ownerProjects.filter(projectID => projectID != project.id)));
      if (checkParticularOrgAccess(ORG_MANAGER, project.organization)) {
        dispatch(setManagerProjects(user.managerProjects.filter(projectID => projectID != project.id)));
        dispatch(setEditorProjects(user.editorProjects.filter(projectID => projectID != project.id)));
        dispatch(setMemberProjects(user.memberProjects.filter(projectID => projectID != project.id)));
      }

      setClickedOnConfirmDelete(false);
      setClickedOnProject(false);
      Toaster.stopLoad(toaster, 'Project Deleted', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchProject(abortController);
  }, [clickedProjectIndex]);

  const handleClickPrev = () => {
    if (clickedProjectIndex != 0) {
      setClickedProjectIndex(prev => prev - 1);
      setFadeIn(false);
    }
  };

  const handleClickNext = () => {
    if (clickedProjectIndex != projectSlugs.length - 1) {
      setClickedProjectIndex(prev => prev + 1);
      setFadeIn(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      setClickedProjectIndex(prev => prev - 1);
      setFadeIn(false);
    } else if (event.key === 'ArrowRight') {
      setClickedProjectIndex(prev => prev + 1);
      setFadeIn(false);
    } else if (event.key === 'Escape') {
      setClickedOnProject(false);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const swipeHandler = useSwipeable({
    onSwipedRight: handleClickPrev,
    onSwipedLeft: handleClickNext,
  });

  return (
    <>
      {loading ? (
        <ProjectViewLoader fadeIn={fadeIn} setClickedOnProject={setClickedOnProject} />
      ) : (
        <div
          {...swipeHandler}
          className="w-screen h-screen dark:text-white font-primary fixed top-0 left-0 z-50 flex dark:bg-backdrop backdrop-blur-2xl"
        >
          {/* {clickedOnEdit && (
            <EditProject
              projectToEdit={project}
              setShow={setClickedOnEdit}
              setProjects={setProjects}
              setProjectToEdit={setProject}
            />
          )} */}
          {clickedOnLeave && (
            <ConfirmDelete setShow={setClickedOnLeave} handleDelete={handleLeaveProject} title="Confirm Leave?" />
          )}
          {clickedOnDelete && <ConfirmDelete setShow={setClickedOnDelete} handleDelete={sendOTP} />}
          {clickedOnConfirmDelete && <ConfirmOTP setShow={setClickedOnConfirmDelete} handleSubmit={handleDelete} />}
          <div className="max-lg:hidden w-16 h-screen flex flex-col items-center py-3 justify-between max-lg:fixed max-lg:top-0 max-lg:left-0">
            <div className="w-10 h-10 relative">
              <Image
                crossOrigin="anonymous"
                width={50}
                height={50}
                alt={'User Pic'}
                src={`${USER_PROFILE_PIC_URL}/${project.user.profilePic}`}
                className={'w-10 h-10 rounded-full cursor-default absolute top-0 left-0 z-10'}
              />
            </div>
            {clickedProjectIndex != 0 && (
              <div
                onClick={handleClickPrev}
                className="w-10 h-10 rounded-full flex-center dark:bg-dark_primary_comp_hover cursor-pointer shadow-xl"
              >
                <CaretLeft size={24} weight="bold" />
              </div>
            )}
          </div>
          <div className="w-[calc(100vw-128px)] max-lg:w-screen h-screen overflow-hidden pt-3">
            <div className="w-full h-14 flex justify-between max-lg:px-3">
              <div className="grow flex gap-2 max-lg:gap-4">
                <Image
                  crossOrigin="anonymous"
                  width={50}
                  height={50}
                  alt={'User Pic'}
                  src={`${USER_PROFILE_PIC_URL}/${project.user.profilePic}`}
                  className={'lg:hidden w-10 h-10 rounded-full cursor-default'}
                />
                <div>
                  <div className="w-fit font-bold cursor-default line-clamp-1">{project.title}</div>
                  <div // convert to link
                    className="w-fit flex gap-1 text-xs font-medium"
                  >
                    <div
                      onClick={() =>
                        router.push(
                          `/${project.user.isOrganization ? 'organisations' : 'users'}/${project.user.username}`
                        )
                      }
                      className="cursor-pointer hover-underline-animation after:bg-black dark:after:bg-white"
                    >
                      {project.user.name}
                    </div>
                    {project.user.isOrganization ? (
                      <Buildings />
                    ) : (
                      project.memberships?.length > 0 && (
                        <div className="flex-center">+ {project.memberships.length} others</div>
                      )
                    )}
                  </div>
                </div>
              </div>
              <div
                onClick={() => setClickedOnProject(false)}
                className="lg:hidden w-10 h-10 rounded-full flex-center dark:bg-dark_primary_comp_hover cursor-pointer"
              >
                <X size={24} weight="bold" />
              </div>
            </div>
            <div className="w-full h-[calc(100vh-56px)] max-lg:overflow-y-auto shadow-xl flex max-lg:flex-col">
              <Image
                priority={true}
                crossOrigin="anonymous"
                className="w-[calc(100vh-56px)] max-lg:w-full h-full max-lg:h-96 rounded-tl-md max-lg:rounded-none object-cover"
                src={getProjectPicURL(project)}
                alt="Project Cover"
                width={10000}
                height={10000}
                placeholder="blur"
                blurDataURL={getProjectPicHash(project)}
              />

              <div className="w-[calc(100vw-128px-(100vh-56px))] lg:h-full lg:overflow-y-auto max-lg:w-full border-gray-300 border-t-[1px] border-r-[1px] dark:border-0 p-4 bg-white dark:bg-dark_primary_comp_hover flex flex-col lg:justify-between gap-6 z-10">
                <div className="w-full h-fit flex flex-col gap-6">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div className="font-bold text-3xl text-gradient">{project.title}</div>
                    <div className="lg:hidden w-fit">{/* <LowerWorkspaceProject project={project} /> */}</div>
                  </div>
                  <div className="font-semibold text-lg">{project.tagline}</div>

                  <div className="text-sm whitespace-pre-wrap">
                    <Editor editable={false} content={project.description} truncate maxHeight={120} />
                  </div>
                  {project.tags && <Tags tags={project.tags} displayAll={true} />}
                  <Collaborators memberships={project.memberships} workspace={true} />
                  <Links links={project.links} title="Public Links" />
                  <Links links={project.privateLinks} title="Private Links" />
                </div>

                <div className="w-full mx-auto flex flex-col gap-2 pb-4">
                  {/* <EditProjectImages project={project} setProjects={setProjects} setProject={setProject} /> */}
                  {checkOrgProjectAccess(
                    { user, organization: org },
                    PROJECT_EDITOR,
                    project.id,
                    ORG_SENIOR,
                    project.organization,
                    !!(project.organizationID && project.organizationID != '')
                  ) && <EditProject project={project} setProjects={setProjects} setProject={setProject} />}
                  {checkOrgProjectAccess(
                    { user, organization: org },
                    PROJECT_OWNER,
                    project.id,
                    ORG_MANAGER,
                    project.organization,
                    !!(project.organizationID && project.organizationID != '')
                  ) ? (
                    <div
                      onClick={() => setClickedOnDelete(true)}
                      className="w-full text-lg font-medium py-2 flex-center border-[1px] border-primary_danger hover:text-white hover:bg-primary_danger rounded-lg cursor-pointer transition-ease-300"
                    >
                      Delete Project
                    </div>
                  ) : (
                    checkProjectAccess(user, PROJECT_MEMBER, project.id) && (
                      <div
                        onClick={() => setClickedOnLeave(true)}
                        className="w-full text-lg font-medium py-2 flex-center border-[1px] border-primary_danger hover:text-white hover:bg-primary_danger rounded-lg cursor-pointer transition-ease-300"
                      >
                        Leave Project
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="max-lg:hidden w-16 h-screen flex flex-col items-center justify-between py-3 max-lg:fixed max-lg:top-0 max-lg:right-0">
            <div
              onClick={() => setClickedOnProject(false)}
              className="w-10 h-10 rounded-full flex-center dark:bg-dark_primary_comp_hover cursor-pointer"
            >
              <X size={24} weight="bold" />
            </div>

            <div className="max-lg:hidden">{/* <LowerWorkspaceProject project={project} /> */}</div>

            {clickedProjectIndex != projectSlugs.length - 1 ? (
              <div
                onClick={handleClickNext}
                className="w-10 h-10 rounded-full flex-center dark:bg-dark_primary_comp_hover cursor-pointer shadow-xl"
              >
                <CaretRight size={24} weight="bold" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full"></div>
            )}
          </div>
          {clickedProjectIndex != 0 && (
            <div
              onClick={() => {
                setClickedProjectIndex(prev => prev - 1);
                setFadeIn(false);
              }}
              className="w-10 h-10 lg:hidden fixed bottom-3 left-3 rounded-full flex-center dark:bg-dark_primary_comp_hover cursor-pointer shadow-xl z-20"
            >
              <CaretLeft size={24} weight="bold" />
            </div>
          )}
          {clickedProjectIndex != projectSlugs.length - 1 && (
            <div
              onClick={() => {
                setClickedProjectIndex(prev => prev + 1);
                setFadeIn(false);
              }}
              className="w-10 h-10 lg:hidden fixed bottom-3 right-3 rounded-full flex-center dark:bg-dark_primary_comp_hover cursor-pointer shadow-xl z-20"
            >
              <CaretRight size={24} weight="bold" />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ProjectView;
