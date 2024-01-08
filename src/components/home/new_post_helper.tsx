import React, { useState } from 'react';
import { Info } from '@phosphor-icons/react';
interface HelperProps {
  showTips: boolean;
  setShowTips: React.Dispatch<React.SetStateAction<boolean>>;
  smallScreen?: boolean;
}
const NewPostHelper: React.FC<HelperProps> = ({ showTips, setShowTips, smallScreen }) => {
  const [firstMount, setFirstMount] = useState<boolean>(true);
  return (
    <div className="font-primary">
      <div
        className="w-fit cursor-pointer remove-def"
        onMouseEnter={() => {
          if (!smallScreen) {
            setShowTips(true);
            setFirstMount(false);
          }
        }}
        onMouseLeave={() => {
          if (!smallScreen) {
            setShowTips(false);
          }
        }}
        onClick={() => {
          setShowTips(!showTips);
          setFirstMount(false);
        }}
      >
        <Info className="cursor-pointer" size={24} />
      </div>
      {
        <div
          className={`drop-down bg-white h-fit absolute  shadow-lg ${
            smallScreen ? 'w-[90%] mt-2 left-4' : 'top-8 left-10 w-[40%]'
          } rounded-xl p-4 non-selectable pointer-events-none ${
            showTips ? 'animate-reveal' : firstMount ? 'hidden' : 'opacity-0 animate-reveal_reverse'
          }`}
        >
          <div className={`heading font-medium tracking-wide ${smallScreen ? 'text-base' : 'text-lg'}`}>Tips:</div>
          <div className="tips-list text-xs pl-4 mt-2">
            <ul className={`list-disc flex flex-col gap-2 text-xs`}>
              <li>
                Enclose your text with double asterisks <b>(**)</b> to emphasize and make it bold.
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
