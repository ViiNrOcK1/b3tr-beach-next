// src/components/Mission.tsx
'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import Footer from '@/components/Footer';

export default function Mission() {
  // Use HTMLElement[] to support <div>, <h2>, etc.
  const sectionRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    sectionRefs.current.forEach((el) => {
      if (el instanceof Element) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* ==== MAIN SECTION ==== */}
      <section
        className="relative min-h-screen bg-contain bg-center bg-fixed py-32 text-white overflow-x-hidden"
        style={{ backgroundImage: "url('/assets/InkyandRanger.png')" }}
      >
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="relative z-20 container mx-auto px-6 max-w-7xl">

          {/* The Bad... */}
          <h2
            className="text-5xl md:text-6xl font-playfair font-bold mb-20"
            ref={(el) => {
              if (el) sectionRefs.current.push(el);
            }}
          >
            {"The Bad...".split('').map((char, i) => (
              <span
                key={i}
                className="letter"
                style={{ transitionDelay: `${("The Bad...".length - 1 - i) * 50}ms` }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h2>

          {/* Row 1 */}
          <div
            className="flex flex-col md:flex-row items-center gap-12 mb-32 opacity-0 translate-x-[-60px] transition-all duration-1000"
            ref={(el) => {
              if (el) sectionRefs.current.push(el);
            }}
          >
            <div className="flex-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image src="/assets/PlasticTurtle.jpg" alt="Sea turtle entangled in plastic" width={600} height={420} className="w-full h-auto object-cover" />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="text-2xl font-bold text-teal-300">Wildlife Suffocation & Entanglement</h3>
              <p className="text-lg leading-relaxed">
                Over <strong>1 million seabirds</strong> and <strong>100,000 marine mammals</strong> die annually from plastic ingestion and entanglement. Sea turtles mistake plastic bags for jellyfish, leading to fatal blockages.
              </p>
            </div>
          </div>

          {/* Row 2 */}
          <div
            className="flex flex-col md:flex-row-reverse items-center gap-12 mb-32 opacity-0 translate-x-[60px] transition-all duration-1000"
            ref={(el) => {
              if (el) sectionRefs.current.push(el);
            }}
          >
            <div className="flex-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image src="/assets/riverlitter.jpg" alt="Polluted river with litter" width={600} height={420} className="w-full h-auto object-cover" />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="text-2xl font-bold text-teal-300">Waterway Contamination</h3>
              <p className="text-lg leading-relaxed">
                Plastic pollution and general litter are devastating our natural world. This waste chokes wildlife, pollutes waterways, and degrades the quality of life for communities. Microplastics now contaminate <strong>88% of ocean surface areas</strong> and have entered the human food chain.
              </p>
            </div>
          </div>

          {/* Row 3 */}
          <div
            className="flex flex-col md:flex-row items-center gap-12 mb-32 opacity-0 translate-x-[-60px] transition-all duration-1000"
            ref={(el) => {
              if (el) sectionRefs.current.push(el);
            }}
          >
            <div className="flex-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image src="/assets/ecocollapse.jpg" alt="Suffering wildlife" width={600} height={420} className="w-full h-auto object-cover" />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="text-2xl font-bold text-teal-300">Terrestrial Ecosystem Collapse</h3>
              <p className="text-lg leading-relaxed">
                Land animals ingest plastic debris, causing internal injuries and starvation. Toxic chemicals leach into soil, harming plant growth and contaminating crops.
              </p>
            </div>
          </div>

          {/* The Ugly... */}
          <h2
            className="text-5xl md:text-6xl font-playfair font-bold mb-20"
            ref={(el) => {
              if (el) sectionRefs.current.push(el);
            }}
          >
            {"The Ugly...".split('').map((char, i) => (
              <span key={i} className="letter" style={{ transitionDelay: `${i * 50}ms` }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h2>

          {/* Row 4 */}
          <div
            className="flex flex-col md:flex-row-reverse items-center gap-12 mb-32 opacity-0 translate-x-[60px] transition-all duration-1000"
            ref={(el) => {
              if (el) sectionRefs.current.push(el);
            }}
          >
            <div className="flex-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image src="/assets/garbagepatch.webp" alt="Great Pacific Garbage Patch" width={600} height={420} className="w-full h-auto object-cover" />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="text-2xl font-bold text-teal-300">The Great Pacific Garbage Patch</h3>
              <p className="text-lg leading-relaxed">
                This floating trash mass is <strong>twice the size of Texas</strong>. Plastic outnumbers plankton 6:1 in core zones. Marine life is trapped in a toxic soup.
              </p>
            </div>
          </div>

          {/* Row 5 */}
          <div
            className="flex flex-col md:flex-row items-center gap-12 mb-32 opacity-0 translate-x-[-60px] transition-all duration-1000"
            ref={(el) => {
              if (el) sectionRefs.current.push(el);
            }}
          >
            <div className="flex-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image src="/assets/pollutedkids.jpg" alt="Children near polluted water" width={600} height={420} className="w-full h-auto object-cover" />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="text-2xl font-bold text-teal-300">Human Health Crisis</h3>
              <p className="text-lg leading-relaxed">
                Communities near polluted rivers face <strong>cancer, hormonal disruption, and neurological disorders</strong>. Children are most vulnerable to microplastic exposure.
              </p>
            </div>
          </div>

          {/* The Good... */}
          <h2
            className="text-5xl md:text-6xl font-playfair font-bold mb-20 text-right"
            ref={(el) => {
              if (el) sectionRefs.current.push(el);
            }}
          >
            {"The Good...".split('').map((char, i) => (
              <span
                key={i}
                className="letter"
                style={{ transitionDelay: `${("The Good...".length - 1 - i) * 50}ms` }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h2>

          {/* Row 6 */}
          <div
            className="flex flex-col md:flex-row-reverse items-center gap-12 mb-32 opacity-0 translate-x-[60px] transition-all duration-1000"
            ref={(el) => {
              if (el) sectionRefs.current.push(el);
            }}
          >
            <div className="flex-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image src="/images/good-fund.jpg" alt="Community cleanup funded by B3TR" width={600} height={420} className="w-full h-auto object-cover" />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="text-2xl font-bold text-teal-300">Our Solution: The "Impact Fund" Model</h3>
              <p className="text-lg leading-relaxed">
                B3TR Beach acts as an <strong>impact agency</strong> — funding and empowering local organizations already on the ground.
              </p>
              <ul className="list-none space-y-3 mt-4">
                <li className="flex items-start"><span className="text-teal-300 mr-2">•</span> <strong>Fundraising:</strong> Public donations, corporate ESG, and grants</li>
                <li className="flex items-start"><span className="text-teal-300 mr-2">•</span> <strong>Grant Distribution:</strong> Micro-grants + supplies (gloves, bags, disposal)</li>
                <li className="flex items-start"><span className="text-teal-300 mr-2">•</span> <strong>Educational Outreach:</strong> Free mascot-led programs for schools</li>
              </ul>
            </div>
          </div>

          {/* Row 7 */}
          <div
            className="flex flex-col md:flex-row items-center gap-12 mb-32 opacity-0 translate-x-[-60px] transition-all duration-1000"
            ref={(el) => {
              if (el) sectionRefs.current.push(el);
            }}
          >
            <div className="flex-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image src="/images/inky-ranger.jpg" alt="Inky and Ranger Bear mascots" width={600} height={420} className="w-full h-auto object-cover" />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="text-2xl font-bold text-teal-300">Youth Engagement: The Mascot Program</h3>
              <p className="text-lg leading-relaxed">
                We <strong>prevent future pollution through education</strong> using fun, memorable mascots.
              </p>
              <ul className="list-none space-y-3 mt-4">
                <li className="flex items-start"><span className="text-teal-300 mr-2">•</span> <strong>Inky the Octopus:</strong> Ocean Advocate in storybooks & digital content</li>
                <li className="flex items-start"><span className="text-teal-300 mr-2">•</span> <strong>Ranger Bear:</strong> Hosts cleanups, turns kids into "Rangers"</li>
              </ul>
            </div>
          </div>

          {/* Row 8 */}
          <div
            className="flex flex-col md:flex-row-reverse items-center gap-12 mb-32 opacity-0 translate-x-[60px] transition-all duration-1000"
            ref={(el) => {
              if (el) sectionRefs.current.push(el);
            }}
          >
            <div className="flex-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <video autoPlay muted loop playsInline className="w-full h-auto object-cover">
                  <source src="/videos/good-cleanup.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="text-2xl font-bold text-teal-300">Sustainable Funding for Lasting Impact</h3>
              <ul className="list-none space-y-3">
                <li className="flex items-start"><span className="text-teal-300 mr-2">•</span> <strong>Public Donations:</strong> Crowdfunding & "Sponsor-a-Cleanup"</li>
                <li className="flex items-start"><span className="text-teal-300 mr-2">•</span> <strong>Corporate Partnerships:</strong> ESG funding from local (Devon) & national brands</li>
                <li className="flex items-start"><span className="text-teal-300 mr-2">•</span> <strong>Grants:</strong> Major environmental foundations</li>
                <li className="flex items-start"><span className="text-teal-300 mr-2">•</span> <strong>Eco-Merch:</strong> 100% profits fund cleanups</li>
              </ul>
              <p className="mt-4 text-lg">
                <strong>Every cleanup removes 50–200 lbs of trash.</strong> Volunteers have restored 50+ miles of coastline. Schools see <strong>40% recycling increases</strong> post-program.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div
            className="text-center mt-20 space-x-6 opacity-0 translate-y-10 transition-all duration-1000"
            ref={(el) => {
              if (el) sectionRefs.current.push(el);
            }}
          >
            <a href="/" className="inline-block bg-teal-300 text-gray-900 font-bold py-4 px-8 rounded-full hover:bg-white transition-all shadow-lg hover:shadow-xl">
              Home Page
            </a>
            <a href="/donations" className="inline-block bg-teal-300 text-gray-900 font-bold py-4 px-8 rounded-full hover:bg-white transition-all shadow-lg hover:shadow-xl">
              Donate Now
            </a>
          </div>

        </div>
      </section>

      {/* ==== FOOTER ==== */}
      <Footer />

      {/* ==== GLOBAL STYLES ==== */}
      <style jsx global>{`
        .letter {
          display: inline-block;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease;
        }
        .animate-in .letter {
          opacity: 1;
          transform: translateY(0);
        }
        .animate-in {
          opacity: 1 !important;
          transform: translateX(0) translateY(0) !important;
        }
        .font-playfair { font-family: 'Playfair Display', serif; }

        @keyframes wave {
          0%   { background-position-x: 0; }
          100% { background-position-x: 1440px; }
        }
        .wave-top {
          position: relative;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 120'%3E%3Cpath fill='%23f59e0b' d='M0,0C240,60,480,120,720,90C960,60,1200,0,1440,0V120H0V0Z'/%3E%3C/svg%3E");
          background-repeat: repeat-x;
          background-size: 1440px 120px;
          animation: wave 12s linear infinite;
        }
        .fade-content {
          animation: fade-in 1s ease-out forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}