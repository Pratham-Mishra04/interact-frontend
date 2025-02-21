import React, { ReactNode } from 'react';
import { Project } from '@/types';
import { Eye, EyeSlash, HeartStraight, Warning } from '@phosphor-icons/react';
import Link from 'next/link';
import UserHoverCard from './user_hover_card';
import ProjectCardCarousel from './project_card_carousel';
import TooltipIcon from '../common/tooltip_icon';

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
        } hover:bg-primary_comp_hover dark:hover:bg-dark_primary_comp_active rounded-md p-2 transition-ease-out-500 animate-fade_third`}
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
        } hover:bg-primary_comp_hover dark:hover:bg-dark_primary_comp_hover rounded-md p-2 cursor-pointer transition-ease-out-500 animate-fade_third`}
      >
        {children}
      </div>
    );

  return (
    <Wrapper>
      <ProjectCardCarousel project={project} width="1/5" />
      <div className="w-4/5 flex items-center justify-between gap-4 dark:text-white">
        <div className="grow">
          <div className={`${!smaller && 'text-lg'} max-md:text-base font-medium line-clamp-1`}>{project.title}</div>
          <div className="text-sm max-md:text-xs line-clamp-1">{project.tagline}</div>
          {!smaller && (
            <div className="w-full flex gap-1 mt-2 max-md:mt-1 text-xs line-clamp-1">
              By{' '}
              <UserHoverCard
                trigger={<div className="hover:underline underline-offset-2">{project.user.name}</div>}
                user={project.user}
              />
            </div>
          )}
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
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1 text-xs max-md:hidden">
                  <TooltipIcon label="Likes" icon={<HeartStraight size={20} />} excludeHoverEffect />
                  <div>{project.noLikes}</div>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <TooltipIcon label="Impressions" icon={<Eye size={20} />} excludeHoverEffect />
                  <div>{project.noImpressions}</div>
                </div>
              </div>
              {project.noOpenings > 0 && <div className="text-xs">{project.noOpenings} Active Openings</div>}
            </div>
          ))}
      </div>
    </Wrapper>
  );
};

export default React.memo(ProjectCard);
