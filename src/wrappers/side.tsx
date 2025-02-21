import React, { ReactNode, useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useWindowWidth } from '@react-hook/window-size';
import { CaretDoubleLeft } from '@phosphor-icons/react';

interface WrapperProps {
  children: ReactNode;
  title?: string;
  style?: React.CSSProperties;
  stickTop?: boolean;
  hideMD?: boolean;
}

const SideBarWrapper: React.FC<WrapperProps> = ({ children, hideMD = false }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const width = useWindowWidth();
  const isMD = width < 768;

  return isMD ? (
    hideMD ? (
      <></>
    ) : (
      <Sheet open={isDialogOpen} onOpenChange={val => setIsDialogOpen(val)}>
        <div
          onClick={() => setIsDialogOpen(true)}
          className="w-10 h-10 fixed top-20 right-2 rounded-full flex-center bg-primary_comp_hover dark:bg-dark_primary_comp_hover"
        >
          <CaretDoubleLeft className="max-md:w-6 max-md:h-6" size={24} weight="regular" />
        </div>
        <SheetContent className="dark:bg-dark_primary_comp overflow-y-auto px-0 py-4">{children}</SheetContent>
      </Sheet>
    )
  ) : (
    <div className="w-1/3 flex flex-col gap-4">{children}</div>
  );
};

export const SidePrimeWrapper: React.FC<WrapperProps> = ({ children, title, style, stickTop = false }) => {
  return (
    <div
      style={style}
      className={`w-full flex flex-col gap-2 bg-white dark:bg-dark_primary_comp rounded-lg p-4 ${
        stickTop && 'sticky top-20 max-h-base overflow-y-auto'
      } transition-ease-300 animate-fade_half`}
    >
      {title && <div className="w-fit text-2xl font-bold text-gradient">{title}</div>}
      {children}
    </div>
  );
};

export default SideBarWrapper;
