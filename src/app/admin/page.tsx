 
// src/app/admin/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element, react-hooks/set-state-in-effect */
"use client";

import { motion } from "framer-motion";
import { 
  LayoutDashboard, Users, Image as ImageIcon, 
  Settings, LogOut, TrendingUp, Bell, Menu, Upload, RefreshCw,
  ThumbsUp, ThumbsDown, Eye
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useUser, useClerk, UserButton } from "@clerk/nextjs";
import { getGalleryImages, uploadGalleryImage, deleteGalleryImage, getStats, getAnalyticsStats, getLiveStreamSettings, updateLiveStreamSettings } from "@/lib/actions";
interface Stats {
  activeAnnouncements: number;
  villages: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsStats, setAnalyticsStats] = useState<{
    totalUniqueVisitors: number;
    likes: number;
    dislikes: number;
    dauList: Array<{ date: string; count: number }>;
  } | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  
  // Live Stream states
  const [liveStreamUrl, setLiveStreamUrl] = useState("");
  const [liveStreamPlatform, setLiveStreamPlatform] = useState("youtube");
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [savingLiveStream, setSavingLiveStream] = useState(false);

  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  // Gallery states
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [eventDate, setEventDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [eventName, setEventName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sendingPush, setSendingPush] = useState(false);

  const handleSendPushNotification = async () => {
    if (!confirm("Are you sure you want to send a Live notification to all subscribers?")) return;
    
    setSendingPush(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '🔴 We are LIVE NOW!',
          message: 'The Chenchugudi Mahabharatham Festival Live Stream has started. Tap here to watch!',
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
      } else {
        alert('Failed: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error sending push notifications');
    } finally {
      setSendingPush(false);
    }
  };

  const displayName = user?.firstName || user?.username || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "Admin";

  const fetchGallery = useCallback(async () => {
    setGalleryLoading(true);
    try {
      const images = await getGalleryImages();
      setGalleryImages(images);
    } catch (err) {
      console.error("Failed to fetch gallery images:", err);
    } finally {
      setGalleryLoading(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setAnalyticsLoading(true);
    try {
      const statsData = await getStats();
      setStats(statsData);
      
      const analyticsData = await getAnalyticsStats();
      if (analyticsData.success) {
        setAnalyticsStats(analyticsData as any);
      }
      
      const liveStreamData = await getLiveStreamSettings();
      if (liveStreamData.success) {
        setLiveStreamUrl(liveStreamData.liveStreamUrl || "");
        setLiveStreamPlatform(liveStreamData.liveStreamPlatform || "youtube");
        setIsLiveActive(liveStreamData.isLiveActive || false);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchGallery();
  }, [fetchData, fetchGallery]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    await uploadFile(file);
    e.target.value = ""; // Clear file input
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", file.name.split(".")[0] || "Chenchugudi Mahabharatham Media");
    formData.append("uploadedBy", displayName);
    formData.append("eventDate", eventDate);
    if (eventName.trim()) {
      formData.append("eventName", eventName.trim());
    }

    try {
      await uploadGalleryImage(formData);
      await fetchGallery();
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleDeleteImage = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteGalleryImage(id);
      await fetchGallery();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete image.");
    }
  };

  const handleSaveLiveStream = async () => {
    setSavingLiveStream(true);
    try {
      await updateLiveStreamSettings(liveStreamUrl, liveStreamPlatform, isLiveActive);
      alert("Live Stream settings saved successfully!");
    } catch (error) {
      console.error("Failed to save live stream settings", error);
      alert("Failed to save settings.");
    } finally {
      setSavingLiveStream(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex-col flex transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 h-screen`}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-[#8B0000] flex items-center gap-2">
              <LayoutDashboard size={24} /> Admin
            </h2>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Mahabharatham Festival</p>
          </div>
          <button className="md:hidden text-gray-400 hover:text-gray-600" onClick={() => setIsSidebarOpen(false)}>✕</button>
        </div>
 
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: "overview", icon: <TrendingUp size={20} />, label: "Overview" },
            { id: "gallery", icon: <ImageIcon size={20} />, label: "Manage Gallery" },
            { id: "settings", icon: <Settings size={20} />, label: "Settings" },
          ].map((item) => (
            <button
               key={item.id}
               onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${
                 activeTab === item.id ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:bg-gray-50"
               }`}
            >
               {item.icon} {item.label}
            </button>
          ))}
        </nav>
 
        <div className="p-4 border-t border-gray-100 space-y-2">
          <Link href="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors">
            ← Back to Site
          </Link>
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>
 
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 md:py-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <button className="md:hidden p-2 text-gray-500 bg-gray-100 rounded-lg" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <h1 className="text-xl md:text-2xl font-bold capitalize">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => { fetchData(); fetchGallery(); }}
              title="Refresh data"
              className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
            >
              <RefreshCw size={18} className={loading || galleryLoading ? "animate-spin" : ""} />
            </button>
            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <UserButton />
          </div>
        </header>
 
        {/* Dashboard Content */}
        <div className="p-8 flex-1 overflow-y-auto bg-gray-50/50">
 
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-6xl mx-auto">
              
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-black text-gray-800">
                    Welcome back, {isLoaded ? displayName : "Admin"} 👋
                  </h2>
                  <p className="text-gray-500">Here&apos;s what&apos;s happening with the festival today.</p>
                </div>
                <a
                  href="/api/seed"
                  target="_blank"
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-orange-600 transition-colors text-sm"
                >
                  🌱 Seed Demo Data
                </a>
              </div>
 
              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Announcements */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5 hover:border-[#8B0000] transition-colors">
                  <div className="p-4 bg-green-50 text-green-600 rounded-xl shrink-0"><Bell size={24} /></div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Announcements</p>
                    <p className="text-2xl font-black text-gray-800">
                      {loading ? "—" : (stats?.activeAnnouncements ?? 0)}
                    </p>
                  </div>
                </div>

                {/* Participating Villages */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5 hover:border-[#8B0000] transition-colors">
                  <div className="p-4 bg-orange-50 text-orange-600 rounded-xl shrink-0"><Users size={24} /></div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Villages</p>
                    <p className="text-2xl font-black text-gray-800">
                      {loading ? "—" : (stats?.villages ?? 24)}
                    </p>
                  </div>
                </div>

                {/* Unique Visitors */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5 hover:border-[#8B0000] transition-colors">
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-xl shrink-0"><Eye size={24} /></div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Unique Visitors</p>
                    <p className="text-2xl font-black text-gray-800">
                      {analyticsLoading ? "—" : (analyticsStats?.totalUniqueVisitors ?? 0)}
                    </p>
                  </div>
                </div>

                {/* Likes Ratio / Feedback */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5 hover:border-[#8B0000] transition-colors">
                  <div className="p-4 bg-amber-50 text-amber-600 rounded-xl shrink-0"><ThumbsUp size={24} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Devotee Feedback</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-black text-gray-800">
                        {analyticsLoading ? "—" : `${(analyticsStats?.likes ?? 0) + (analyticsStats?.dislikes ?? 0) > 0 ? Math.round(((analyticsStats?.likes ?? 0) / ((analyticsStats?.likes ?? 0) + (analyticsStats?.dislikes ?? 0))) * 100) : 0}%`}
                      </p>
                      <span className="text-[10px] text-gray-400 font-bold">Likes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Analytics Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Daily Active Users (DAU) List Panel */}
                <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <div>
                      <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                        <TrendingUp size={20} className="text-[#8B0000]" />
                        Daily Active Visitors
                      </h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Last 7 Days unique IP logs</p>
                    </div>
                    <span className="text-xs font-black bg-green-50 text-green-700 px-3 py-1.5 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Live Stats
                    </span>
                  </div>

                  {analyticsLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3">
                      <RefreshCw size={28} className="text-[#8B0000] animate-spin" />
                      <p className="text-sm text-gray-400 font-bold">Fetching client logs...</p>
                    </div>
                  ) : !analyticsStats?.dauList || analyticsStats.dauList.length === 0 ? (
                    <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-3">
                      <TrendingUp size={36} className="text-gray-300" />
                      <p className="text-sm font-bold">No visitor tracking logs found yet.</p>
                      <p className="text-xs text-gray-400">Visitor counts will appear as soon as devotees visit the home page.</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {analyticsStats.dauList.map((day) => {
                        // Format date nicely
                        const dateObj = new Date(day.date);
                        const formattedDate = isNaN(dateObj.getTime()) 
                          ? day.date 
                          : dateObj.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

                        return (
                          <div key={day.date} className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-2xl transition-all group">
                            <div className="flex items-center gap-3.5">
                              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs uppercase tracking-wider shrink-0 group-hover:bg-[#8B0000]/10 group-hover:text-[#8B0000] transition-colors">
                                {isNaN(dateObj.getTime()) ? "📅" : dateObj.toLocaleDateString(undefined, { day: '2-digit' })}
                              </div>
                              <div>
                                <p className="font-black text-gray-800 text-sm">{formattedDate}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Date stamp: {day.date}</p>
                              </div>
                            </div>
                            <span className="bg-[#8B0000]/5 text-[#8B0000] border border-[#8B0000]/10 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider">
                              {day.count} unique visitor{day.count === 1 ? "" : "s"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Devotee Feedback & Rating Details Panel */}
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between gap-6">
                  <div className="space-y-4">
                    <div className="border-b border-gray-100 pb-4">
                      <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                        <ThumbsUp size={20} className="text-[#8B0000]" />
                        Website Feedback
                      </h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Liking stats by unique IP</p>
                    </div>

                    {analyticsLoading ? (
                      <div className="py-12 text-center text-gray-400 font-bold">Calculating rating...</div>
                    ) : (
                      <div className="space-y-6">
                        {/* Rating Circle or percentage display */}
                        <div className="flex flex-col items-center justify-center p-6 bg-amber-50/50 rounded-3xl border border-amber-100 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-5 text-amber-500">
                            <ThumbsUp size={100} />
                          </div>
                          
                          {(() => {
                            const likes = analyticsStats?.likes ?? 0;
                            const dislikes = analyticsStats?.dislikes ?? 0;
                            const total = likes + dislikes;
                            const percent = total > 0 ? Math.round((likes / total) * 100) : 0;
                            
                            return (
                              <>
                                <span className="text-4xl md:text-5xl font-black text-[#8B0000]">{percent}%</span>
                                <span className="text-xs font-black text-amber-700 uppercase tracking-widest mt-1">Approval Rating</span>
                                <span className="text-[10px] text-gray-400 font-bold mt-2">{total} total response{total === 1 ? "" : "s"}</span>
                              </>
                            );
                          })()}
                        </div>

                        {/* Progress Bars */}
                        <div className="space-y-4">
                          {(() => {
                            const likes = analyticsStats?.likes ?? 0;
                            const dislikes = analyticsStats?.dislikes ?? 0;
                            const total = likes + dislikes;
                            const likesPercent = total > 0 ? (likes / total) * 100 : 0;
                            const dislikesPercent = total > 0 ? (dislikes / total) * 100 : 0;

                            return (
                              <>
                                {/* Likes Progress */}
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-green-600 flex items-center gap-1.5"><ThumbsUp size={14} /> Like</span>
                                    <span className="text-gray-700">{likes} ({Math.round(likesPercent)}%)</span>
                                  </div>
                                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-500" 
                                      style={{ width: `${likesPercent}%` }}
                                    />
                                  </div>
                                </div>

                                {/* Dislikes Progress */}
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-red-500 flex items-center gap-1.5"><ThumbsDown size={14} /> Dislike</span>
                                    <span className="text-gray-700">{dislikes} ({Math.round(dislikesPercent)}%)</span>
                                  </div>
                                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-rose-400 to-red-500 rounded-full transition-all duration-500" 
                                      style={{ width: `${dislikesPercent}%` }}
                                    />
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#8B0000]/5 border border-[#8B0000]/10 p-4 rounded-2xl text-center">
                    <p className="text-xs text-[#8B0000] font-black uppercase tracking-wider">Devotional Platform Feedback</p>
                    <p className="text-[10px] text-gray-500 font-bold mt-1">
                      Devotee liking votes are securely restricted to one vote per unique connection/IP address.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
 
          {/* GALLERY TAB */}
          {activeTab === "gallery" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm max-w-4xl mx-auto">
              <h2 className="text-xl font-bold mb-6">Upload New Festival Photos & Videos</h2>
              
              {uploadError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center justify-between text-sm">
                  <span className="font-medium">{uploadError}</span>
                  <button onClick={() => setUploadError(null)} className="text-red-500 hover:text-red-700 font-bold ml-2">Dismiss</button>
                </div>
              )}

              {/* Event Date & Name Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="event-date" className="block text-sm font-bold text-gray-700 mb-2">
                    Event Date
                  </label>
                  <input
                    type="date"
                    id="event-date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-medium transition-colors outline-none"
                    disabled={uploading}
                  />
                </div>
                <div>
                  <label htmlFor="event-name" className="block text-sm font-bold text-gray-700 mb-2">
                    కార్యక్రమం / Event Name
                  </label>
                  <select
                    id="event-name"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-medium transition-colors outline-none"
                    disabled={uploading}
                  >
                  <option value="">-- కార్యక్రమం ఎంచుకోండి / Select Event --</option>
                    <optgroup label="ముఖ్య కార్యక్రమాలు (Main Events)">
                      <option value="ధ్వజారోహణము">ధ్వజారోహణము — Dhwajarohanamu (Flag Hoisting) 🚩</option>
                      <option value="బండి కుంభాలు">బండి కుంభాలు — Bandi Kumballu (Sacred Pots Chariot Ceremony) 🎡</option>
                      <option value="ద్రౌపది కళ్యాణం">ద్రౌపది కళ్యాణం — Draupadi Kalyanam (Wedding Ceremony) 💛</option>
                      <option value="రాత్రి ద్రౌపది మాన సంరక్షణ">రాత్రి ద్రౌపది మాన సంరక్షణ — Draupadi Mana Samrakshana (Night Protection of Honour) ⚔️</option>
                      <option value="అర్జున తపస్సు కార్యక్రమం">అర్జున తపస్సు కార్యక్రమం — Arjuna Tapassu (Penance Ceremony) 🙏</option>
                      <option value="కీచకవధ">కీచకవధ — Keechaka Vadha (Slaying of Keechaka) 🗡️</option>
                      <option value="ఉత్తరగోగ్రహణం">ఉత్తరగోగ్రహణం — Uttaragograhanam (Cattle Retrieval Ceremony) 🐄</option>
                      <option value="ఇలావంతుని బలి">ఇలావంతుని బలి — Ilavantuni Bali (Ritual Sacrifice) 🔱</option>
                      <option value="ధుర్యోధన వధ">ధుర్యోధన వధ — Duryodhana Vadha (Slaying of Duryodhana) ⚔️</option>
                      <option value="అగ్గిగుండ ప్రవేశం">అగ్గిగుండ ప్రవేశం — Aggigunda Pravesham (Sacred Fire Walk 🔥, Entry ₹100)</option>
                      <option value="ధర్మరాజుల పట్టాభిషేకము">ధర్మరాజుల పట్టాభిషేకము — Dharmarajula Pattabhishekamu (Royal Coronation) 👑</option>
                    </optgroup>
                    <optgroup label="రోజువారీ కార్యక్రమాలు (Daily Events)">
                      <option value="హరికథా కార్యక్రమం">హరికథా కార్యక్రమం — Harikatha Programme (Afternoon మ.1–సా.5) 🎶</option>
                      <option value="రాత్రి నాటకం">రాత్రి నాటకం — Night Drama · Sri Venkateswara Nataka Kalamandali 🎭</option>
                      <option value="యాగం / పూజ">యాగం / పూజ — Yagam / Pooja (Daily Ritual) 🪔</option>
                      <option value="అన్నదానం">అన్నదానం — Annadanam (Sacred Food Distribution) 🍛</option>
                    </optgroup>
                    <optgroup label="ఇతర కార్యక్రమాలు (Other)">
                      <option value="సాధారణ ఫోటో">సాధారణ ఫోటో — General Photo 📷</option>
                      <option value="సభ">సభ — Sabha / Meeting / Gathering 🏛️</option>
                      <option value="అమ్మవారి కళ్యాణం">అమ్మవారి కళ్యాణం — Ammavari Kalyanam 🌸</option>
                      <option value="శ్రీ మహాభారతయుళ్ళ శ్రీకారము">శ్రీ మహాభారతయుళ్ళ శ్రీకారము — Inauguration Ceremony 🪔</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div className="relative mb-8">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,video/*"
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload"
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`p-10 bg-gray-50 rounded-2xl border-2 border-dashed mb-4 flex flex-col items-center justify-center transition-all cursor-pointer group ${
                    dragActive
                      ? "border-orange-500 bg-orange-50/50 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
                      : "border-gray-300 hover:bg-gray-100/70 hover:border-orange-400"
                  } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    {uploading ? (
                      <RefreshCw size={32} className="text-orange-500 animate-spin" />
                    ) : (
                      <Upload size={32} className="text-orange-500" />
                    )}
                  </div>
                  {uploading ? (
                    <h3 className="text-lg font-bold text-gray-700">Uploading to Cloudinary...</h3>
                  ) : (
                    <>
                      <h3 className="text-lg font-bold text-gray-700">
                        {dragActive ? "Drop your files now!" : "Drag & Drop Photos/Videos Here"}
                      </h3>
                      <p className="text-sm text-gray-500 mt-2 max-w-md text-center">
                        Upload high quality festival images or videos. Max size 10MB.
                      </p>
                      <span className="mt-6 bg-[#8B0000] text-white px-8 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all inline-block">
                        Browse Files
                      </span>
                    </>
                  )}
                </label>
              </div>

              <h3 className="text-lg font-bold mb-4">Recent Uploads</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {galleryLoading && galleryImages.length === 0 ? (
                  // Skeletons
                  [1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-xl border border-gray-200 animate-pulse flex items-center justify-center text-gray-300">
                      <ImageIcon size={32} className="animate-pulse" />
                    </div>
                  ))
                ) : galleryImages.length === 0 ? (
                  <div className="col-span-full py-16 text-center bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center">
                    <ImageIcon size={48} className="text-gray-300 mb-3" />
                    <p className="font-bold text-gray-500">No media uploaded yet</p>
                    <p className="text-sm text-gray-400 mt-1">Upload the first photo or video to start the gallery.</p>
                  </div>
                ) : (
                  galleryImages.map((image) => (
                    <div key={image.id} className="aspect-square bg-gray-100 rounded-xl border border-gray-200 relative overflow-hidden group shadow-sm">
                      {image.mediaType === 'video' ? (
                        <div className="w-full h-full relative">
                          <video
                            src={image.imageUrl}
                            className="w-full h-full object-cover"
                            preload="metadata"
                            muted
                            playsInline
                          />
                          {/* Play button overlay */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="p-3 bg-black/50 rounded-full text-white backdrop-blur-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
                                <polygon points="5 3 19 12 5 21 5 3"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      ) : (
                         
                        <img
                          src={image.imageUrl}
                          alt={image.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      )}
                      
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                        <div>
                          <p className="text-white text-xs font-bold truncate" title={image.title}>
                            {image.title}
                          </p>
                          {image.eventName && (
                            <p className="text-orange-300 text-[10px] font-bold mt-0.5 truncate">
                              🎬 {image.eventName}
                            </p>
                          )}
                          <p className="text-gray-300 text-[9px] mt-0.5">
                            📅 {new Date(image.eventDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex justify-between items-center mt-auto">
                          <span className="text-[10px] text-gray-300 truncate max-w-[60%]">
                            By {image.uploadedBy}
                          </span>
                          <button
                            onClick={() => handleDeleteImage(image.id)}
                            className="text-white text-[10px] font-bold bg-red-600 hover:bg-red-700 px-2.5 py-1 rounded-full shadow transition-colors shrink-0"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}



          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm max-w-2xl mx-auto space-y-6">
              <h2 className="text-xl font-bold">Settings</h2>
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <p className="font-bold text-orange-800 mb-1">🌱 Seed Demo Data</p>
                <p className="text-sm text-orange-700 mb-3">Populate the database with default announcements and clean state for your site.</p>
                <a
                  href="/api/seed"
                  target="_blank"
                  className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors"
                >
                  Run Seed →
                </a>
              </div>
              
              {/* Live Stream Settings */}
              <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="font-bold text-red-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                      Live Stream Management
                    </p>
                    <p className="text-sm text-red-700">Display a live YouTube video on the homepage for devotees to watch.</p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={isLiveActive}
                        onChange={(e) => setIsLiveActive(e.target.checked)}
                      />
                      <div className={`block w-14 h-8 rounded-full transition-colors ${isLiveActive ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isLiveActive ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                  </label>
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="md:w-1/3">
                      <label className="block text-sm font-bold text-red-800 mb-2">Platform</label>
                      <select 
                        value={liveStreamPlatform}
                        onChange={(e) => setLiveStreamPlatform(e.target.value)}
                        className="w-full px-4 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                      >
                        <option value="youtube">YouTube</option>
                        <option value="facebook">Facebook</option>
                        <option value="twitch">Twitch</option>
                        <option value="instagram">Instagram</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-red-800 mb-2">URL or Video ID</label>
                      <input 
                        type="text" 
                        placeholder="e.g. https://www.youtube.com/watch?v=..." 
                        value={liveStreamUrl}
                        onChange={(e) => setLiveStreamUrl(e.target.value)}
                        className="w-full px-4 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleSaveLiveStream}
                    disabled={savingLiveStream}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors"
                  >
                    {savingLiveStream ? "Saving..." : "Save Settings"}
                  </button>

                  <div className="mt-6 pt-4 border-t border-red-200">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h4 className="font-bold text-red-800">Send Live Notification</h4>
                        <p className="text-xs text-red-700">Push a notification to all subscribers instantly to let them know we are Live.</p>
                      </div>
                      <button 
                        onClick={handleSendPushNotification}
                        disabled={sendingPush || !isLiveActive}
                        className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-md transition-all whitespace-nowrap"
                      >
                        {sendingPush ? "Sending..." : "🚀 Send Push Notification"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="font-bold text-blue-800 mb-1">👤 Your Account</p>
                <p className="text-sm text-blue-700 mb-1">Logged in as: <strong>{user?.primaryEmailAddress?.emailAddress}</strong></p>
                <p className="text-sm text-blue-700">Manage your profile via the avatar button in the top-right corner.</p>
              </div>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}

