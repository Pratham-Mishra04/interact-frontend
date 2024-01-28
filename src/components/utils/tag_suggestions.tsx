import skill_suggestions from '@/utils/skill_suggestions';
import { CaretCircleLeft, CaretCircleRight } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';

interface Props {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  maxTags?: number;
  fuzzy:any;
  setFuzzy:any;
}


const TagSuggestions = ({ tags, setTags, maxTags = 5 ,fuzzy,setFuzzy}: Props) => {
  const fuzzyNames = fuzzy.map((fuz:any)=>{
    return fuz.target
  })
  const [page, setPage] = useState(1);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const limit = 20;
  const totalPages = Math.ceil(skill_suggestions.length / limit);

  const getCurrentPageItems = () => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return skill_suggestions.slice(startIndex, endIndex);
  };

  useEffect(() => {
    setSuggestions(getCurrentPageItems());
  }, [page]);

  return (
    <div className="w-full flex flex-col gap-2 mt-2">
      {/* <div className="w-full flex items-center justify-between">
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
      </div> */}
      <div className="w-full flex flex-col flex-wrap gap-2">
        {
          fuzzyNames && fuzzyNames.length > 0 && <><div className="font-semibold">Suggestions</div>
          <div className = "flex flex-wrap gap-2">
          {
            fuzzyNames.map((fuz:any)=>(
             <div className = "border-[1px] border-primary_black rounded-lg px-2 py-1 text-xs text-nowrap cursor-pointer w-fit" onClick={() => setTags(prev => [...prev, fuz])}>
                {fuz}
              </div>)
            )
          }
          </div></> }
      </div>
    </div>
  );
};

export default TagSuggestions;


