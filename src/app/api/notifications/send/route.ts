import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import webpush from 'web-push';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

webpush.setVapidDetails(
  'mailto:admin@chenchugudi.com',
  process.env.VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, message, url } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'Missing title or message' }, { status: 400 });
    }

    const subscriptions = await prisma.pushSubscription.findMany();
    
    if (subscriptions.length === 0) {
      return NextResponse.json({ success: true, message: 'No subscribers found.' });
    }

    const payload = JSON.stringify({
      title,
      body: message,
      url: url || 'https://chenchugudi-mahabharatham.vercel.app',
      icon: '/icon-192x192.png' // Ensure this exists or use a default logo
    });

    // Send notifications in parallel
    const sendPromises = subscriptions.map(async (sub) => {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };
        await webpush.sendNotification(pushSubscription, payload);
      } catch (error: any) {
        // If subscription is invalid/expired (status 410 or 404), delete it from DB
        if (error.statusCode === 410 || error.statusCode === 404) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          console.error('Failed to send push notification:', error);
        }
      }
    });

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, message: `Sent to ${subscriptions.length} subscribers.` });
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
