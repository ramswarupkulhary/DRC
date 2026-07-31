"use client";

import { FadeIn, StaggerContainer, StaggerItem, SlideIn } from "@/components/ui/Animations";
import { motion } from "framer-motion";

export function AnimatedPageHeader({ children }: { children: React.ReactNode }) {
  return <FadeIn>{children}</FadeIn>;
}

export function AnimatedGrid({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <StaggerContainer className={className} staggerDelay={0.1}>
      {children}
    </StaggerContainer>
  );
}

export function AnimatedGridItem({ children }: { children: React.ReactNode }) {
  return <StaggerItem>{children}</StaggerItem>;
}

export function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return <FadeIn delay={delay} className={className}>{children}</FadeIn>;
}

export function AnimatedSlide({ children, from = "left", className = "" }: { children: React.ReactNode; from?: "left" | "right"; className?: string }) {
  return <SlideIn from={from} className={className}>{children}</SlideIn>;
}

export function HoverCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
    >
      {children}
    </motion.div>
  );
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}
