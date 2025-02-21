import Navbar from '@/components/common/navbar';
import SearchBar from '@/components/explore/searchbar';
import SEO from '@/config/seo';
import { useWindowWidth } from '@react-hook/window-size';
import { NextSeo, NextSeoProps } from 'next-seo';
import React, { ReactNode } from 'react';

interface WrapperProps {
  children: ReactNode;
  title?: string;
  excludeSearchBar?: boolean;
  seoProps?: NextSeoProps;
}

const BaseWrapper: React.FC<WrapperProps> = ({ children, title = '', excludeSearchBar = false, seoProps }) => {
  const width = useWindowWidth();
  const isMD = width < 768;

  return (
    <>
      <NextSeo {...(Object.keys(seoProps || {}).length > 0 ? seoProps : SEO(title + ' | Interact'))} />
      <Navbar includeExplore={isMD} />
      {!excludeSearchBar && !isMD && <SearchBar />}
      <div className="w-full flex">{children}</div>
    </>
  );
};

export default BaseWrapper;
