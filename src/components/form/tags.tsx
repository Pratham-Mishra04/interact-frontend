import React from 'react';
import TagsField from '../utils/edit_tags';

interface Props {
  label?: string;
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>> | ((val: string[]) => void);
  maxTags: number;
  required?: boolean;
  suggestions?: boolean;
}

const Tags = ({ label, tags, setTags, maxTags, required = false, suggestions = false }: Props) => {
  return (
    <div className="w-full">
      {label && (
        <div className="text-xs ml-1 font-medium uppercase text-gray-500 dark:text-gray-300">
          {label}
          {required && '*'} ({tags.length}/{maxTags})
        </div>
      )}
      <TagsField tags={tags} setTags={setTags} maxTags={maxTags} suggestions={suggestions} />
    </div>
  );
};

export default Tags;
