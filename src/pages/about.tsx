import React from 'react';
import Image from 'next/image';

const about = () => {
  return (
    <>
      {/* // ---------------------------------Header--------------------------------- */}
      <div>
        <header className="text-[#673AB7] body-font">
          <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
            <a className="flex title-font font-medium items-center text-white mb-4 md:mb-0">
              <Image src="/logo.svg" alt="" width={100} height={100} />
              <span className="ml-3 text-xl">Interact</span>
            </a>
            <nav className="md:ml-auto md:mr-auto flex flex-wrap items-center text-base justify-center gap-24">
              <a className="mr-5 font-semibold">FEATURE</a>
              <a className="mr-5 font-semibold">DISCOVER</a>
              <a className="mr-5 font-semibold">COMMUNITY</a>
              <a className="mr-5 font-semibold">SOCIALS</a>
            </nav>
            <button className="inline-flex items-center bg-[#673AB7] text-white rounded-3xl border-0 py-2 px-7 focus:outline-none text-base mt-4 md:mt-0">
              Login
            </button>
          </div>
        </header>
      </div>
      {/* // ---------------------------------Hero Section --------------------------------- */}

      <section className="text-black body-font">
        <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
          <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
            <h1 className="title-font sm:text-4xl text-3xl mb-4 text-black font-bold">Lorem ipsum dolor sit amet</h1>
            <p className="mb-8 leading-relaxed text-gray-500 font-semibold">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
            </p>
            <div className="flex justify-center"></div>
          </div>
          <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6">
            <Image
              className="object-cover object-center rounded"
              alt="hero"
              src="https://dummyimage.com/720x600"
              width={720}
              height={600}
            />
          </div>
        </div>
      </section>
      {/* ---------------------------------Features--------------------------------- */}
      <section className="text-gray-400 body-font">
        <div className="container px-5 py-24 mx-auto">
          <div className="text-center mb-20">
            <h1 className="sm:text-3xl text-2xl font-medium title-font text-black mb-4">Features</h1>
            <div className="flex mt-6 justify-center">
              <div className="w-16 h-1 rounded-full bg-indigo-500 inline-flex"></div>
            </div>
          </div>
          <div className="flex flex-wrap sm:-m-4 -mx-4 -mb-10 -mt-4 md:space-y-0 space-y-6">
            <div className="p-4 md:w-1/3 flex flex-col text-center items-center">
              <div className="w-20 h-20 inline-flex items-center justify-center rounded-full bg-gray-800 text-indigo-400 mb-5 flex-shrink-0">
                <svg
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  className="w-10 h-10"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
              </div>
              <div className="flex-grow">
                <h2 className="text-black text-lg title-font font-medium mb-3">Project Collaboration Hub</h2>
                <p className="leading-relaxed text-base">
                  Our platform serves as a dedicated hub for individuals and teams to showcase their ongoing projects.
                  Whether you&apos;re a developer, designer, writer, or any other creative or technical professional,
                  you can post your projects and connect with like-minded individuals eager to contribute their skills
                  and expertise. It&apos;s the ideal space to find the perfect collaborators to bring your ideas to
                  life.
                </p>
                <a className="mt-3 text-indigo-400 inline-flex items-center">
                  Learn More
                  <svg
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    className="w-4 h-4 ml-2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7"></path>
                  </svg>
                </a>
              </div>
            </div>
            <div className="p-4 md:w-1/3 flex flex-col text-center items-center">
              <div className="w-20 h-20 inline-flex items-center justify-center rounded-full text-indigo-400 mb-5 flex-shrink-0">
                <svg
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  className="w-10 h-10"
                  viewBox="0 0 24 24"
                >
                  <circle cx="6" cy="6" r="3"></circle>
                  <circle cx="6" cy="18" r="3"></circle>
                  <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"></path>
                </svg>
              </div>
              <div className="flex-grow">
                <h2 className="text-black text-lg title-font font-medium mb-3">Skill-Matching Algorithm</h2>
                <p className="leading-relaxed text-base">
                  We&apos;ve implemented a cutting-edge skill-matching algorithm that helps you find the most suitable
                  collaborators for your projects. Simply input the details of your project, including required skills
                  and expertise, and our platform will suggest potential collaborators who match your project&apos;s
                  needs. Say goodbye to the hassle of manual search, and say hello to efficient project partnerships.
                </p>
                <a className="mt-3 text-indigo-400 inline-flex items-center">
                  Learn More
                  <svg
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    className="w-4 h-4 ml-2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7"></path>
                  </svg>
                </a>
              </div>
            </div>
            <div className="p-4 md:w-1/3 flex flex-col text-center items-center">
              <div className="w-20 h-20 inline-flex items-center justify-center rounded-full bg-gray-800 text-indigo-400 mb-5 flex-shrink-0">
                <svg
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  className="w-10 h-10"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="flex-grow">
                <h2 className="text-black text-lg title-font font-medium mb-3">
                  Transparent Communication and Feedback
                </h2>
                <p className="leading-relaxed text-base">
                  We believe in fostering a collaborative and open environment. Our platform provides integrated
                  communication tools to facilitate seamless interactions between project creators and collaborators.
                  You can discuss project details, share files, and provide feedback directly within the platform.
                  Additionally, our feedback system ensures transparency and accountability, helping you build trust
                  with your collaborators.
                </p>
                <a className="mt-3 text-indigo-400 inline-flex items-center">
                  Learn More
                  <svg
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    className="w-4 h-4 ml-2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ---------------------------------Testimonials--------------------------------- */}
      <section className="text-gray-400 body-font">
        <div className="text-center mb-20">
          <h1 className="sm:text-3xl text-2xl font-medium title-font text-black mb-4">Why Interact</h1>
          <div className="flex justify-center">
            <div className="w-16 h-1 rounded-full bg-indigo-500 inline-flex"></div>
          </div>
        </div>
        <div className="container px-5 py-6 mx-auto">
          <div className="flex flex-wrap -m-4">
            <div className="lg:w-1/2 lg:mb-0 mb-6 p-4">
              <div className="h-full text-center">
                <Image
                  src="https://dummyimage.com/302x302"
                  className="w-20 h-20 mb-8 object-cover object-center rounded-full inline-block border-2 border-gray-800 bg-gray-800 bg-opacity-10"
                  alt=""
                  width={100}
                  height={100}
                />
                <p className="leading-relaxed">
                  Interact was born from a simple belief: collaboration is the catalyst for innovation. We created this
                  platform to make collaboration effortless and connections meaningful. Interact is where projects find
                  their perfect partners, ideas come to life, and creativity knows no bounds. Join us in reshaping the
                  future through the power of collaboration.
                </p>
                <span className="inline-block h-1 w-10 rounded bg-indigo-500 mt-6 mb-4"></span>
                <h2 className="text-black font-medium title-font tracking-wider text-sm">Pratham Mishra </h2>
              </div>
            </div>
            <div className="lg:w-1/2 lg:mb-0 mb-6 p-4">
              <div className="h-full text-center">
                <Image
                  alt="testimonial"
                  className="w-20 h-20 mb-8 object-cover object-center rounded-full inline-block border-2 border-gray-800 bg-gray-800 bg-opacity-10"
                  src="https://dummyimage.com/300x300"
                  width={100}
                  height={100}
                />
                <p className="leading-relaxed">
                  At Interact, your user experience is our top priority. Every aspect of our platform, from design to
                  interaction, is meticulously crafted to enhance your journey. We believe that a seamless and intuitive
                  user interface makes your collaboration effortless and enjoyable. Join us in creating a beautiful and
                  user-centric future for your projects.
                </p>
                <span className="inline-block h-1 w-10 rounded bg-indigo-500 mt-6 mb-4"></span>
                <h2 className="text-black font-medium title-font tracking-wider text-sm">Anshika Batra</h2>
              </div>
            </div>
            <div className="lg:w-1/2 lg:mb-0 mb-6 p-4">
              <div className="h-full text-center">
                <Image
                  alt="testimonial"
                  className="w-20 h-20 mb-8 object-cover object-center rounded-full inline-block border-2 border-gray-800 bg-gray-800 bg-opacity-10"
                  src="https://dummyimage.com/305x305"
                  width={100}
                  height={100}
                />
                <p className="leading-relaxed">
                  At Interact, our commitment to content goes beyond words. We&apos;ve designed this platform to be the
                  canvas for your creative ideas, where content creators and collaborators can effortlessly come
                  together. Our investment in cutting-edge tools and resources ensures that your content projects shine
                  brightly. Join us in redefining content creation through the power of collaboration.
                </p>
                <span className="inline-block h-1 w-10 rounded bg-indigo-500 mt-6 mb-4"></span>
                <h2 className="text-black font-medium title-font tracking-wider text-sm">Soha Jagtap</h2>
              </div>
            </div>
            <div className="lg:w-1/2 lg:mb-0 mb-6 p-4">
              <div className="h-full text-center">
                <Image
                  alt="testimonial"
                  className="w-20 h-20 mb-8 object-cover object-center rounded-full inline-block border-2 border-gray-800 bg-gray-800 bg-opacity-10"
                  src="https://dummyimage.com/300x300"
                  width={100}
                  height={100}
                />
                <p className="leading-relaxed">
                  At Interact, we&apos;re passionate about making collaboration effortless for you. We invest in
                  technology and resources to ensure that your collaborative efforts are not just innovative but also
                  financially sound. Join us in reshaping the future through the power of collaboration.
                </p>
                <span className="inline-block h-1 w-10 rounded bg-indigo-500 mt-6 mb-4"></span>
                <h2 className="text-black font-medium title-font tracking-wider text-sm">Anubhav Aryan</h2>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ---------------------------------Footer--------------------------------- */}
      <footer className="text-gray-400 bg-gray-900 body-font">
        <div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
          <a className="flex title-font font-medium items-center md:justify-start justify-center text-white">
            <Image src="/logo.svg" alt="" width={30} height={30} />

            <span className="ml-3 text-xl">Interact </span>
          </a>
          <p className="text-sm text-gray-400 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-800 sm:py-2 sm:mt-0 mt-4">
            © 2023 Interact
          </p>
          <span className="inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start">
            <a className="text-gray-400"></a>
            <a className="ml-3 text-gray-400" href="">
              <svg
                fill="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                className="w-5 h-5"
                viewBox="0 0 24 24"
              >
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
              </svg>
            </a>
            <a className="ml-3 text-gray-400" href="">
              <svg
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                className="w-5 h-5"
                viewBox="0 0 24 24"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"></path>
              </svg>
            </a>
            <a className="ml-3 text-gray-400" href="">
              <svg
                fill="currentColor"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="0"
                className="w-5 h-5"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="none"
                  d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"
                ></path>
                <circle cx="4" cy="4" r="2" stroke="none"></circle>
              </svg>
            </a>
          </span>
        </div>
      </footer>
    </>
  );
};

export default about;
