import { useCallback, useEffect, useState } from 'react';

const debounce = (func: (text: string)=>void, delay: number) => {
  let timer: NodeJS.Timeout;
  return (text: string)=>{
    clearTimeout(timer);
    timer = setTimeout(()=>func(text), delay);
  };
}

export const useLocalDraft = (key: string, content: string, delay = 500)=>{
  const [draft, ] = useState(()=>{
    const savedDraft = localStorage.getItem(key);
    return savedDraft || content;
  })

  const saveDraft = useCallback(
    debounce((value)=>{
      localStorage.setItem(key, value);
    }, delay), [key, delay]
  );

  const clearDraft = ()=>{
    localStorage.removeItem(key);
  }

  useEffect(() => {
    saveDraft(content);
  }, [content, saveDraft]);

  return { draft, clearDraft };
}