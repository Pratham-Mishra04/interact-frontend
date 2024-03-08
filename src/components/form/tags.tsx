import React from 'react';
import TagsField from '../utils/edit_tags';

interface Props {
  label?: string;
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  maxTags: number;
  required?: boolean;
}

const Tags = ({ label, tags, setTags, maxTags, required = false }: Props) => {
  return (
    <div>
      {label && (
        <div className="text-xs ml-1 font-medium uppercase text-gray-500">
          {label}
          {required && '*'} ({tags.length}/{maxTags})
        </div>
      )}
      <TagsField tags={tags} setTags={setTags} maxTags={maxTags} />
    </div>
  );
};

export default Tags;
