import React from 'react';
import LinksField from '../utils/edit_links';

interface Props {
  label?: string;
  links: string[];
  setLinks: React.Dispatch<React.SetStateAction<string[]>> | ((val: string[]) => void);
  maxLinks: number;
  required?: boolean;
}

const Links = ({ label, links, setLinks, maxLinks, required = false }: Props) => {
  return (
    <div className="w-full">
      {label && (
        <div className="text-xs ml-1 font-medium uppercase text-gray-500 dark:text-gray-300">
          {label}
          {required && '*'} ({links.length}/{maxLinks})
        </div>
      )}
      <LinksField links={links} setLinks={setLinks} maxLinks={maxLinks} />
    </div>
  );
};

export default Links;
