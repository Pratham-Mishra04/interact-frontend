import React from 'react';
import { Project } from '@/types';
import Image from 'next/image';
import { PROJECT_PIC_URL } from '@/config/routes';
import { Buildings, CircleDashed, Eye, HeartStraight } from '@phosphor-icons/react';

interface Props {
  index: number;
  project: Project;
  size?: number | string;
  setClickedOnProject?: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedProjectIndex?: React.Dispatch<React.SetStateAction<number>>;
}

const ProjectCard = ({ index, project, size = 72, setClickedOnProject, setClickedProjectIndex }: Props) => {
  const variants = [
    'w-80',
    'w-80',
    'w-72',
    'w-64',
    'w-[22vw]',
    'w-[24vw]',
    'w-56',
    'w-80',
    'h-80',
    'h-72',
    'h-64',
    'h-56',
    'h-[22vw]',
    'h-[24vw]',
  ];
  return (
    <div
      onClick={() => {
        if (setClickedOnProject) setClickedOnProject(true);
        if (setClickedProjectIndex) setClickedProjectIndex(index);
      }}
      className={`w-${size} h-${size} max-lg:w-60 max-lg:h-60 max-md:w-72 max-md:h-72 rounded-lg relative group cursor-pointer transition-ease-out-500`}
    >
      <div className="w-full h-full  absolute top-0 hidden group-hover:flex animate-fade_third justify-end z-[6] rounded-lg p-1">
        {/* <BookmarkSimple size={24}  className="opacity-75" /> */}
      </div>
      <div className="w-full h-full rounded-lg overflow-clip p-4 text-sm backdrop-blur-xl text-white absolute top-0 left-0 bg-gradient-to-b from-[#00000080] z-[5] to-transparent opacity-0 group-hover:opacity-100 transition-ease-300"></div>
      <div className="w-full h-full rounded-lg overflow-clip p-4 text-sm fade-img backdrop-blur-sm text-white absolute top-0 left-0 z-[5] opacity-0 group-hover:opacity-100 transition-ease-300">
        <div className="font-bold mb-2">{project.tagline}</div>
        <div>{project.description}</div>
      </div>
      <Image
        crossOrigin="anonymous"
        className="w-full h-full rounded-lg object-cover absolute top-0 left-0 "
        src={`${PROJECT_PIC_URL}/${project.coverPic}`}
        alt="Project Cover"
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 40vw, 20vw"
        width={100}
        height={100}
        placeholder="blur"
        blurDataURL={project.blurHash || 'no-hash'}
      />
      <div className="w-full glassMorphism text-white rounded-b-lg font-primary absolute bottom-0 right-0 flex flex-col px-4 py-2">
        <div className={`${Number(size) <= 64 ? 'text-base' : size == 72 ? 'text-lg' : 'text-xl'}`}>
          {project.title}
        </div>
        <div className="w-full flex items-center justify-between">
          <div className={`w-full flex items-center gap-1 line-clamp-1 ${Number(size) <= 64 ? 'text-xs' : 'text-sm'}`}>
            {project.user.name}{' '}
            {project.user.isOrganization ? (
              <Buildings />
            ) : (
              <div className="text-xs">
                {project.memberships?.length > 0 ? (
                  <>
                    + {project.memberships.length} other{project.memberships.length == 1 ? '' : 's'}
                  </>
                ) : (
                  <></>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              <HeartStraight size={16} />
              <div>{project.noLikes}</div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Eye size={16} />
              <div>{project.noImpressions}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
