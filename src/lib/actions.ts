 
/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { prisma } from "./prisma";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

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

// ── Stats for the homepage ────────────────────────────────────────────
export async function getStats() {
  try {
    const announcementCount = await prisma.announcement.count({ where: { isActive: true } });
    return {
      activeAnnouncements: announcementCount,
      villages: 24,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      activeAnnouncements: 0,
      villages: 24,
    };
  }
}

// ── Announcements ─────────────────────────────────────────────────────
export async function getAnnouncements() {
  try {
    const announcements = await prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return announcements;
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
}

// ── Gallery images ────────────────────────────────────────────────────
export async function getGalleryImages() {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: [
        { eventDate: 'asc' },
        { createdAt: 'asc' }
      ],
    });
    return images;
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return [];
  }
}

// ── Toggle announcement ───────────────────────────────────────────────
export async function toggleAnnouncement(id: number, isActive: boolean) {
  try {
    const announcement = await prisma.announcement.update({
      where: { id },
      data: { isActive },
    });
    return announcement;
  } catch (error) {
    console.error("Error in toggleAnnouncement server action:", error);
    throw error;
  }
}

// ── Upload gallery image ──────────────────────────────────────────────
export async function uploadGalleryImage(formData: FormData) {
  try {
    const title = formData.get("title")?.toString() || "Chenchugudi Mahabharatham";
    const uploadedBy = formData.get("uploadedBy")?.toString() || "Admin";
    const eventName = formData.get("eventName")?.toString() || null;
    const eventDateStr = formData.get("eventDate")?.toString();
    const eventDate = eventDateStr ? new Date(eventDateStr) : new Date();
    
    const file = formData.get("image") as File;
    if (!file) throw new Error("No image file provided");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(base64Data, { folder: "chenchugudi-festival" }, (error, result) => {
        if (error) reject(error);
        else resolve(result as { secure_url: string; public_id: string });
      });
    }) as { secure_url: string; public_id: string };

    const newImage = await prisma.galleryImage.create({
      data: {
        title,
        imageUrl: result.secure_url,
        publicId: result.public_id,
        uploadedBy,
        eventDate,
        eventName,
      },
    });

    return newImage;
  } catch (error) {
    console.error("Error in uploadGalleryImage server action:", error);
    throw error;
  }
}

// ── Delete gallery image ──────────────────────────────────────────────
export async function deleteGalleryImage(id: number) {
  try {
    const image = await prisma.galleryImage.findUnique({ where: { id } });
    if (!image) throw new Error("Image not found");

    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    await prisma.galleryImage.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("Error in deleteGalleryImage server action:", error);
    throw error;
  }
}

// Helper to extract IP address safely from headers
async function getClientIp(): Promise<string> {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    if (forwardedFor) {
      // Extract the first IP if multiple are present in proxy chain
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

// ── Record user page view for Daily Active User metrics ────────────────
export async function recordPageView() {
  try {
    const ipAddress = await getClientIp();
    
    // Get current local date in YYYY-MM-DD format
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const visitDate = `${yyyy}-${mm}-${dd}`;

    try {
      await prisma.userVisit.create({
        data: {
          ipAddress,
          visitDate,
        },
      });
      return { success: true, isNewToday: true };
    } catch (dbError: unknown) {
      // Catch unique constraint (already visited today) and return success
      return { success: true, isNewToday: false };
    }
  } catch (error) {
    console.error("Error in recordPageView:", error);
    return { success: false, error: String(error) };
  }
}

// ── Submit Like/Dislike feedback ───────────────────────────────────────
export async function submitFeedback(isLike: boolean) {
  try {
    const ipAddress = await getClientIp();
    
    const feedback = await prisma.feedback.upsert({
      where: { ipAddress },
      update: { isLike },
      create: { ipAddress, isLike },
    });
    
    return { success: true, feedback };
  } catch (error) {
    console.error("Error in submitFeedback:", error);
    return { success: false, error: String(error) };
  }
}

// ── Fetch feedback status for the current user ────────────────────────
export async function getUserFeedbackStatus() {
  try {
    const ipAddress = await getClientIp();
    const feedback = await prisma.feedback.findUnique({
      where: { ipAddress }
    });
    return { success: true, hasVoted: !!feedback, isLike: feedback?.isLike ?? null };
  } catch (error) {
    console.error("Error in getUserFeedbackStatus:", error);
    return { success: false, error: String(error) };
  }
}

// ── Get analytics data for Admin Dashboard ────────────────────────────
export async function getAnalyticsStats() {
  try {
    // 1. Total unique visitors (all time distinct IPs)
    const uniqueVisitorsResult = await prisma.userVisit.findMany({
      select: { ipAddress: true },
      distinct: ['ipAddress']
    });
    const totalUniqueVisitors = uniqueVisitorsResult.length;

    // 2. Feedback counts
    const likes = await prisma.feedback.count({ where: { isLike: true } });
    const dislikes = await prisma.feedback.count({ where: { isLike: false } });

    // 3. Daily Active Users (DAU) for the last 7 days
    const rawDau = await prisma.userVisit.groupBy({
      by: ['visitDate'],
      _count: {
        ipAddress: true,
      },
      orderBy: {
        visitDate: 'desc',
      },
      take: 7,
    });

    const dauList = rawDau.map((row) => ({
      date: row.visitDate,
      count: row._count.ipAddress,
    }));

    return {
      success: true,
      totalUniqueVisitors,
      likes,
      dislikes,
      dauList,
    };
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
    const settings = await prisma.siteSetting.findUnique({
      where: { id: 1 }
    });
    return { 
      success: true, 
      liveStreamUrl: settings?.liveStreamUrl || "", 
      liveStreamPlatform: settings?.liveStreamPlatform || "youtube",
      isLiveActive: settings?.isLiveActive || false 
    };
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

    const settings = await prisma.siteSetting.upsert({
      where: { id: 1 },
      update: { liveStreamUrl: url, liveStreamPlatform: platform, isLiveActive: isActive },
      create: { id: 1, liveStreamUrl: url, liveStreamPlatform: platform, isLiveActive: isActive },
    });
    return { success: true, settings };
  } catch (error) {
    console.error("Error in updateLiveStreamSettings:", error);
    return { success: false, error: String(error) };
  }
}


