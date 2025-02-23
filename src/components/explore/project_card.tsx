import React, { ReactNode } from 'react';
import { Project } from '@/types';
import { BookBookmark, Eye, EyeSlash, HeartStraight, Warning } from '@phosphor-icons/react';
import Link from 'next/link';
import UserHoverCard from './user_hover_card';
import ProjectCardCarousel from './project_card_carousel';
import TooltipIcon from '../common/tooltip_icon';
import Image from 'next/image';
import { USER_PROFILE_PIC_URL } from '@/config/routes';
import BookmarkComponent from '../bookmarks/bookmark';
import { Bookmark } from 'lucide-react';
import moment from 'moment';
import Tags from '../common/tags';
interface Props {
  index?: number;
  project: Project;
  setClickedProject?: React.Dispatch<React.SetStateAction<Project | null>>;
  isLink?: boolean;
  smaller?: boolean;
}

const ProjectCard = ({ project, setClickedProject, isLink = false, smaller = false }: Props) => {
  const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) =>
    isLink ? (
      <Link
        href={`/projects/${project.slug}`}
        className={`w-full flex items-center ${
          smaller ? 'gap-2' : 'gap-4'
        } hover:bg-primary_comp_hover dark:hover:bg-dark_primary_comp_active rounded-[12px]  transition-ease-out-500 animate-fade_third`}
      >
        {children}
      </Link>
    ) : (
      <div
        onClick={() => {
          if (setClickedProject) setClickedProject(project);
        }}
        className={`w-full flex items-center ${
          smaller ? 'gap-2' : 'gap-4'
        } hover:bg-primary_comp_hover dark:hover:bg-dark_primary_comp_hover rounded-[12px] cursor-pointer transition-ease-out-500 animate-fade_third`}
      >
        {children}
      </div>
    );
  function formatDate(date: Date) {
    return moment(date).format('DD MMM, YYYY');
  }

  return (
    <Wrapper>
      <div
        className={`border-[#404040] dark:border-[#525252] ${
          !smaller ? 'p-3' : ''
        } border-[1px] p-2 rounded-[12px] flex flex-col w-full`}
      >
        {/* <div className="flex justify-end text-sm pr-2 pt-1">{formatDate(new Date(project.createdAt))}</div> */}
        <div className="flex flex-col">
          {!smaller ? (
            <div className="flex justify-end text-sm h-[2px]">{formatDate(new Date(project.createdAt))}</div>
          ) : (
            <div className="flex justify-end text-xs h-[4px]">{moment(new Date(project.createdAt)).fromNow()}</div>
          )}
          <div className={`flex flex-row space-x-4 ${!smaller ? 'mb-4' : ''} items-center`}>
            <ProjectCardCarousel project={project} width="1/4" />
            <div className="w-3/4 flex  justify-between gap-4 dark:text-white">
              <div className="grow ">
                <div className={`${!smaller && 'text-xl'} max-md:text-base font-medium line-clamp-1`}>
                  {!smaller ? project.title : project.title.slice(0, 27) + (project.title.length > 25 ? '...' : '')}
                </div>
                <div className="text-md max-md:text-xs line-clamp-1 text-[#727272]">
                  {!smaller
                    ? project.tagline
                    : project.tagline.slice(0, 30) + (project.tagline.length > 25 ? '...' : '')}
                </div>
                {!smaller && (
                  // <div className="w-full flex gap-1 mt-2 max-md:mt-1 text-xs line-clamp-1">
                  //   By{' '}
                  //   <UserHoverCard
                  //     trigger={<div className="hover:underline underline-offset-2">{project.user.name}</div>}
                  //     user={project.user}
                  //   />
                  // </div>
                  <div className="w-full flex flex-row space-x-2 items-center mt-1">
                    <Image
                      width={20}
                      height={20}
                      alt={'User Pic'}
                      src={`${USER_PROFILE_PIC_URL}/${project.user.profilePic}`}
                      className={'rounded-full w-8 h-8'}
                    />
                    <div>{project.user.name}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {!smaller &&
            (project.isFlagged ? (
              <TooltipIcon
                label="This Project is Flagged!."
                icon={<Warning size={20} />}
                excludeHoverEffect
                className="text-primary_danger"
              />
            ) : project.isPrivate ? (
              <TooltipIcon label="This project is private." icon={<EyeSlash size={20} />} excludeHoverEffect />
            ) : (
              <div className="flex flex-col gap-2">
                <div className="w-full flex justify-start items-start mb-2">
                  <div>
                    <Tags tags={project.tags} limit={60} center />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-6 w-full">
                  <div className=" text-white flex space-x-2 items-center justify-center bg-[#2FB0F6] rounded-md p-1 px-2">
                    <Image src="/assets/bag.svg" height={20} width={20} alt="openings" />
                    <div>{project.noOpenings} Openings</div>
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex items-center gap-1 text-xs max-md:hidden">
                      <TooltipIcon label="Likes" icon={<HeartStraight size={20} />} excludeHoverEffect />
                      <div>{project.noLikes}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs max-md:hidden">
                      <TooltipIcon label="Likes" icon={<Bookmark size={20} />} excludeHoverEffect />
                      <div>{project.noShares}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <TooltipIcon label="Impressions" icon={<Eye size={20} />} excludeHoverEffect />
                      <div>{project.noImpressions}</div>
                    </div>
                  </div>
                  {project.noOpenings > 0 && <div className="text-xs">{project.noOpenings} Active Openings</div>}
                </div>
              </div>
            ))}
        </div>
        {smaller && (
          <div className="flex flex-row justify-between w-full">
            <div className="w-full mt-2 flex flex-row justify-start items-start mb-1">
              <div>
                <Tags tags={project.tags} limit={30} center />
              </div>
            </div>
            <div className="flex items-center justify-end">
              <div className="flex space-x-4">
                <div className="flex items-center gap-1 text-xs max-md:hidden">
                  <TooltipIcon label="Likes" icon={<HeartStraight size={20} />} excludeHoverEffect />
                  <div>{project.noOpenings}</div>
                </div>
                <div className="flex items-center gap-1 text-xs max-md:hidden">
                  <TooltipIcon label="Likes" icon={<Bookmark size={20} />} excludeHoverEffect />
                  <div>{project.noShares}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Wrapper>
  );
};

export default React.memo(ProjectCard);
