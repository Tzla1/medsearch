import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface PreloaderProps {
  onComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const universityRef = useRef<HTMLParagraphElement>(null);
  const studentRef = useRef<HTMLParagraphElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        // Fade out complete preloader before calling onComplete
        gsap.to(preloaderRef.current, {
          opacity: 0,
          duration: 0.5,
          onComplete: onComplete
        });
      }
    });

    // Initial states
    gsap.set([logoRef.current, titleRef.current, universityRef.current, studentRef.current, progressRef.current], {
      opacity: 0,
      y: 30
    });

    gsap.set(progressBarRef.current, {
      width: '0%'
    });

    // Animation sequence
    tl.to(logoRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out"
    })
    .to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power3.out"
    }, "-=0.4")
    .to(universityRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power3.out"
    }, "-=0.3")
    .to(studentRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power3.out"
    }, "-=0.3")
    .to(progressRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: "power3.out"
    }, "-=0.2")
    .to(progressBarRef.current, {
      width: '100%',
      duration: 2,
      ease: "power2.inOut"
    }, "-=0.1")
    .to([logoRef.current, titleRef.current, universityRef.current, studentRef.current], {
      y: -20,
      opacity: 0.8,
      duration: 0.3,
      ease: "power2.inOut"
    }, "-=0.5");

  }, [onComplete]);

  return (
    <div
      ref={preloaderRef}
      className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-teal-600 z-50 flex flex-col items-center justify-center"
    >
      {/* Medical Cross Logo Animation */}
      <div
        ref={logoRef}
        className="mb-8 relative"
      >
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl">
          <div className="relative w-12 h-12">
            <div className="absolute top-1/2 left-1/2 w-8 h-2 bg-blue-600 transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-2 h-8 bg-blue-600 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>
        
        {/* Floating particles effect */}
        <div className="absolute -top-2 -right-2 w-3 h-3 bg-white rounded-full opacity-60 animate-ping"></div>
        <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-teal-300 rounded-full opacity-40 animate-ping" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Main Title */}
      <h1
        ref={titleRef}
        className="text-4xl md:text-5xl font-bold text-white text-center mb-6 tracking-wide"
      >
        MedSearch
      </h1>

      {/* University Information */}
      <p
        ref={universityRef}
        className="text-white/90 text-center text-sm md:text-base max-w-2xl px-4 mb-2 leading-relaxed font-medium"
      >
        PROYECTO DESARROLLADO PARA
      </p>
      
      <p
        ref={universityRef}
        className="text-white text-center text-lg md:text-xl max-w-2xl px-4 mb-4 leading-relaxed font-bold"
      >
        UNIVERSIDAD CUAUHTÉMOC PLANTEL GUADALAJARA
      </p>

      {/* Student Information */}
      <p
        ref={studentRef}
        className="text-teal-200 text-center text-base md:text-lg px-4 mb-6 font-semibold tracking-wide"
      >
        DANIEL JESDREEL MATA GÓMEZ
      </p>

      {/* Acknowledgments */}
      <div
        ref={studentRef}
        className="text-center px-4 mb-12 space-y-2"
      >
        <p className="text-white/80 text-sm italic">
          "Con colaboración de"
        </p>
        <p className="text-white/90 text-base font-medium">
          Irvin Alexis Jiménez Soto
        </p>
        <p className="text-white/60 text-xs mb-3">
          ────────────────
        </p>
        <p className="text-white/80 text-sm italic">
          "Asesorado por"
        </p>
        <p className="text-white/90 text-base font-medium">
          Ing. Cristian García Pérez
        </p>
        <p className="text-white/70 text-xs italic mt-2">
          Agradecimiento especial por la guía y mentoría
        </p>
      </div>

      {/* Progress Bar */}
      <div
        ref={progressRef}
        className="w-64 md:w-80 bg-white/20 rounded-full h-2 overflow-hidden backdrop-blur-sm"
      >
        <div
          ref={progressBarRef}
          className="h-full bg-gradient-to-r from-teal-400 to-blue-400 rounded-full relative"
        >
          <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
        </div>
      </div>

      {/* Loading text */}
      <p className="text-white/70 text-sm mt-4 animate-pulse">
        Cargando plataforma médica...
      </p>

      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 border border-white/10 rounded-full"></div>
      <div className="absolute bottom-10 right-10 w-24 h-24 border border-teal-300/20 rounded-full"></div>
      <div className="absolute top-1/2 left-5 w-16 h-16 border border-blue-300/15 rounded-full"></div>
      
      {/* Medical icons floating */}
      <div className="absolute top-20 right-20 text-white/10 text-2xl">
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </div>
      
      <div className="absolute bottom-32 left-16 text-white/10 text-2xl">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
};

export default Preloader;