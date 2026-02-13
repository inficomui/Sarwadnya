"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

import { useGetSlidersQuery } from "../../redux/apies/sliderApi";

const staticSlides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Shree Sarwadnya ",
    highlight: "All in one Solutions",
    subtitle:
      "Your trusted partner in All Services and Solutions.",
    link: ""
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Empowering Your Digital Growth",
    highlight: "Financial Solutions",
    subtitle:
      "We provide comprehensive strategies to optimize your wealth and streamline your business operations.",
    link: ""
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Expert Trading",
    highlight: "& Forex",
    subtitle:
      "Expert guidance in global markets, currency exchange, and diversified investment portfolios.",
    link: ""
  },
];
const Hero = () => {
  const { data: sliderData, isLoading } = useGetSlidersQuery();
  const slides: {
    id: number;
    image: string;
    title: string;
    highlight: string;
    subtitle: string;
    link?: string;
  }[] = sliderData?.length
      ? sliderData
        .filter((s) => s.status) // Only show active slides
        .sort((a, b) => a.order - b.order) // Sort by order
        .slice(0, 5)
        .map((s) => ({
          id: s.id,
          image: s.image,
          title: s.title,
          highlight: "",
          subtitle: s.description,
          link: s.link,
        }))
      : staticSlides;

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Animation Variants for Text Staggering
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
    exit: { opacity: 0 },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  if (isLoading) {
    return (
      <section className="relative h-[65vh] min-h-[550px] w-full bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-white/70 font-medium tracking-wide animate-pulse">Loading Experience...</p>
        </div>
      </section>
    );
  }

  return (
    // Height adjusted here: h-[60vh] to h-[70vh] is usually the sweet spot
    <section className="relative h-[65vh] min-h-[550px] w-full overflow-hidden bg-background font-sans">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={slides[currentSlide].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
            style={{
              backgroundImage: `url("${slides[currentSlide].image}")`,
            }}
          >
            <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/60 to-transparent" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center text-white">
        <div className="max-w-4xl pl-4 md:pl-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${currentSlide}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <motion.h1
                variants={itemVariants}
                className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
              >
                {slides[currentSlide].title}{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-amber-300">
                  {slides[currentSlide].highlight}
                </span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-gray-300 text-lg md:text-xl max-w-xl leading-relaxed font-light"
              >
                {slides[currentSlide].subtitle}
              </motion.p>

              <motion.div variants={itemVariants} className="pt-4">
                <a
                  href={slides[currentSlide]?.link || "#"}
                  className="group relative px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full overflow-hidden transition-all hover:bg-white hover:text-black hover:scale-105 flex items-center gap-3 w-fit"
                >
                  <span className="font-semibold tracking-wide">LEARN MORE</span>
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows (Glassmorphism Style) */}
      <div className="absolute right-4 md:right-12 bottom-12 z-20 flex gap-4">
        <button
          onClick={prevSlide}
          className="p-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/70 hover:bg-white hover:text-black transition-all hover:scale-110"
        >
          <ArrowLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="p-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/70 hover:bg-white hover:text-black transition-all hover:scale-110"
        >
          <ArrowRight size={24} />
        </button>
      </div>

      {/* Slide Indicators / Dots */}
      <div className="absolute bottom-12 left-8 md:left-10 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${currentSlide === index ? "bg-primary w-12" : "bg-white/30 w-6 hover:bg-white/60"
              }`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;