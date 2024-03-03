import React, { useState } from 'react';
import { Info } from '@phosphor-icons/react';

interface Props {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  smallScreen?: boolean;
  announcement?: boolean;
}

const NewPostHelper: React.FC<Props> = ({ show, setShow, smallScreen, announcement = false }) => {
  const [firstMount, setFirstMount] = useState<boolean>(true);
  return (
    <div className="font-primary">
      <Info
        className="cursor-pointer w-fit remove-def"
        size={24}
        onMouseEnter={() => {
          if (!smallScreen) {
            setShow(true);
            setFirstMount(false);
          }
        }}
        onMouseLeave={() => {
          if (!smallScreen) {
            setShow(false);
          }
        }}
        onClick={() => {
          setShow(prev => !prev);
          setFirstMount(false);
        }}
      />
      {
        <div
          className={`drop-down-modal bg-white h-fit absolute  shadow-lg ${
            smallScreen ? 'w-[90%] mt-2 left-4' : 'top-8 left-10 w-[40%]'
          } rounded-xl p-4 non-selectable pointer-events-none ${
            show ? 'animate-reveal' : firstMount ? 'hidden' : 'opacity-0 animate-reveal_reverse'
          }`}
        >
          <div className={`heading font-medium tracking-wide ${smallScreen ? 'text-base' : 'text-lg'}`}>Tips:</div>
          <div className="tips-list text-xs pl-4 mt-2">
            <ul className={`list-disc flex flex-col gap-2 text-xs`}>
              {announcement && <li>Announcements have a better short term reach than a posts.</li>}
              <li>
                Enclose your text with double asterisks <b>(**)</b>, or select text and press control+B to emphasize and
                make it bold.
              </li>
              <li>
                Use the <b>&quot;@&quot;</b> symbol followed by the username to easily mention and involve specific
                individuals in your post
              </li>
            </ul>
          </div>
        </div>
      }
    </div>
  );
};

export default NewPostHelper;
