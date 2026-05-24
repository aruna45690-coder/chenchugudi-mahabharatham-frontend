/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function FallingPetals() {
  const [petals, setPetals] = useState<{id: number, x: number, delay: number, duration: number, size: number, rotation: number, offset: number}[]>([]);

  useEffect(() => {
    const newPetals = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage of screen width
      delay: Math.random() * 5, // 0-5 seconds
      duration: 10 + Math.random() * 20,
      size: 15 + Math.random() * 25,
      rotation: Math.random() * 360,
      offset: Math.random() * 10 - 5,
    }));
    setPetals(newPetals);
  }, []);

  if (petals.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute text-[#FFD700] opacity-30"
          initial={{
            top: "-5%",
            left: `${petal.x}%`,
            rotate: 0,
          }}
          animate={{
            top: "110%",
            left: `${petal.x + petal.offset}%`,
            rotate: petal.rotation + 360,
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ fontSize: petal.size }}
        >
          {/* Marigold petal character or dot */}
          ❀
        </motion.div>
      ))}
    </div>
  );
}
