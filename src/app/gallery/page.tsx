"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ChevronLeft, ChevronRight, X, ImageIcon } from "lucide-react";
import Link from "next/link";
import { getGalleryImages } from "@/lib/actions";
import FallingPetals from "../components/FallingPetals";

export default function GalleryPage() {
  const [lang, setLang] = useState<"en" | "te">("en");
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [activeEventTab, setActiveEventTab] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxItems, setLightboxItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all gallery data
  const loadData = useCallback(async () => {
    try {
      const galleryList = await getGalleryImages();
      setGalleryImages(galleryList);
    } catch (e) {
      console.error("Failed to load backend data:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Grouping gallery items by Year and then by eventName
  const getGroupedGallery = useCallback(() => {
    const groups: {
      year: number;
      events: {
        eventName: string;
        items: any[];
      }[];
    }[] = [];

    const sorted = [...galleryImages].sort((a, b) => {
      const timeA = new Date(a.eventDate).getTime();
      const timeB = new Date(b.eventDate).getTime();
      if (timeA !== timeB) return timeB - timeA; // Descending by date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    sorted.forEach((item) => {
      const year = new Date(item.eventDate).getFullYear();
      const eventNameStr = item.eventName || (lang === 'en' ? 'General' : 'సాధారణం');

      let yearGroup = groups.find((g) => g.year === year);
      if (!yearGroup) {
        yearGroup = { year, events: [] };
        groups.push(yearGroup);
      }

      let eventGroup = yearGroup.events.find((e) => e.eventName === eventNameStr);
      if (!eventGroup) {
        eventGroup = { eventName: eventNameStr, items: [] };
        yearGroup.events.push(eventGroup);
      }
      eventGroup.items.push(item);
    });

    // Sort years descending
    groups.sort((a, b) => b.year - a.year);
    return groups;
  }, [galleryImages, lang]);

  const openLightbox = (items: any[], index: number) => {
    setLightboxItems(items);
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    setLightboxItems([]);
    document.body.style.overflow = 'auto';
  };

  const showNextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (lightboxIndex !== null && lightboxItems.length > 0) {
      setLightboxIndex((lightboxIndex + 1) % lightboxItems.length);
    }
  };

  const showPrevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (lightboxIndex !== null && lightboxItems.length > 0) {
      setLightboxIndex((lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length);
    }
  };

  // Lightbox Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showNextImage();
      if (e.key === "ArrowLeft") showPrevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex]);

  return (
    <div className="min-h-screen bg-[#fffdf5] mandala-bg selection:bg-[#E25822] selection:text-white pb-24 text-gray-800 font-sans">
      <FallingPetals />
      
      {/* Top Header */}
      <div className="bg-[#3D0000] border-b border-[#FFD700]/20 sticky top-0 z-50 shadow-xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between relative">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-[#FFD700] transition-colors group z-10">
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm uppercase tracking-widest">{lang === 'en' ? 'Home' : 'హోమ్'}</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2 w-max">
            {[
              { href: '/#schedule', label: lang === 'en' ? 'Schedule' : 'పట్టిక' },
              { href: '/#programs', label: lang === 'en' ? 'Programs' : 'కార్యక్రమాలు' },
              { href: '/#donors', label: lang === 'en' ? 'Donors' : 'దాతలు' },
              { href: '/#villages', label: lang === 'en' ? 'Villages' : 'గ్రామాలు' },
            ].map(link => (
              <Link
                key={link.label}
                href={link.href}
                className="text-white/80 hover:text-[#FFD700] font-bold text-xs lg:text-sm uppercase tracking-wider transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 z-10">
            <button
              onClick={() => setLang(lang === 'en' ? 'te' : 'en')}
              className="px-4 py-1.5 rounded-full border border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10 text-xs font-bold uppercase tracking-wider transition-all"
            >
              {lang === 'en' ? 'తెలుగు' : 'English'}
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-center gap-4 mb-16 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-2 shadow-sm border border-orange-200">
            <ImageIcon size={32} className="text-[#E25822]" />
          </div>
          <h1 className="text-[#3D0000] font-black tracking-widest uppercase text-3xl md:text-5xl font-display">
            {lang === 'en' ? 'Official Media Archive' : 'అధికారిక మీడియా ఆర్కైవ్'}
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-[#E25822] to-transparent rounded-full mt-2"></div>
          <p className="text-gray-500 text-sm md:text-base mt-2 max-w-2xl">
            {lang === 'en'
              ? 'Explore the complete collection of divine moments, rituals, and celebrations from the Chenchugudi Mahabharatham Mahotsavam over the years.'
              : 'చెంచుగుడి మహాభారత మహోత్సవం యొక్క సంపూర్ణ ఫోటో మరియు వీడియో గ్యాలరీని అన్వేషించండి.'}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E25822]"></div>
          </div>
        ) : galleryImages.length > 0 ? (
          <div className="space-y-12">
            <div className="flex flex-wrap gap-3 justify-center border-b border-gray-200 pb-4">
              {getGroupedGallery().map((yearGroup) => {
                const isActiveYear = selectedYear === yearGroup.year || (!selectedYear && yearGroup.year === getGroupedGallery()[0]?.year);
                return (
                <button
                  key={yearGroup.year}
                  onClick={() => {
                    setSelectedYear(yearGroup.year);
                    setActiveEventTab(yearGroup.events[0]?.eventName || null);
                  }}
                  className={`px-6 py-2 rounded-full font-black text-sm md:text-base transition-all ${
                    isActiveYear
                      ? 'bg-[#E25822] text-white shadow-md scale-105'
                      : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  {yearGroup.year}
                </button>
              )})}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedYear}-${activeEventTab}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {(() => {
                  const activeYearData = getGroupedGallery().find((g) => g.year === selectedYear) || getGroupedGallery()[0];
                  if (!activeYearData) return null;
                  
                  const actualActiveEvent = activeEventTab && activeYearData.events.some(e => e.eventName === activeEventTab)
                    ? activeEventTab
                    : activeYearData.events[0]?.eventName;

                  const activeEventData = activeYearData.events.find(e => e.eventName === actualActiveEvent);

                  return (
                    <div className="space-y-8">
                      {activeYearData.events.length > 1 && (
                        <div className="flex flex-wrap justify-center gap-2 md:gap-4 bg-white/50 backdrop-blur-sm p-2 rounded-2xl md:rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.03)] border border-orange-100/50 max-w-4xl mx-auto">
                          {activeYearData.events.map((eventGroup) => (
                            <button
                              key={eventGroup.eventName}
                              onClick={() => setActiveEventTab(eventGroup.eventName)}
                              className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold tracking-widest uppercase transition-all duration-300 flex-1 min-w-[120px] md:flex-none ${
                                actualActiveEvent === eventGroup.eventName
                                  ? 'bg-[#580000] text-[#FFD700] shadow-md transform scale-105'
                                  : 'text-gray-600 bg-white/60 hover:bg-orange-100 hover:text-[#580000]'
                              }`}
                            >
                              {eventGroup.eventName}
                            </button>
                          ))}
                        </div>
                      )}

                      {activeEventData && (() => {
                        const isVideo = (img: any) => img.mediaType === 'YOUTUBE' || img.mediaType === 'VIDEO' || img.mediaType === 'video' || (img.videoUrl && img.videoUrl.trim() !== '') || (img.imageUrl && img.imageUrl.match(/\.(mp4|webm|ogg|mov)$/i));
                        const videos = activeEventData.items.filter(isVideo);
                        const photos = activeEventData.items.filter(img => !isVideo(img));

                        const getYoutubeThumbnail = (url: string) => {
                          if (!url) return '';
                          const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
                          const videoId = match ? match[1] : null;
                          return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
                        };

                        const renderMediaItem = (img: any, globalIdx: number) => (
                          <div
                            key={img.id}
                            onClick={() => openLightbox(activeEventData.items, globalIdx)}
                            className="break-inside-avoid bg-white border border-gray-100 rounded-2xl overflow-hidden group shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer relative mb-6"
                          >
                            {img.mediaType === 'YOUTUBE' ? (
                              <div className="w-full relative aspect-video bg-black">
                                <img src={getYoutubeThumbnail(img.videoUrl) || img.imageUrl} alt={img.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Play size={24} className="text-white ml-1" fill="white" />
                                  </div>
                                </div>
                              </div>
                            ) : isVideo(img) ? (
                              <div className="w-full relative aspect-video bg-black">
                                <video src={img.videoUrl || img.imageUrl} className="w-full h-full object-cover" preload="metadata" muted />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                                    <Play size={24} className="text-white ml-1" fill="white" />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <img src={img.imageUrl} alt={img.title} className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                            )}
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                              <p className="text-white font-bold text-sm leading-tight drop-shadow-md">
                                {img.title}
                              </p>
                            </div>
                          </div>
                        );

                        return (
                          <div className="space-y-12">
                            {videos.length > 0 && (
                              <div>
                                <h3 className="text-xl md:text-2xl font-black text-[#580000] mb-6 flex items-center gap-3 border-l-4 border-orange-500 pl-4 uppercase tracking-widest">
                                  <Play size={22} className="text-[#E25822]" />
                                  {lang === 'en' ? 'Videos' : 'వీడియోలు'}
                                </h3>
                                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
                                  {videos.map((img) => renderMediaItem(img, activeEventData.items.indexOf(img)))}
                                </div>
                              </div>
                            )}

                            {photos.length > 0 && (
                              <div>
                                <h3 className="text-xl md:text-2xl font-black text-[#580000] mb-6 flex items-center gap-3 border-l-4 border-orange-500 pl-4 uppercase tracking-widest">
                                  <ImageIcon size={22} className="text-[#E25822]" />
                                  {lang === 'en' ? 'Photos' : 'ఫోటోలు'}
                                </h3>
                                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
                                  {photos.map((img) => renderMediaItem(img, activeEventData.items.indexOf(img)))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <ImageIcon className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-bold">{lang === 'en' ? 'No media found.' : 'ఎలాంటి మీడియా కనుగొనబడలేదు.'}</p>
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && lightboxItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl"
            onClick={closeLightbox}
          >
            <div className="absolute top-4 right-4 md:top-6 md:right-6 flex gap-4 z-10">
              <button
                onClick={closeLightbox}
                className="w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 border border-white/10"
              >
                <X size={24} />
              </button>
            </div>

            <button
              onClick={showPrevImage}
              className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 z-10 border border-white/10"
            >
              <ChevronLeft size={30} />
            </button>

            <button
              onClick={showNextImage}
              className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 z-10 border border-white/10"
            >
              <ChevronRight size={30} />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const item = lightboxItems[lightboxIndex];
                const isYoutube = item.mediaType === 'YOUTUBE';
                const isVideo = item.mediaType === 'VIDEO' || item.mediaType === 'video' || (item.videoUrl && item.videoUrl.trim() !== '') || (item.imageUrl && item.imageUrl.match(/\.(mp4|webm|ogg|mov)$/i));

                if (isYoutube) {
                  return (
                    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black shadow-2xl">
                      <iframe
                        src={`https://www.youtube.com/embed/${item.videoUrl?.split('v=')[1] || item.videoUrl?.split('/').pop()}?autoplay=1`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  );
                } else if (isVideo) {
                  return (
                    <div className="w-full max-h-[75vh] flex items-center justify-center">
                      <video
                        src={item.videoUrl || item.imageUrl}
                        className="max-w-full max-h-[75vh] rounded-xl shadow-2xl object-contain bg-black"
                        controls
                        autoPlay
                      />
                    </div>
                  );
                } else {
                  return (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
                    />
                  );
                }
              })()}

              <div className="mt-6 text-center max-w-2xl px-4">
                <h3 className="text-white text-xl md:text-2xl font-bold tracking-wide drop-shadow-md">
                  {lightboxItems[lightboxIndex].title}
                </h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
