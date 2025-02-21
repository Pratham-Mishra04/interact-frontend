import skill_suggestions from '@/utils/skill_suggestions';
import { CaretCircleLeft, CaretCircleRight } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';

interface Props {
  match?: string;
  setMatch?: React.Dispatch<React.SetStateAction<string>>;
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>> | ((val: string[]) => void);
  maxTags?: number;
}

const TagSuggestions = ({ match = '', setMatch, tags, setTags, maxTags = 5 }: Props) => {
  const [page, setPage] = useState(1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const limit = 20;

  const getCurrentPageItems = (arr: string[]) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    setTotalPages(Math.ceil(arr.length / limit));
    return arr.slice(startIndex, endIndex);
  };

  useEffect(() => {
    setSuggestions(getCurrentPageItems(skill_suggestions.filter(el => el.match(match))));
  }, [match, page]);

  return (
    <div className="w-full flex flex-col gap-2 mt-2">
      <div className="w-full flex items-center justify-between">
        <div className="font-semibold">Suggestions</div>
        <div className="flex items-center gap-1">
          {page != 1 ? (
            <CaretCircleLeft onClick={() => setPage(prev => prev - 1)} className="cursor-pointer" size={24} />
          ) : (
            <CaretCircleLeft className="opacity-50" size={24} />
          )}
          {page != totalPages ? (
            <CaretCircleRight onClick={() => setPage(prev => prev + 1)} className="cursor-pointer" size={24} />
          ) : (
            <CaretCircleRight className="opacity-50" size={24} />
          )}
        </div>
      </div>
      <div className="w-full flex flex-wrap gap-2">
        {suggestions?.map(suggestion =>
          tags.includes(suggestion) || tags.length >= maxTags ? (
            <div
              key={suggestion}
              className="border-[1px] border-primary_black rounded-lg px-2 py-1 text-xs cursor-default opacity-50"
            >
              {suggestion}
            </div>
          ) : (
            <div
              key={suggestion}
              onClick={() => {
                if (setMatch) setMatch('');
                setTags([...tags, suggestion]);
              }}
              className="border-[1px] border-primary_black rounded-lg px-2 py-1 text-xs cursor-pointer"
            >
              {suggestion}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default TagSuggestions;
