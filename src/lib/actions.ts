"use server";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { auth, clerkClient } from "@clerk/nextjs/server";
import { headers } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// ── Check if the currently logged in user is a whitelisted Admin ─────────
export async function checkAdminStatus() {
  try {
    const authObject = await auth();
    if (!authObject.userId) {
      return { isAdmin: false };
    }

    const client = await clerkClient();
    const user = await client.users.getUser(authObject.userId);
    const primaryEmail = user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId
    )?.emailAddress;

    const allowedEmailsStr = process.env.ADMIN_ALLOWED_EMAILS || "";
    const allowedEmails = allowedEmailsStr
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);

    if (allowedEmails.length === 0) {
      return { isAdmin: true };
    }

    const isAdmin = !!primaryEmail && allowedEmails.includes(primaryEmail.toLowerCase());
    return { isAdmin };
  } catch (error) {
    console.error("Error in checkAdminStatus server action:", error);
    return { isAdmin: false };
  }
}

// ── Helper to extract IP address safely from headers ───────────────────
async function getClientIp(): Promise<string> {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    return (
      headersList.get("x-real-ip") || 
      headersList.get("cf-connecting-ip") || 
      "127.0.0.1"
    );
  } catch (e) {
    return "127.0.0.1";
  }
}

// ── Festival Schedule & Donors ─────────────────────────────────────────
export async function getActiveFestivalYear() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/festival/active`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch active festival year");
    return await res.json();
  } catch (error) {
    console.error("Error fetching active festival year:", error);
    return null;
  }
}

// ── Stats for the homepage ────────────────────────────────────────────
export async function getStats() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/stats`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed to fetch stats");
    return await res.json();
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { activeAnnouncements: 0, villages: 24 };
  }
}

// ── Announcements ─────────────────────────────────────────────────────
export async function getAnnouncements() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/announcements`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch announcements");
    return await res.json();
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
}

export async function getAllAnnouncements() {
  try {
    const { isAdmin } = await checkAdminStatus();
    if (!isAdmin) return [];
    const res = await fetch(`${BACKEND_URL}/api/announcements?all=true`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch all announcements");
    return await res.json();
  } catch (error) {
    console.error("Error fetching all announcements:", error);
    return [];
  }
}

export async function createAnnouncement(title: string, titleTe: string, body: string, bodyTe: string, isActive: boolean = true) {
  try {
    const { isAdmin } = await checkAdminStatus();
    if (!isAdmin) throw new Error("Unauthorized");

    const res = await fetch(`${BACKEND_URL}/api/announcements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, titleTe, body, bodyTe, isActive }),
    });
    if (!res.ok) throw new Error("Failed to create announcement");
    const announcement = await res.json();
    return { success: true, announcement };
  } catch (error) {
    console.error("Error creating announcement:", error);
    throw error;
  }
}

export async function deleteAnnouncement(id: number) {
  try {
    const { isAdmin } = await checkAdminStatus();
    if (!isAdmin) throw new Error("Unauthorized");

    const res = await fetch(`${BACKEND_URL}/api/announcements/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete announcement");
    return { success: true };
  } catch (error) {
    console.error("Error deleting announcement:", error);
    throw error;
  }
}

export async function updateAnnouncement(id: number, title: string, titleTe: string, body: string, bodyTe: string) {
  try {
    const { isAdmin } = await checkAdminStatus();
    if (!isAdmin) throw new Error("Unauthorized");

    const res = await fetch(`${BACKEND_URL}/api/announcements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, titleTe, body, bodyTe }),
    });
    if (!res.ok) throw new Error("Failed to update announcement");
    const announcement = await res.json();
    return { success: true, announcement };
  } catch (error) {
    console.error("Error updating announcement:", error);
    throw error;
  }
}

export async function toggleAnnouncement(id: number, isActive: boolean) {
  try {
    const { isAdmin } = await checkAdminStatus();
    if (!isAdmin) throw new Error("Unauthorized");

    const res = await fetch(`${BACKEND_URL}/api/announcements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    if (!res.ok) throw new Error("Failed to toggle announcement");
    return await res.json();
  } catch (error) {
    console.error("Error in toggleAnnouncement server action:", error);
    throw error;
  }
}

// ── Gallery images ────────────────────────────────────────────────────
export async function getGalleryImages(limit?: number) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/gallery`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch gallery");
    let images = await res.json();
    if (limit) images = images.slice(0, limit);
    return images;
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return [];
  }
}

export async function uploadGalleryImage(formData: FormData) {
  try {
    const { isAdmin } = await checkAdminStatus();
    if (!isAdmin) throw new Error("Unauthorized");

    const res = await fetch(`${BACKEND_URL}/api/gallery`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to upload gallery image");
    }
    return await res.json();
  } catch (error) {
    console.error("Error in uploadGalleryImage server action:", error);
    throw error;
  }
}

export async function deleteGalleryImage(id: number) {
  try {
    const { isAdmin } = await checkAdminStatus();
    if (!isAdmin) throw new Error("Unauthorized");

    const res = await fetch(`${BACKEND_URL}/api/gallery/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete image");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteGalleryImage server action:", error);
    throw error;
  }
}

// ── Record user page view for Daily Active User metrics ────────────────
export async function recordPageView() {
  try {
    const ipAddress = await getClientIp();
    const res = await fetch(`${BACKEND_URL}/api/visits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ipAddress }),
    });
    if (!res.ok) throw new Error("Failed to record visit");
    return await res.json();
  } catch (error) {
    console.error("Error in recordPageView:", error);
    return { success: false, error: String(error) };
  }
}

// ── Submit Like/Dislike feedback ───────────────────────────────────────
export async function submitFeedback(isLike: boolean) {
  try {
    const ipAddress = await getClientIp();
    const res = await fetch(`${BACKEND_URL}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isLike, ipAddress }),
    });
    if (!res.ok) throw new Error("Failed to submit feedback");
    return await res.json();
  } catch (error) {
    console.error("Error in submitFeedback:", error);
    return { success: false, error: String(error) };
  }
}

// ── Fetch feedback status for the current user ────────────────────────
export async function getUserFeedbackStatus() {
  try {
    const ipAddress = await getClientIp();
    const res = await fetch(`${BACKEND_URL}/api/feedback/status?ipAddress=${encodeURIComponent(ipAddress)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to get feedback status");
    return await res.json();
  } catch (error) {
    console.error("Error in getUserFeedbackStatus:", error);
    return { success: false, error: String(error) };
  }
}

// ── Get analytics data for Admin Dashboard ────────────────────────────
export async function getAnalyticsStats() {
  try {
    const { isAdmin } = await checkAdminStatus();
    if (!isAdmin) throw new Error("Unauthorized");

    const res = await fetch(`${BACKEND_URL}/api/analytics`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch analytics");
    return await res.json();
  } catch (error) {
    console.error("Error in getAnalyticsStats:", error);
    return {
      success: false,
      totalUniqueVisitors: 0,
      likes: 0,
      dislikes: 0,
      dauList: [],
    };
  }
}

// ── Fetch Global Site Settings (Live Stream) ──────────────────────────
export async function getLiveStreamSettings() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/live-stream`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch live stream settings");
    return await res.json();
  } catch (error) {
    console.error("Error in getLiveStreamSettings:", error);
    return { success: false, liveStreamUrl: "", liveStreamPlatform: "youtube", isLiveActive: false };
  }
}

// ── Update Global Site Settings (Live Stream) ─────────────────────────
export async function updateLiveStreamSettings(url: string, platform: string, isActive: boolean) {
  try {
    const { isAdmin } = await checkAdminStatus();
    if (!isAdmin) {
      return { success: false, error: "Unauthorized" };
    }

    const res = await fetch(`${BACKEND_URL}/api/live-stream`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, platform, isActive }),
    });
    if (!res.ok) throw new Error("Failed to update live stream settings");
    return await res.json();
  } catch (error) {
    console.error("Error in updateLiveStreamSettings:", error);
    return { success: false, error: String(error) };
  }
}
