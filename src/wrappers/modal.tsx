import React, { ReactNode, useEffect } from 'react';

interface Props {
  children: ReactNode;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  width?: string | number;
  height?: string | number;
  top?: string | number;
  z?: number;
  modalStyles?: React.CSSProperties;
  bgStyles?: React.CSSProperties;
  blur?: boolean;
  border?: boolean;
}

const ModalWrapper = ({
  children,
  setShow,
  width = '1/3',
  height = 'fit',
  top = 32,
  z = 40,
  modalStyles,
  bgStyles,
  blur = false,
  border = false,
}: Props) => {
  const z_variants = ['z-10', 'z-20', 'z-30', 'z-40', 'z-50', 'z-60', 'z-70', 'z-80'];
  const top_variants = ['top-32', 'top-56', 'top-1/2', 'top-1/3'];
  const w_variants = ['w-4/5', 'w-2/3', 'w-1/2', 'w-2/5', 'w-1/3', 'w-1/4', 'w-fit'];
  const h_variants = ['h-4/5', 'h-2/3', 'h-1/2', 'h-1/3', 'h-1/4', 'h-fit'];

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') setShow(false);
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <div
        style={modalStyles}
        className={`fixed top-${top} w-${width} h-${height} max-lg:w-5/6 max-h-[80%] overflow-y-auto overflow-x-hidden -translate-y-1/2 flex flex-col items-center gap-2 right-1/2 translate-x-1/2 rounded-lg p-6 dark:text-white font-primary bg-white dark:bg-dark_primary_comp backdrop-blur-lg ${
          border && 'border-2 border-primary_btn dark:border-dark_primary_btn'
        } shadow-xl thin_scrollbar animate-fade_third z-${z + 10}`}
      >
        {children}
      </div>
      <div
        onClick={() => setShow(false)}
        style={bgStyles}
        className={`bg-backdrop w-screen h-screen ${
          blur && 'backdrop-blur-sm'
        } fixed top-0 right-0 animate-fade_third z-${z}`}
      ></div>
    </>
  );
};

export default ModalWrapper;
