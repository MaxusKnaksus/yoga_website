"use client";

import Image from "next/image";
import ThreeScene from "./components/ThreeScene";
import { useEffect, useState } from "react";

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const mainContainer = document.querySelector('[data-scroll-container]');
      if (mainContainer) {
        const scrollHeight = mainContainer.scrollHeight;
        const scrollTop = mainContainer.scrollTop;
        const clientHeight = mainContainer.clientHeight;
        
        // Calculate smooth continuous progress based on scroll position
        const maxScroll = scrollHeight - clientHeight;
        const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
        
        // Calculate current section (0-10 for 11 sections)
        const sectionHeight = clientHeight;
        const currentSection = Math.min(Math.floor(scrollTop / sectionHeight), 10);
        
        setScrollProgress(progress);
        setCurrentSection(currentSection);
      }
    };

    const mainContainer = document.querySelector('[data-scroll-container]');
    if (mainContainer) {
      mainContainer.addEventListener('scroll', handleScroll);
      // Call once to set initial value
      handleScroll();
      return () => mainContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-zinc-50 font-sans dark:bg-black">
      {/* Left side - 3D Scene (sticky/fixed in portrait) */}
      <div className="h-1/2 md:h-screen w-full md:w-1/2 sticky md:sticky top-0 md:top-0 z-10">
        <ThreeScene scrollProgress={scrollProgress} currentSection={currentSection} />
      </div>
      
      {/* Right side - Text content with scroll snap */}
      <div 
        data-scroll-container
        className="h-1/2 md:h-screen w-full md:w-1/2 bg-white dark:bg-black overflow-y-auto overscroll-contain snap-y snap-mandatory scroll-smooth divide-y divide-zinc-200 dark:divide-zinc-800" 
      >
        {/* Section 1: Header */}
        
        <section className="h-full md:h-screen snap-start flex items-center px-8 md:px-16">
          <div className="max-w-2xl w-full">
            {/*
            <Image
              className="dark:invert mb-8"
              src="/next.svg"
              alt="Next.js logo"
              width={100}
              height={20}
              priority
            />
          */}
            
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-black dark:text-zinc-50 mb-6">
              Learning Robotics made simple!
            </h1>
            <p className="text-xl leading-8 text-zinc-600 dark:text-zinc-400">
              A ROS2 Education Toolkit              
            </p>
          </div>
        </section>

        {/* Section 2: Buttons */}
        <section className="h-full md:h-screen snap-start flex items-center px-8 md:px-16">
          <div className="max-w-2xl w-full">
            <div className="flex flex-col gap-4 text-base font-medium">
              <a
                className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
                href="https://sfz-bw.de/ueberlingen"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/*
                <Image
                  className="dark:invert"
                  src="/vercel.svg"
                  alt="Vercel logomark"
                  width={16}
                  height={16}
                />
                */}
                Our research center
              </a>
              <a
                className="flex h-14 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
                href="mailto:ros-edu@web.de"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contact us directly
              </a>
            </div>
          </div>
        </section>

        {/* Section 3: About the Robot */}
        <section className="h-full md:h-screen snap-start flex items-center px-8 md:px-16">
          <div className="max-w-2xl w-full">
            <h2 className="text-3xl font-semibold text-black dark:text-zinc-50 mb-6">
              About the Robot
            </h2>
            <p className="text-xl leading-relaxed text-zinc-600 dark:text-zinc-400">
              A modular, ready-to-use platform that brings real-world robotics into the classroom
            </p>
          </div>
        </section>

        {/* Section 4: The Laptop*/}
        <section className="h-full md:h-screen snap-start flex items-center px-8 md:px-16">
          <div className="max-w-2xl w-full">
            <h3 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
              The Brain - Laptop
            </h3>
            <p className="text-xl leading-relaxed text-zinc-600 dark:text-zinc-400">
              Connected via a single USB-C cable.
            </p>
            <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              Any modern laptop works instantly - plug it in and you're ready to go
            </p>
          </div>
        </section>

        {/* Section 5: Static Site Generation */}
        <section className="h-full md:h-screen snap-start flex items-center px-8 md:px-16">
          <div className="max-w-2xl w-full">
            <h3 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
              The Vision - Camera
            </h3>
            <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              Students can experiment with AI-based image recognition <br></br>
              The system implements newest AI-technology like YOLOE
            </p>
          </div>
        </section>

        {/* Section 6: API Routes */}
        <section className="h-full md:h-screen snap-start flex items-center px-8 md:px-16">
          <div className="max-w-2xl w-full">
            <h3 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
              The 6th sense - The LiDAR
            </h3>
            <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              Used for mapping, navigation and environment awareness to enable autonomous systems
            </p>
          </div>
        </section>

        {/* Section 7: Code Splitting */}
        <section className="h-full md:h-screen snap-start flex items-center px-8 md:px-16">
          <div className="max-w-2xl w-full">
            <h3 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
              The Engine
            </h3>
            <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              Two industrial servo motors create a differential drive system
            </p>
          </div>
        </section>

        {/* Section 8: Built-in CSS */}
        <section className="h-full md:h-screen snap-start flex items-center px-8 md:px-16">
          <div className="max-w-2xl w-full">
            <h3 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
              The core - LiPo Power
            </h3>
            <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              The battery provides a compact and rechargeable power solution
            </p>
          </div>
        </section>

        {/* Section 9: Image Optimization */}
        <section className="h-full md:h-screen snap-start flex items-center px-8 md:px-16">
          <div className="max-w-2xl w-full">
            <h3 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
              A platform for learning 
            </h3>
            <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              Built to make robotics accessible, safe and practical for every classroom.
              Everything is open, modular and ready-to-use.
            </p>
          </div>
        </section>

        {/* Section 10: Getting Started
        <section className="h-full md:h-screen snap-start flex items-center px-8 md:px-16">
          <div className="max-w-2xl w-full">
            <h2 className="text-3xl font-semibold text-black dark:text-zinc-50 mb-6">
              AI-integration
            </h2>
            <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 mb-6">
              ...
            </p>
            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-6 font-mono text-base">
              <code className="text-zinc-900 dark:text-zinc-100">
                YoloE-11s
              </code>
            </div>
          </div>
        </section>

        {/* Section 11: Learn More *
        <section className="h-full md:h-screen snap-start flex items-center px-8 md:px-16">
          <div className="max-w-2xl w-full">
            <h2 className="text-3xl font-semibold text-black dark:text-zinc-50 mb-6">
              dedictive reductiom
            </h2>
            <p className="text-xl leading-relaxed text-zinc-600 dark:text-zinc-400">
              ros launch übersicht, ...
            </p>
          </div>
        </section> */}
      </div>
    </div>
  );
}
