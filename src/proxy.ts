import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // 1. Enforce authentication
    const authObject = await auth();
    if (!authObject.userId) {
      await auth.protect();
      return;
    }

    // 2. Fetch user's primary email
    const client = await clerkClient();
    const user = await client.users.getUser(authObject.userId);
    const primaryEmail = user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId
    )?.emailAddress;

    // 3. Retrieve and parse allowed admin emails whitelist
    const allowedEmailsStr = process.env.ADMIN_ALLOWED_EMAILS || "";
    const allowedEmails = allowedEmailsStr
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);

    // If whitelist is configured, check user email; otherwise log warning
    if (allowedEmails.length > 0) {
      if (!primaryEmail || !allowedEmails.includes(primaryEmail.toLowerCase())) {
        console.warn(`Unauthorized admin portal access attempt by: ${primaryEmail || "unknown email"}`);
        // Redirect unauthorized users to home page with an error flag
        return NextResponse.redirect(new URL('/?error=unauthorized', req.url));
      }
    } else {
      console.warn("ADMIN_ALLOWED_EMAILS is not set. Admin portal is temporarily open to all signed-in users.");
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
