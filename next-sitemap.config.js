/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_FRONTEND_URL,
    generateRobotsTxt: true,
    robotsTxtOptions: {
      policies: [
        {
          userAgent: '*',
          allow: '/', // Allow all pages to be crawled
        },
      ],
    },
    exclude: ['*'], // Exclude auto-detected routes
    additionalPaths: async (config) => {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;
    
      // Fetch dynamic slugs for projects
      const fetchProjectRoutes = async () => {
        const response = await fetch(`${backendURL}/explore/quick/seo?type=projects&limit=100`);
        const data = await response.json();
        return data.projects?.map((project) => ({
          loc: `/projects/${project.slug}`,
          lastmod: new Date(project.createdAt).toISOString(),
        }));
      };
  
      // Fetch dynamic slugs for users
      const fetchUserRoutes = async () => {
        const response = await fetch(`${backendURL}/explore/quick/seo?type=users&limit=100`);
        const data = await response.json();
        return data.users?.map((user) => ({
          loc: `/users/${user.username}`, 
          lastmod: new Date(user.createdAt).toISOString(),
        }));
      };
  
      // Fetch dynamic slugs for events
      const fetchEventRoutes = async () => {
        const response = await fetch(`${backendURL}/explore/quick/seo?type=events&limit=100`);
        const data = await response.json();
        return data.events?.map((event) => ({
          loc: `/events/${event.id}`,
          lastmod: new Date(event.createdAt).toISOString(),
        }));
      };
  
      // Generate dynamic routes for all types
      const projectRoutes = (await fetchProjectRoutes())||[];
      const userRoutes = (await fetchUserRoutes())||[];
      const eventRoutes = (await fetchEventRoutes())||[];
  
      // Return all dynamic and static routes
      return [
        { loc: '/', priority: 1.0, lastmod: new Date().toISOString() },
        { loc: '/login', priority: 1.0, lastmod: new Date().toISOString() },
        { loc: '/signup', priority: 1.0, lastmod: new Date().toISOString() },
        { loc: '/home', priority: 1.0, lastmod: new Date().toISOString() },
        { loc: '/openings', priority: 1.0, lastmod: new Date().toISOString() },
  
        { loc: '/projects', priority: 1.0, lastmod: new Date().toISOString() },
        { loc: '/users', priority: 1.0, lastmod: new Date().toISOString() },
        { loc: '/events', priority: 1.0, lastmod: new Date().toISOString() },
        ...projectRoutes,
        ...userRoutes,
        ...eventRoutes,
      ];
    },
  };
  