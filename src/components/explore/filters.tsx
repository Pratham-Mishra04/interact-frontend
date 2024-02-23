import { Backspace, X } from '@phosphor-icons/react';
import React, { useEffect } from 'react';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const Filters = ({ setShow }: Props) => {
  useEffect(() => {
    document.documentElement.style.overflowY = 'hidden';
    document.documentElement.style.height = '100vh';

    return () => {
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.height = 'auto';
    };
  }, []);

  return (
    <>
      <div className="fixed top-48 max-md:top-20 w-2/5 max-lg:w-5/6 h-fit backdrop-blur-2xl bg-white flex flex-col gap-4 max-lg:gap-2 rounded-lg p-8 font-primary overflow-y-auto border-[1px] border-primary_black right-1/2 shadow-lg translate-x-1/2 animate-fade_third z-50 max-lg:z-[60]">
        <div className="w-full flex justify-between">
          <div className="font-semibold text-6xl text-gray-800">Filters</div>
          <div className="w-fit flex gap-2">
            <Backspace
              className="cursor-pointer"
              onClick={() => {
                window.location.assign('/');
                setShow(false);
              }}
              size={32}
            />
            <X className="cursor-pointer" onClick={() => setShow(false)} size={32} />
          </div>
        </div>

        {/* <div className="w-full flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <select
            onChange={el => setLevel(el.target.value)}
            value={level}
            className="px-4 py-3 w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0 text-sm"
          >
            {renderSelectOptions(levels)}
          </select>

          <select
            onChange={el => setResourceId(el.target.value)}
            value={resourceId}
            className="px-4 py-3 w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0 text-sm"
          >
            {renderSelectOptions(resourceIds)}
          </select>

          <select
            onChange={el => setTraceId(el.target.value)}
            value={traceId}
            className="px-4 py-3 w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0 text-sm"
          >
            {renderSelectOptions(traceIds)}
          </select>

          <select
            onChange={el => setSpanId(el.target.value)}
            value={spanId}
            className="px-4 py-3 w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0 text-sm"
          >
            {renderSelectOptions(spanIds)}
          </select>

          <select
            onChange={el => setParentResourceId(el.target.value)}
            value={parentResourceId}
            className="px-4 py-3 w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0 text-sm"
          >
            {renderSelectOptions(parentResourceIds)}
          </select>

          <select
            onChange={el => setCommit(el.target.value)}
            value={commit}
            className="px-4 py-3 w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0 text-sm"
          >
            {renderSelectOptions(commits)}
          </select>
        </div>
        <div className="w-full flex gap-2">
          <div> Start Time:</div>
          <input type="datetime-local" value={start} onChange={el => setStart(el.target.value)} />
        </div>
        <div className="w-full flex gap-2">
          <div>End Time:</div>
          <input type="datetime-local" value={end} onChange={el => setEnd(el.target.value)} />
        </div>
      </div> */}
      </div>
      <div
        onClick={() => setShow(false)}
        className="bg-backdrop w-screen h-screen fixed top-0 left-0 animate-fade_third z-30 max-lg:z-[51]"
      ></div>
    </>
  );
};

export default Filters;
