const SEO = (title = 'Interact') => ({
  title: title,
  description:
    'Interact is a groundbreaking web platform designed for college-going students, freelancers, professionals, and creatives. It serves as a collaborative hub where users can upload their ongoing projects and connect with others who are interested in collaborating on those projects.',
  canonical: 'https://interactnow.in/',
  openGraph: {
    title: 'Interact',
    description:
      'Interact is a groundbreaking web platform designed for college-going students, freelancers, professionals, and creatives. It serves as a collaborative hub where users can upload their ongoing projects and connect with others who are interested in collaborating on those projects.',
    type: 'website',
    url: 'https://interactnow.in/',
    siteName: 'Interact',
    images: [
      {
        url: 'https://interactnow.in/logo-public.png',
        width: 720,
        height: 720,
        alt: 'Interact: The collaborative hub for project sharing and collaboration among college students, freelancers, professionals, and creatives.',
      },
    ],
  },
  twitter: {
    handle: '@interact_now',
    site: '@Interact',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'keywords',
      content:
        'Collaborative platform for projects, Project collaboration network, Online project collaboration, College student collaboration, Freelancer collaboration, Professional project sharing, Creative project collaboration, Collaborate on ongoing projects, Project collaboration hub, Project showcase platform, Collaborative networking for students, Collaborate with professionals, Collaborate with creatives, Free project collaboration, Showcase achievements online, Project collaboration for all niches, Connect with project partners, College project sharing, Networking for freelancers, Creative project sharing platform',
    },
  ],
});

export default SEO;
