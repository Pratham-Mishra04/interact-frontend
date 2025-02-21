import ProjectCard from '@/components/explore/project_card';
import { Project, ProjectBookmark } from '@/types';
import React from 'react';
import { ArrowArcLeft } from '@phosphor-icons/react';

interface Props {
  bookmark: ProjectBookmark;
  setClick: React.Dispatch<React.SetStateAction<boolean>>;
  fetchBookmarks?: () => void;
  setClickedProject?: React.Dispatch<React.SetStateAction<Project | null>>;
}

const Projects = ({ bookmark, setClick, fetchBookmarks, setClickedProject }: Props) => {
  return (
    <div className="w-full flex flex-col gap-4 font-primary dark:text-white pt-6">
      <div className="flex items-center gap-2">
        <ArrowArcLeft
          onClick={() => {
            if (fetchBookmarks) fetchBookmarks();
            setClick(false);
          }}
          className="cursor-pointer"
          size={24}
        />
        <div className="font-medium text-xl cursor-default">{bookmark.title}</div>
      </div>
      {bookmark.projectItems?.length > 0 ? (
        <div className="w-full">
          {bookmark.projectItems.map((projectItem, index) => {
            return (
              <ProjectCard
                key={projectItem.id}
                index={index}
                project={projectItem.project}
                setClickedProject={setClickedProject}
              />
            );
          })}
        </div>
      ) : (
        <div className="mx-auto pt-4">No Items :)</div>
      )}
    </div>
  );
};

export default Projects;
