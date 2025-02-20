import { USER_PROFILE_PIC_URL } from '@/config/routes';
import { Project } from '@/types';
import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, Buildings } from '@phosphor-icons/react';
import Link from 'next/link';
import Links from '@/components/explore/show_links';
import renderContentWithLinks from '@/utils/funcs/render_content_with_links';
import { SidePrimeWrapper } from '@/wrappers/side';
import LowerProject from '@/components/lowers/lower_project';
import ProjectCardCarousel from '@/components/explore/project_card_carousel';
import Editor from '@/components/editor';

interface Props {
  project: Project;
  setProject?: React.Dispatch<React.SetStateAction<Project>>;
  openInNewTab?: boolean;
}

const ProjectView = ({ project, setProject, openInNewTab }: Props) => {
  const [clickedOnReadMore, setClickedOnReadMore] = useState(false);

  return (
    <SidePrimeWrapper stickTop>
      <div
        key={project.id}
        className="w-full max-h-base_md overflow-y-auto flex flex-col gap-4 dark:text-white font-primary animate-fade_third"
      >
        <div className="w-full flex gap-2 max-lg:gap-4">
          <Image
            crossOrigin="anonymous"
            width={100}
            height={100}
            alt={'User Pic'}
            src={`${USER_PROFILE_PIC_URL}/${project.user.profilePic}`}
            placeholder="blur"
            blurDataURL={project.user.profilePicBlurHash || 'no-hash'}
            className="w-10 h-10 rounded-full"
          />
          <div className="w-[calc(100%-40px)]">
            <div className="w-fit font-bold cursor-default line-clamp-1">{project.title}</div>
            <div className="w-fit flex items-center gap-1 text-xs font-medium">
              <div
                onClick={() =>
                  window.location.assign(
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
                project.noMembers > 1 && <div className="flex-center">+ {project.noMembers - 1} others</div>
              )}
            </div>
          </div>
        </div>
        <ProjectCardCarousel project={project} />
        <div className="w-full flex flex-col gap-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="font-bold text-3xl text-gradient">{project.title}</div>
            <LowerProject project={project} setProject={setProject} />
          </div>
          <div className="font-semibold text-lg">{project.tagline}</div>
          <Link
            href={`/projects/${project.slug}`}
            target={openInNewTab ? '_blank' : '_self'}
            className="w-full flex-center py-2 bg-primary_comp dark:bg-dark_primary_comp_hover hover:bg-primary_comp_hover dark:hover:bg-dark_primary_comp_active rounded-lg transition-ease-300"
          >
            Open Project <ArrowUpRight size={20} weight="bold" />
          </Link>
          <div className="text-sm whitespace-pre-line">
            <Editor editable={false} content={project.description} truncate maxHeight={120} />
          </div>
          <div className="w-full flex flex-wrap gap-2">
            {project.tags &&
              project.tags.map(tag => {
                return (
                  <Link
                    href={`/projects?search=${tag}`}
                    target="_blank"
                    key={tag}
                    className="flex-center p-2 font-primary text-xs dark:text-white border-[1px] border-primary_btn  dark:border-dark_primary_btn bg-gray-200 dark:bg-dark_primary_comp rounded-lg"
                  >
                    {tag}
                  </Link>
                );
              })}
          </div>
          <Links links={project.links} />
        </div>
      </div>
    </SidePrimeWrapper>
  );
};

export default ProjectView;
