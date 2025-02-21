import { Project } from '@/types';
import { Buildings } from '@phosphor-icons/react';
import Link from 'next/link';
import ProjectCardCarousel from '../explore/project_card_carousel';

interface Props {
  project: Project;
}

const ProjectCard = ({ project }: Props) => (
  <Link
    href={`/projects/${project.slug}&action=external`}
    target="_blank"
    className="relative w-full bg-white dark:bg-dark_primary_comp_hover p-2 rounded-lg flex flex-col gap-2 transition-ease-out-500 animate-fade_third"
  >
    <div className="w-full flex items-center gap-1 text-sm font-medium">
      <div>By </div>
      <div
        onClick={() =>
          window.location.assign(`/${project.user.isOrganization ? 'organisations' : 'users'}/${project.user.username}`)
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
    <ProjectCardCarousel project={project} />
    <div className="w-full flex flex-col gap-2">
      <div className="font-bold text-2xl text-gradient">{project.title}</div>
      <div className="text-sm">{project.tagline}</div>
    </div>
  </Link>
);

export default ProjectCard;
