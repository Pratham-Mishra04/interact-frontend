import React from 'react';

interface Props {
  content: string;
  styles?: React.CSSProperties;
}

const ToolTip = ({ content, styles }: Props) => {
  return (
    <div
      style={styles}
      className="w-fit absolute -top-12 left-0 scale-0 px-3 rounded-lg bg-white dark:bg-dark_primary_comp_hover border-2 border-gray-200 dark:border-dark_primary_btn dark:text-white py-2 text-sm text-center font-semibold shadow-xl transition-ease-300 capitalize group-hover:scale-100 cursor-default"
    >
      {content}
    </div>
  );
};

export default ToolTip;
