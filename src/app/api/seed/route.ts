import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Clear existing data
    await prisma.announcement.deleteMany();
    
    // Seed new data
    await prisma.announcement.createMany({
      data: [
        {
          title: "Festival Dates Announced",
          titleTe: "పండుగ తేదీలు ప్రకటించబడ్డాయి",
          content: "The Chenchugudi Mahabharatham Festival will officially begin on May 15th and run for 18 days.",
          contentTe: "చెంచుగుడి మహాభారతం పండుగ మే 15న అధికారికంగా ప్రారంభమై 18 రోజుల పాటు కొనసాగుతుంది.",
          date: new Date(),
          isActive: true
        },
        {
          title: "Donations Open",
          titleTe: "విరాళాలు ప్రారంభం",
          content: "We are now accepting donations from all participating villages. Please contact your village head.",
          contentTe: "మేము ఇప్పుడు పాల్గొనే అన్ని గ్రామాల నుండి విరాళాలు స్వీకరిస్తున్నాము. దయచేసి మీ గ్రామ పెద్దను సంప్రదించండి.",
          date: new Date(Date.now() - 86400000), // yesterday
          isActive: true
        }
      ]
    });

    return NextResponse.json({ message: "Database seeded successfully with demo data" });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}
