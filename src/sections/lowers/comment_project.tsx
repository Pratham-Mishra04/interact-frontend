import CommentBox from '@/components/comment/comment_box';
import { Project } from '@/types';
import React, { useState } from 'react';

interface Props {
  project: Project;
}

const CommentProject = ({ project }: Props) => {
  const [numComments, setNumComments] = useState(project.noComments || 0);
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="font-semibold text-lg text-gray-800 dark:text-white">
        Comments ({numComments > 0 ? numComments : 0})
      </div>
      <CommentBox item={project} type="project" setNoComments={setNumComments} />
    </div>
  );
};

export default CommentProject;
