"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const DONORS = [
  { name: "Reddy Venkatesh", village: "Vedurukuppam", amount: "₹50,000" },
  { name: "Srinivasulu Naidu", village: "Pachikapalam", amount: "₹25,000" },
  { name: "Chenchugudi Youth", village: "Chenchugudi", amount: "₹1,00,000" },
  { name: "Ramana Reddy", village: "Tirupati", amount: "₹20,000" },
  { name: "Venkateswarlu", village: "Kalyanapuram", amount: "₹15,000" },
  { name: "Subramanyam", village: "G.D. Nellore", amount: "₹10,000" },
];

export default function DonorsSection({ lang }: { lang: "en" | "te" }) {
  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#580000] to-[#2a0000] border-y border-[#FFD700]/20">
      <div className="absolute inset-0 bg-[url('/images/mandala-bg.png')] opacity-5 bg-repeat opacity-5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#FFD700]" />
            <Star className="text-[#FFD700] fill-[#FFD700] w-5 h-5" />
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#FFD700]" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] drop-shadow-sm">
            {lang === 'en' ? 'Wall of Fame' : 'దాతల వివరాలు'}
          </h2>
          <p className="text-[#FFD700]/70 mt-4 max-w-2xl mx-auto font-medium">
            {lang === 'en' 
              ? 'We express our deepest gratitude to the generous devotees who made this grand festival possible.' 
              : 'ఈ మహాభారత మహోత్సవానికి విశేషంగా విరాళాలు అందించిన దాతలకు మా హృదయపూర్వక ధన్యవాదాలు.'}
          </p>
        </motion.div>

        {/* CSS Marquee Carousel */}
        <div className="flex overflow-hidden space-x-6 group py-8">
          <div className="flex space-x-6 animate-marquee group-hover:[animation-play-state:paused]">
            {[...DONORS, ...DONORS].map((donor, index) => (
              <div 
                key={index} 
                className="w-[280px] shrink-0 bg-gradient-to-br from-[#3a0000] to-[#580000] rounded-2xl p-6 border border-[#FFD700]/20 shadow-2xl relative overflow-hidden group-hover/card:border-[#FFD700]/50 transition-all"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFD700]/5 rounded-full blur-2xl -mr-10 -mt-10" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#E25822]/10 rounded-full blur-xl -ml-10 -mb-10" />
                
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{donor.name}</h3>
                    <p className="text-sm text-white/60 mb-4 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E25822]" />
                      {donor.village}
                    </p>
                  </div>
                  <div className="mt-auto inline-flex items-center gap-2 bg-[#FFD700]/10 border border-[#FFD700]/20 px-4 py-2 rounded-lg w-max">
                    <span className="text-lg font-black text-[#FFD700]">{donor.amount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
