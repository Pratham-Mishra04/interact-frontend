import { FRONTEND_URL } from '@/config/routes';
import { NextSeoProps } from 'next-seo';

type ModelSEOData = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  user?: {
    name: string;
  };
  tags?: string[];
  imageUrl?: string;
};

export function generateSEOProps(
  model: ModelSEOData,
  type: 'project' | 'user' | 'event' | 'organisation'
): NextSeoProps {
  const { id, title, description, createdAt, user, tags, imageUrl } = model;

  const rawSEOProps: NextSeoProps = {
    title,
    description,
    canonical: `${FRONTEND_URL}/${type}s/${id}`,
    openGraph: {
      type,
      url: `/${type}s/${id}`,
      title,
      description,
      images: [
        {
          url: imageUrl || '/default-image.png',
          alt: title,
          width: 1200,
          height: 630,
        },
      ],
      siteName: 'Interact',
      article:
        type === 'project'
          ? {
              publishedTime: createdAt.toISOString(),
              authors: [user?.name || 'Interact User'],
              tags,
            }
          : {},
    },
    twitter: {
      handle: '@interact_now',
      site: '@Interact',
      cardType: 'summary_large_image',
    },
    additionalMetaTags: [
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      },
      {
        name: 'author',
        content: user?.name || 'Interact User',
      },
      {
        name: 'keywords',
        content: tags?.join(', ') || 'interact, projects, collaboration, community',
      },
      {
        name: 'interact',
        content: 'Interact',
      },
      // {
      //   name: 'theme-color',
      //   content: '#478EE1',
      // },
    ],
    additionalLinkTags: [
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
      {
        rel: 'manifest',
        href: '/site.webmanifest',
      },
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        href: '/rss.xml',
      },
    ],
  };

  const cleanObject = (obj: any): any =>
    Object.entries(obj)
      .filter(([_, value]) => value !== undefined && value !== null)
      .reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: value instanceof Object && !Array.isArray(value) ? cleanObject(value) : value,
        }),
        {}
      );

  return cleanObject(rawSEOProps);
}
