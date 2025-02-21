import React, { useEffect, useState } from 'react';
import TestimonialsCard from '../../components/landing/testimonials_card';
import Marquee from '@/components/ui/marquee';
import { testimonials } from '@/config/landing';

const splitIntoRows = (reviews: any[], numRows: number) => {
  const rows = [];
  const rowSize = Math.ceil(reviews.length / numRows);

  for (let i = 0; i < numRows; i++) {
    rows.push(reviews.slice(i * rowSize, (i + 1) * rowSize));
  }

  return rows;
};

const rowsConfig = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
};

const useResponsiveRows = () => {
  const [numRows, setNumRows] = useState(rowsConfig.desktop);

  useEffect(() => {
    const updateRows = () => {
      if (window.innerWidth < 768) {
        setNumRows(rowsConfig.mobile);
      } else if (window.innerWidth < 1024) {
        setNumRows(rowsConfig.tablet);
      } else {
        setNumRows(rowsConfig.desktop);
      }
    };

    updateRows(); // Set initial value
    window.addEventListener('resize', updateRows);
    return () => window.removeEventListener('resize', updateRows);
  }, []);

  return numRows;
};

const Testimonials = () => {
  const numRows = useResponsiveRows();
  const rows = splitIntoRows(testimonials, numRows);

  return (
    <div className="bg-background flex flex-col space-y-12 max-md:space-y-4 justify-center items-center text-center">
      <div className="w-full space-y-2">
        <h1 className="md:text-8xl text-6xl font-bold text-sky-400">Testimonials</h1>
        <h3 className="text-xl max-md:px-4">Don&apos;t believe us? Look what people have to say about us!</h3>
      </div>

      <div className="relative flex h-[750px] w-full flex-row items-center justify-center overflow-hidden">
        {rows.map((row, index) => (
          <Marquee
            key={index}
            reverse={index % 2 !== 0}
            pauseOnHover
            vertical
            className="[--duration:20s] max-md:[--duration:40s]"
          >
            {row.map((testimonail: any) => (
              <TestimonialsCard key={testimonail.username} {...testimonail} />
            ))}
          </Marquee>
        ))}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white dark:from-background"></div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white dark:from-background"></div>
      </div>
    </div>
  );
};

export default Testimonials;
