import Toaster from '@/utils/toaster';
import React, { FormEvent, useEffect, useRef, useState } from 'react';
import isURL from 'validator/lib/isURL';
import Link from 'next/link';
import getIcon from '@/utils/funcs/get_icon';
import getDomainName from '@/utils/funcs/get_domain_name';

interface Props {
  links: string[];
  setLinks: React.Dispatch<React.SetStateAction<string[]>>;
  showTitle?: boolean;
  maxLinks?: number;
  title?: string;
  blackBorder?: boolean;
}

const Links = ({ links, showTitle = false, setLinks, maxLinks = 5, title = 'Links', blackBorder = false }: Props) => {
  const [newLink, setNewLink] = useState('');
  const [showURL, setShowURL] = useState(-1);

  const newLinkRef = useRef<string>('');

  useEffect(() => {
    newLinkRef.current = newLink;
  }, [newLink]);

  useEffect(() => {
    return () => {
      const link = newLinkRef.current;

      if (isURL(link)) {
        if (link.startsWith('https://www.')) setLinks(prev => [...prev, link]);
        else if (link.startsWith('https://')) setLinks(prev => [...prev, link.replace('https://', 'https://www.')]);
        else if (link.startsWith('www.')) setLinks(prev => [...prev, 'https://' + link]);
        else setLinks(prev => [...prev, 'https://www.' + link]);
        setNewLink('');
      }
    };
  }, []);

  const addLink = (el?: FormEvent<HTMLFormElement>) => {
    el?.preventDefault();
    if (links && links.length == maxLinks) {
      return;
    }
    if (isURL(newLink)) {
      if (newLink.startsWith('https://www.')) setLinks(prev => [...prev, newLink]);
      else if (newLink.startsWith('https://')) setLinks(prev => [...prev, newLink.replace('https://', 'https://www.')]);
      else if (newLink.startsWith('www.')) setLinks(prev => [...prev, 'https://' + newLink]);
      else setLinks(prev => [...prev, 'https://www.' + newLink]);
      setNewLink('');
    } else Toaster.error('Enter a valid URL');
  };

  return (
    <>
      <div className="w-full flex flex-col gap-2">
        {showTitle ? (
          <div className="w-full text-sm font-medium">
            {title} ({links.length + '/' + maxLinks})
          </div>
        ) : (
          <></>
        )}
        <div className="w-full flex flex-col gap-2">
          {links && links.length > 0 ? (
            <div className="flex flex-col gap-4">
              {links.map((link: string, index: number) => {
                return (
                  <div key={index} className="w-full h-8 flex justify-between gap-2 items-center font-Inconsolata">
                    <div
                      className={`flex items-center gap-2 ${showURL === index ? 'hidden' : ''}`}
                      onMouseEnter={() => setShowURL(index)}
                    >
                      {getIcon(getDomainName(link))}
                      <div className="capitalize">{getDomainName(link)}</div>
                    </div>
                    <Link
                      className={`text-xs border-[1px] border-black border-dashed rounded-lg px-2 py-1 ${
                        showURL !== index ? 'hidden' : ''
                      }`}
                      href={link}
                      target="_blank"
                      onMouseLeave={() => setShowURL(-1)}
                    >
                      {link.length < 40 ? link : link.substring(0, 40) + '...'}
                    </Link>
                    <div
                      className="mr-5 cursor-pointer"
                      onClick={() => {
                        const newLinks = [...links];
                        newLinks.splice(index, 1);
                        setLinks(newLinks);
                      }}
                    >
                      X
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <></>
          )}

          {links.length < maxLinks ? (
            <form onSubmit={addLink}>
              <input
                className={`w-full h-12  ${
                  blackBorder
                    ? 'border-black placeholder:text-[#202020c6] bg-[#ffffff40]'
                    : 'bg-transparent dark:bg-[#10013b30] border-gray-400 dark:border-dark_primary_btn'
                } focus:outline-none border-[1px] rounded-lg px-4 py-2 text-sm`}
                value={newLink}
                onChange={el => setNewLink(el.target.value.toLowerCase().trim())}
                placeholder="New Link"
              />
            </form>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
};

export default Links;
