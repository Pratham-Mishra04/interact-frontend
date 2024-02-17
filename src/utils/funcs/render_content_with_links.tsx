import { User } from '@/types';
import Link from 'next/link';
import React from 'react';

const renderContentWithLinks = (caption: string, taggedUsers: User[]) => {
  const lines = caption.split('\n');
  const taggedUsernames = (taggedUsers || []).map(u => u.username);

  return lines.map((line, lineIndex) => {
    const sentences = line.split('**');

    return (
      <div key={lineIndex}>
        {sentences.map((sentence, sentenceIndex) => {
          // Wrap sentences between '**' with <b> tags
          if (sentenceIndex % 2 === 1) {
            // Process links and tagged users within the bold tag
            const boldContent = sentence.split(/\s+/).map((word, wordIndex) => {
              // Check if the word is a link
              if (word.startsWith('http://') || word.startsWith('https://')) {
                return (
                  <a
                    key={wordIndex}
                    href={word}
                    className="underline underline-offset-2 hover:text-primary_text transition-ease-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {word}{' '}
                  </a>
                );
              }

              // Check if the word is a tag
              if (word.startsWith('#')) {
                return (
                  <Link
                    key={wordIndex}
                    href={`/explore?search=${word.replace('#', '')}`}
                    className="font-medium hover:text-primary_text transition-ease-200"
                    target="_blank"
                  >
                    {word}{' '}
                  </Link>
                );
              }

              if (word.startsWith('@') && taggedUsernames.includes(word.replace('@', ''))) {
                return (
                  <Link
                    key={wordIndex}
                    href={`/explore/user/${word.replace('@', '')}`}
                    className="font-medium hover:text-primary_text transition-ease-200"
                    target="_blank"
                  >
                    {word}{' '}
                  </Link>
                );
              }

              return <span key={wordIndex}>{word} </span>; // Render regular text
            });

            return <b key={sentenceIndex}>{boldContent}</b>;
          }

          const words = sentence.split(/\s+/);

          return words.map((word, wordIndex) => {
            // Process links and tagged users outside the bold tag
            if (word.startsWith('http://') || word.startsWith('https://')) {
              return (
                <a
                  key={wordIndex}
                  href={word}
                  className="underline underline-offset-2 hover:text-primary_text transition-ease-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {word}{' '}
                </a>
              );
            }

            if (word.startsWith('#')) {
              return (
                <Link
                  key={wordIndex}
                  href={`/explore?search=${word.replace('#', '')}`}
                  className="font-medium hover:text-primary_text transition-ease-200"
                  target="_blank"
                >
                  {word}{' '}
                </Link>
              );
            }

            if (word.startsWith('@') && taggedUsernames.includes(word.replace('@', ''))) {
              return (
                <Link
                  key={wordIndex}
                  href={`/explore/user/${word.replace('@', '')}`}
                  className="font-semibold hover:text-primary_text transition-ease-200"
                  target="_blank"
                >
                  {word}{' '}
                </Link>
              );
            }

            return <span key={wordIndex}>{word} </span>; // Render regular text
          });
        })}
      </div>
    );
  });
};

export default renderContentWithLinks;
