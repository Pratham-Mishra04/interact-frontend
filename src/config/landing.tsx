import {
  BellRinging,
  ChatsCircle,
  CheckSquareOffset,
  MegaphoneSimple,
  ProjectorScreenChart,
  ReadCvLogo,
  RocketLaunch,
  UsersThree,
} from '@phosphor-icons/react';
import { LANDING_RESOURCE_URL } from './routes';
import { Files, Presentation } from 'lucide-react';

export const features = {
  students: [
    {
      image: `${LANDING_RESOURCE_URL}/user1.png`,
      imageAlt: 'Dashboard Preview',
      imageClass: 'lg:scale-[1.5] lg:-translate-x-[140px] fade-img-left',
      titleUpper: 'Managing',
      titleMid: 'Your',
      titleLower: 'Projects',
      titleSide: 'made easy.',
      description:
        'Unlike the popular but noisy networking cum social media platforms, Interact is devoted to project cycles specifically tailored for university students. From managing tasks and tracking progress to sharing resources and collaborating seamlessly, Interact has got you covered.',
      features: [
        {
          title: 'Task Management',
          description:
            'Divide tasks, track progress in real-time, and sync updates with GitHub to stay on top of your project.',
        },
        {
          title: 'Collaborative Tools',
          description:
            'Engage with your team using project chats and resource buckets for centralized and seamless collaboration.',
        },
      ],
      quote: {
        name: 'Pratham',
        designation: 'Founder',
        quote:
          'A project is more than just tasks and deadlines; it’s a vision coming to life. With Interact, we ensure you have everything you need to manage, collaborate, and turn ideas into reality.',
        position: 'end',
      },
    },
    {
      image: `${LANDING_RESOURCE_URL}/user2.png`,
      imageAlt: 'Hackathon Dashboard',
      imageClass: 'lg:scale-[1.5] lg:translate-x-[140px] fade-img-right',
      titleUpper: 'Discover',
      titleMid: 'Exciting',
      titleLower: 'Openings',
      titleSide: 'seamlessly.',
      description:
        'Interact opens doors to new opportunities by helping students find projects that match their skills and interests. Explore project openings, apply directly, and collaborate on projects that excite you.',
      features: [
        {
          title: 'Find Your Niche Projects',
          description: 'Browse through a wide range of project openings tailored to your skills and interests.',
        },
        {
          title: 'Effortless Applications',
          description:
            'Apply to projects on the platform, filter through opportunities, and even schedule meetings with project owners—all in one place.',
        },
      ],
      quote: {
        name: 'Soha',
        designation: 'Co-Founder',
        quote:
          'Finding the right project to work on shouldn’t feel like searching for a needle in a haystack. Interact connects you with opportunities that match your passion and skills, helping you take that first step toward greatness.',
        position: 'start',
      },
    },
    {
      image: `${LANDING_RESOURCE_URL}/user3.svg`,
      imageAlt: 'Dashboard Preview',
      imageClass: 'lg:scale-[1.5] lg:-translate-x-[140px] fade-img-left',
      titleUpper: 'Participating',
      titleMid: 'In',
      titleLower: 'Events',
      titleSide: 'redefined.',
      description:
        'Interact revolutionizes your event participation. Participate in hackathons, events and workshops where you compete, learn and earn rewards. We sync your participation on your profile so you don’t have to. PS- participate often to earn enough points to unlock our premium features.',
      features: [
        {
          title: 'Workshops',
          description:
            'Attend live sessions, access recordings, and follow along with transcripts to enhance your skills.',
        },
        {
          title: 'Hackathon Continuity',
          description:
            'Participate and Hackathons and continue your project post-event to transform them into full-fledged ventures.',
        },
      ],
      quote: {
        name: 'Pratham',
        designation: 'Founder',
        quote:
          'Every event is a chance to learn, compete, and grow. Whether it’s a workshop or a hackathon, Interact makes sure your journey is smooth, productive, and full of possibilities.',
        position: 'end',
      },
    },
  ],
  organisations: [
    {
      image: `${LANDING_RESOURCE_URL}/org1.png`,
      imageAlt: 'Project Management Dashboard',
      imageClass: 'lg:scale-[1.5] lg:-translate-x-[140px] fade-img-left',
      titleUpper: 'Streamlining',
      titleMid: 'Your',
      titleLower: 'Organization',
      titleSide: 'with ease.',
      description:
        'Unlike fragmented management tools, Interact provides a unified platform for organizations to centralize their workflows. From seamless communication to efficient task and project handling, everything you need is in one place.',
      features: [
        {
          title: 'Centralized Management',
          description:
            'Manage tasks, assign responsibilities, and track progress with integrated tools like GitHub and Figma, all within one hub.',
        },
        {
          title: 'Unified Communication',
          description:
            'Foster seamless collaboration with organization-wide chats, keeping your team connected and informed at all times.',
        },
      ],
      quote: {
        name: 'Pratham',
        designation: 'Founder',
        quote:
          'Running an organization is more than just managing tasks; it’s about empowering people and fostering growth. Interact simplifies the complexity so you can focus on what truly matters—making an impact.',
        position: 'start',
      },
    },
    {
      image: `${LANDING_RESOURCE_URL}/org2.png`,
      imageAlt: 'Meeting Management Dashboard',
      imageClass: 'lg:scale-[1.5] lg:translate-x-[140px] fade-img-right',
      titleUpper: 'Hosting',
      titleMid: 'Impactful',
      titleLower: 'Events',
      titleSide: 'made seamless.',
      description:
        'Organize and host events with ease. From live workshops to hackathons, Interact equips you with all the tools you need to make a lasting impact.',
      features: [
        {
          title: 'Hackathons with AI Support',
          description:
            'Utilize AI integrations for team analytics, automated code reviews, and detailed post-event reports.',
        },
        {
          title: 'Live Workshops',
          description:
            'Host workshops with transcripts, recordings, and participant management for a smooth and engaging experience.',
        },
      ],
      quote: {
        name: 'Soha',
        designation: 'Co-Founder',
        quote:
          'An event isn’t just a gathering; it’s an experience that inspires and connects. With Interact, you get the tools to host events that leave a lasting impression on every participant.',
        position: 'end',
      },
    },
    {
      image: `${LANDING_RESOURCE_URL}/org3.svg`,
      imageAlt: 'Event Hosting Dashboard',
      imageClass: 'lg:scale-[1.5] lg:-translate-x-[140px] fade-img-left',
      titleUpper: 'Scheduling',
      titleMid: 'Your',
      titleLower: 'Meetings',
      titleSide: 'simplified.',
      description:
        'Interact simplifies meeting management with tools for scheduling, hosting, and tracking meetings. Keep your organization aligned and productive with everything in one place.',
      features: [
        {
          title: 'Meeting Scheduler',
          description: 'Plan and schedule meetings effortlessly, complete with automatic reminders for participants.',
        },
        {
          title: 'Transcripts and Recordings',
          description:
            'Access meeting transcripts and recordings to ensure no detail is missed and everyone stays informed.',
        },
      ],
      quote: {
        name: 'Pratham',
        designation: 'Founder',
        quote:
          'Meetings aren’t just about discussion—they’re about alignment and action. Interact ensures that every meeting is well-organized, productive, and moves your team closer to its goals.',
        position: 'start',
      },
    },
  ],
};

export const extraFeatures = {
  students: [
    {
      title: 'Resource Buckets',
      description:
        'Organize, share, and access all project-related resources in one place, ensuring your team stays on the same page.',
      icon: <Files size={32} />,
    },
    {
      title: 'Project Chats',
      description:
        'Communicate seamlessly with your team using integrated chat tools designed to keep discussions project-focused.',
      icon: <ChatsCircle size={32} />,
    },
    {
      title: 'Application Management',
      description:
        'Post openings for your projects, filter applications, and schedule interviews—all directly on the platform.',
      icon: <ReadCvLogo size={32} />,
    },
    {
      title: 'Skill Development Workshops',
      description: 'Participate in live workshops hosted on Interact to learn new skills and upgrade your expertise.',
      icon: <Presentation size={32} />,
    },
    {
      title: 'Communities',
      description:
        'Join or create communities to share knowledge, engage in discussions, and collaborate on shared interests.',
      icon: <UsersThree size={32} />,
    },
    {
      title: 'Task Reminders',
      description: 'Stay on track with automated task reminder emails to ensure you never miss a deadline.',
      icon: <BellRinging size={32} />,
    },
  ],
  organisations: [
    {
      title: 'Project Management',
      description:
        'Unify your organization’s projects with a centralized platform for task tracking, GitHub and Figma integrations, resource sharing, and team-wide communication. Gain full visibility and streamline workflows for efficient collaboration',
      icon: <RocketLaunch size={32} />,
    },
    {
      title: 'Task Assignment',
      description:
        'Assign and manage tasks within the organization to ensure every member knows their responsibilities.',
      icon: <CheckSquareOffset size={32} />,
    },
    {
      title: 'Resource Management',
      description:
        'Centralize all organizational documents, presentations, and other resources for easy access and sharing.',
      icon: <Files size={32} />,
    },
    {
      title: 'Polls and Announcements',
      description: 'Engage your community with interactive polls and share important updates through announcements.',
      icon: <MegaphoneSimple size={32} />,
    },
    {
      title: 'Hackathon Analytics',
      description:
        'Use AI-driven insights to analyze team contributions, review code, and generate detailed reports for hackathon performance.',
      icon: <ProjectorScreenChart size={32} />,
    },
    {
      title: 'Workshop Hosting',
      description:
        'Conduct interactive workshops with participant tracking, transcripts, and recordings for a professional experience.',
      icon: <Presentation size={32} />,
    },
  ],
};

export const testimonials = [
  {
    name: 'Jack',
    username: '@jack',
    body: "I've never seen anything like this before. It's amazing. I love it.",
    img: 'https://avatar.vercel.sh/jack',
    social: 'twitter',
  },
  {
    name: 'Jill',
    username: '@jill',
    body: "I don't know what to say. I'm speechless. This is amazing.",
    img: 'https://avatar.vercel.sh/jill',
    social: 'instagram',
  },
  {
    name: 'Soha Jagtap',
    username: '@sohaj',
    body: 'The platform is so intuitive and easy to use. It has truly transformed the way I collaborate on projects.',
    img: 'https://avatar.vercel.sh/sohaj',
    social: 'linkedin',
  },
  {
    name: 'Pranay Batta',
    username: '@pranayb',
    body: 'Interact has everything I need in one place. Managing my team and events has never been easier.',
    img: 'https://avatar.vercel.sh/pranayb',
    social: 'facebook',
  },
  {
    name: 'Tejas Ghatte',
    username: '@tejasg',
    body: "It's incredible how much time and effort this platform saves me every day. Highly recommended!",
    img: 'https://avatar.vercel.sh/tejasg',
    social: 'twitter',
  },
  {
    name: 'Ishita Agarwal',
    username: '@ishita',
    body: 'The resource-sharing feature is my favorite. It keeps my team organized and efficient.',
    img: 'https://avatar.vercel.sh/ishita',
    social: 'instagram',
  },
  {
    name: 'Aryan Khanna',
    username: '@aryank',
    body: 'This is the perfect tool for students and organizations alike. I’ve already recommended it to my peers.',
    img: 'https://avatar.vercel.sh/aryank',
    social: 'facebook',
  },
  {
    name: 'Meera Nair',
    username: '@meeran',
    body: 'The GitHub integration is a game-changer. I can’t imagine managing projects without it now.',
    img: 'https://avatar.vercel.sh/meeran',
    social: 'linkedin',
  },
  {
    name: 'Rohan Mehta',
    username: '@rohanm',
    body: 'Interact makes collaborating on hackathons so smooth and productive. Love the analytics features!',
    img: 'https://avatar.vercel.sh/rohanm',
    social: 'twitter',
  },
  {
    name: 'Sanya Kapoor',
    username: '@sanyak',
    body: 'The event-hosting tools are just brilliant. The transcripts and recordings make life so much easier.',
    img: 'https://avatar.vercel.sh/sanyak',
    social: 'instagram',
  },
  {
    name: 'Devansh Arora',
    username: '@devansha',
    body: 'I’ve used many platforms, but Interact stands out for its user-friendliness and unique features.',
    img: 'https://avatar.vercel.sh/devansha',
    social: 'linkedin',
  },
  {
    name: 'Nisha Rao',
    username: '@nishar',
    body: 'As a club leader, I love how easy it is to manage tasks and communicate with my team on Interact.',
    img: 'https://avatar.vercel.sh/nishar',
    social: 'facebook',
  },
  {
    name: 'Karan Patel',
    username: '@karanp',
    body: 'The centralized management hub is fantastic. It’s helped us stay focused and on track.',
    img: 'https://avatar.vercel.sh/karanp',
    social: 'twitter',
  },
  {
    name: 'Ananya Sharma',
    username: '@ananyas',
    body: 'This platform is a lifesaver for students who juggle multiple projects and responsibilities.',
    img: 'https://avatar.vercel.sh/ananyas',
    social: 'instagram',
  },
  {
    name: 'Aakash Gupta',
    username: '@aakashg',
    body: 'I’ve never seen such a complete suite of tools for project management. Interact is amazing!',
    img: 'https://avatar.vercel.sh/aakashg',
    social: 'linkedin',
  },
];
