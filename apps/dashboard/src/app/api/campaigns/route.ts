import { NextResponse } from "next/server";
import { PrismaClient, TaskType, CampaignStatus, TaskStatus } from "@prisma/client";
import { auth } from "@/lib/auth/auth";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { 
      name, 
      subject, 
      body: emailBody, 
      contacts: contactIds, 
      emailBlocks 
    } = body;

    // Get the project ID from the active organization (would need to be implemented in a real app)
    // This is a placeholder - in a real implementation, you would get the actual project ID
    // For this example, we'll get the first project associated with the user
    const userMembership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        organization: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!userMembership?.organization?.project?.id) {
      return NextResponse.json(
        { error: "No project found for this user" },
        { status: 404 }
      );
    }

    const projectId = userMembership.organization.project.id;

    // Create the campaign
    const campaign = await prisma.campaign.create({
      data: {
        name,
        subject,
        body: emailBody,
        status: CampaignStatus.SCHEDULED,
        project: {
          connect: {
            id: projectId,
          },
        },
        // Connect contacts to the campaign
        contacts: {
          connect: contactIds.map((id: string) => ({ id })),
        },
      },
    });

    // Create a task for sending the campaign
    // Using the first email block's scheduled date/time or current time if not provided
    const firstBlock = emailBlocks[0];
    let scheduledAt = new Date();
    
    if (firstBlock?.scheduledDate) {
      scheduledAt = new Date(firstBlock.scheduledDate);
      
      // If time is provided, parse and set it
      if (firstBlock.scheduledTime) {
        const [hours, minutes, seconds] = firstBlock.scheduledTime.split(':').map(Number);
        scheduledAt.setHours(hours, minutes, seconds || 0);
      }
    }

    const task = await prisma.task.create({
      data: {
        type: TaskType.SEND_CAMPAIGN,
        status: TaskStatus.PENDING,
        scheduledAt,
        project: {
          connect: {
            id: projectId,
          },
        },
        campaign: {
          connect: {
            id: campaign.id,
          },
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      campaign,
      task
    });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}
