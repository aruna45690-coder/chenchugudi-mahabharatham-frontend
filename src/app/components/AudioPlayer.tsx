"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Music, Pause, Play, Volume2, VolumeX } from "lucide-react";

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Attempt to auto-play or just set up
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // gentle volume
    }
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="fixed top-36 left-4 md:left-8 z-50 flex items-center gap-3">
      <audio
        ref={audioRef}
        src="/govinda.mp3"
        loop
        autoPlay={false} // modern browsers block autoplay anyway
      />
      
      <motion.button
        onClick={togglePlay}
        className={`w-12 h-12 flex items-center justify-center rounded-full shadow-2xl transition-all ${
          isPlaying 
            ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#580000]" 
            : "bg-black/50 backdrop-blur-md border border-[#FFD700]/30 text-[#FFD700]"
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={isPlaying ? {
          boxShadow: ["0px 0px 0px 0px rgba(255, 215, 0, 0)", "0px 0px 20px 5px rgba(255, 215, 0, 0.4)", "0px 0px 0px 0px rgba(255, 215, 0, 0)"]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
      </motion.button>

      <motion.div 
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: isPlaying ? "auto" : 0, opacity: isPlaying ? 1 : 0 }}
        className="overflow-hidden flex items-center bg-black/40 backdrop-blur-md rounded-full border border-[#FFD700]/20 h-10"
      >
        <div className="flex items-center gap-3 px-4 w-max">
          <Music size={14} className="text-[#FFD700] animate-pulse" />
          <span className="text-xs font-semibold text-white/80 tracking-widest uppercase">Govinda Chant</span>
          <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors ml-2">
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
