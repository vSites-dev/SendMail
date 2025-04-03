import { Contact, EmailStatus, PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

// Helper functions for generating random data
function randomDate(): Date {
  const end = new Date() // today
  const start = new Date()
  start.setDate(end.getDate() - 30) // 30 days ago
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  )
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

export default async function seedDatabase({ userId }: { userId: string }) {
  console.log('Starting database seeding...')

  // Create first organization
  const org1Id = uuidv4()
  const org1 = await prisma.organization.create({
    data: {
      id: org1Id,
      name: 'Marketing Pro Solutions',
      slug: 'marketing-pro-solutions',
      createdAt: new Date()
    }
  })

  // Create second organization
  const org2Id = uuidv4()
  const org2 = await prisma.organization.create({
    data: {
      id: org2Id,
      name: 'Digital Outreach Team',
      slug: 'digital-outreach-team',
      createdAt: new Date()
    }
  })
  console.log(`Created organizations: ${org1.name}, ${org2.name}`)

  // Add user as member of both organizations
  await prisma.member.create({
    data: {
      id: uuidv4(),
      organizationId: org1Id,
      userId,
      role: 'owner',
      createdAt: new Date()
    }
  })

  await prisma.member.create({
    data: {
      id: uuidv4(),
      organizationId: org2Id,
      userId,
      role: 'owner',
      createdAt: new Date()
    }
  })

  // Create projects for each organization
  const project1 = await prisma.project.create({
    data: {
      id: uuidv4(),
      name: 'Email Marketing Campaigns',
      organizationId: org1Id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  const project2 = await prisma.project.create({
    data: {
      id: uuidv4(),
      name: 'Customer Engagement',
      organizationId: org2Id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })
  console.log('Created projects for both organizations')

  // Create domains for each project
  await createDomain(project1.id, 'marketingpro.com')
  await createDomain(project2.id, 'digitaloutreach.com')

  // Create email templates for each project
  await createTemplates(project1.id)
  await createTemplates(project2.id)

  // Create contacts for first project
  const project1Contacts = await createContacts(project1.id, 25)
  console.log(
    `Created ${project1Contacts.length} contacts for ${project1.name}`
  )

  // Create contacts for second project
  const project2Contacts = await createContacts(project2.id, 30)
  console.log(
    `Created ${project2Contacts.length} contacts for ${project2.name}`
  )

  // Create campaigns and their emails/tasks
  const campaign1 = await createCampaign(
    project1.id,
    'Summer Sale 2025',
    project1Contacts.slice(0, 15)
  )
  const campaign2 = await createCampaign(
    project1.id,
    'New Product Launch',
    project1Contacts.slice(10, 25)
  )

  const campaign3 = await createCampaign(
    project2.id,
    'Quarterly Newsletter',
    project2Contacts.slice(0, 20)
  )
  const campaign4 = await createCampaign(
    project2.id,
    'Customer Feedback Survey',
    project2Contacts.slice(15, 30)
  )

  // Create emails and tasks for all campaigns
  await createEmailsAndTasks(
    campaign1.id,
    project1.id,
    project1Contacts.slice(0, 15)
  )
  await createEmailsAndTasks(
    campaign2.id,
    project1.id,
    project1Contacts.slice(10, 25)
  )
  await createEmailsAndTasks(
    campaign3.id,
    project2.id,
    project2Contacts.slice(0, 20)
  )
  await createEmailsAndTasks(
    campaign4.id,
    project2.id,
    project2Contacts.slice(15, 30)
  )

  console.log('Database seeded successfully!')
}

// Create contacts with realistic data
async function createContacts(projectId: string, count: number) {
  const contacts: Contact[] = []
  const domains = [
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'example.com',
    'company.com',
    'business.org'
  ]
  const firstNames = [
    'John',
    'Jane',
    'Michael',
    'Emma',
    'David',
    'Sarah',
    'Robert',
    'Lisa',
    'Thomas',
    'Mary',
    'Daniel',
    'Patricia',
    'William',
    'Elizabeth',
    'Richard',
    'Susan',
    'Joseph',
    'Jessica',
    'Charles',
    'Karen'
  ]
  const lastNames = [
    'Smith',
    'Johnson',
    'Williams',
    'Brown',
    'Jones',
    'Miller',
    'Davis',
    'Garcia',
    'Rodriguez',
    'Wilson',
    'Martinez',
    'Anderson',
    'Taylor',
    'Thomas',
    'Moore',
    'Jackson',
    'Martin',
    'Lee',
    'Thompson',
    'White'
  ]
  const companies = [
    'Acme Inc',
    'Tech Solutions',
    'Global Services',
    'Digital Innovators',
    'Modern Designs',
    'Creative Studios',
    'Smart Systems',
    'Bright Future Corp',
    'Express Logistics',
    'Quality Assurance Ltd'
  ]
  const titles = [
    'CEO',
    'CTO',
    'Marketing Director',
    'Sales Manager',
    'Product Manager',
    'UX Designer',
    'Software Engineer',
    'Data Analyst',
    'Operations Director',
    'Finance Manager',
    'HR Specialist',
    'Customer Support Lead'
  ]

  for (let i = 0; i < count; i++) {
    const firstName = randomChoice(firstNames)
    const lastName = randomChoice(lastNames)
    const domain = randomChoice(domains)
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(
      Math.random() * 100
    )}@${domain}`

    const contact = await prisma.contact.create({
      data: {
        id: uuidv4(),
        email,
        name: `${firstName} ${lastName}`,
        status: randomChoice([
          'SUBSCRIBED',
          'SUBSCRIBED',
          'SUBSCRIBED',
          'UNSUBSCRIBED'
        ]), // Mostly subscribed
        projectId,
        metadata: {
          company: randomChoice(companies),
          title: randomChoice(titles),
          leadSource: randomChoice([
            'Website',
            'Referral',
            'Conference',
            'Social Media',
            'Email Campaign'
          ]),
          notes: randomChoice([
            'Met at the annual conference',
            'Interested in enterprise plans',
            'Requested pricing information',
            'Looking for customized solutions',
            null
          ])
        },
        createdAt: randomDate(),
        updatedAt: new Date()
      }
    })

    contacts.push(contact)
  }

  return contacts
}

// Create campaign and connect to contacts
async function createCampaign(
  projectId: string,
  name: string,
  contacts: any[]
) {
  const campaign = await prisma.campaign.create({
    data: {
      id: uuidv4(),
      name,
      status: randomChoice(['DRAFT', 'SCHEDULED', 'COMPLETED']),
      projectId,
      createdAt: randomDate(),
      updatedAt: new Date()
    }
  })

  // Connect contacts to the campaign
  for (const contact of contacts) {
    await prisma.contact.update({
      where: { id: contact.id },
      data: {
        campaigns: {
          connect: { id: campaign.id }
        }
      }
    })
  }

  return campaign
}

// Create email templates
async function createTemplates(projectId: string) {
  const templates = [
    {
      name: 'Welcome Email',
      body: `
        <h1>Welcome to our community!</h1>
        <p>We're excited to have you on board. Here's what you can expect from us:</p>
        <ul>
          <li>Regular updates on new features</li>
          <li>Tips and tricks to get the most out of our platform</li>
          <li>Exclusive offers for our subscribers</li>
        </ul>
        <p>Feel free to reply to this email if you have any questions!</p>
      `
    },
    {
      name: 'Monthly Newsletter',
      body: `
        <h1>Monthly Newsletter - {{month}} {{year}}</h1>
        <h2>What's New</h2>
        <p>This month, we've launched several exciting features:</p>
        <ul>
          <li>Feature 1: Makes your life easier</li>
          <li>Feature 2: Saves you time</li>
          <li>Feature 3: Improves your workflow</li>
        </ul>
        <h2>Upcoming Events</h2>
        <p>Join us for our webinar on {{webinar_date}} where we'll discuss the latest trends.</p>
      `
    },
    {
      name: 'Product Announcement',
      body: `
        <h1>Introducing Our Latest Product!</h1>
        <p>We're thrilled to announce the launch of our newest product.</p>
        <h2>Key Benefits:</h2>
        <ul>
          <li>Benefit 1: Amazing feature</li>
          <li>Benefit 2: Time-saving capability</li>
          <li>Benefit 3: Cost-effective solution</li>
        </ul>
        <p><a href="{{product_link}}">Learn more about our new product</a></p>
      `
    },
    {
      name: 'Special Offer',
      body: `
        <h1>Special Offer Just For You</h1>
        <p>As a valued customer, we're offering you an exclusive discount:</p>
        <div style="text-align: center; padding: 20px; background-color: #f9f9f9; margin: 20px 0;">
          <h2>Get 25% OFF with code: SPECIAL25</h2>
          <p>Valid until {{expiry_date}}</p>
        </div>
        <p>Don't miss this opportunity!</p>
      `
    }
  ]

  for (const template of templates) {
    await prisma.template.create({
      data: {
        id: uuidv4(),
        name: template.name,
        body: template.body,
        projectId,
        createdAt: randomDate(),
        updatedAt: new Date()
      }
    })
  }
}

// Create a domain for the project
async function createDomain(projectId: string, domainName: string) {
  return prisma.domain.create({
    data: {
      id: uuidv4(),
      name: domainName,
      status: randomChoice([
        'PENDING',
        'DKIM_PENDING',
        'DKIM_VERIFIED',
        'VERIFIED'
      ]),
      dkimTokens: [
        `dkim1._domainkey.${domainName}`,
        `dkim2._domainkey.${domainName}`,
        `dkim3._domainkey.${domainName}`
      ],
      spfRecord: `v=spf1 include:amazonses.com ~all`,
      dmarcRecord: `v=DMARC1; p=none; pct=100; rua=mailto:dmarc@${domainName}`,
      mailFromSubdomain: `mail.${domainName}`,
      mailFromMxRecord: `feedback-smtp.us-east-1.amazonses.com`,
      verificationToken: uuidv4(),
      projectId,
      createdAt: randomDate(),
      updatedAt: new Date()
    }
  })
}

// Create emails and related tasks for a campaign
async function createEmailsAndTasks(
  campaignId: string,
  projectId: string,
  contacts: any[]
) {
  const subjects = [
    'Important update about your account',
    'Special offer just for you',
    'Your monthly newsletter is here',
    'We value your feedback',
    'Exciting news from our team',
    'Thank you for your continued support',
    'New features you might be interested in',
    'Invitation to our upcoming webinar',
    'Your account summary for April',
    'Action required: Please confirm your subscription'
  ]

  const emailBodies = [
    `<p>Hello {{name}},</p><p>We hope you're doing well. We wanted to share some important updates with you about our services.</p><p>Best regards,<br>The Team</p>`,
    `<p>Hi {{name}},</p><p>We're excited to announce our new features that will help you achieve better results.</p><p>Check them out today!</p><p>Cheers,<br>The Team</p>`,
    `<p>Dear {{name}},</p><p>Thank you for being a valued customer. We've prepared a special offer just for you.</p><p>Kind regards,<br>The Team</p>`,
    `<p>Hello {{name}},</p><p>We'd love to hear your thoughts on your recent experience with our product. Your feedback helps us improve!</p><p>Thanks,<br>The Team</p>`
  ]

  for (const contact of contacts) {
    const subject = randomChoice(subjects)
    const body = randomChoice(emailBodies).replace(
      '{{name}}',
      contact.name || 'there'
    )
    const messageId = `${uuidv4()}@mail.example.com`
    const from = 'notifications@example.com'
    const status = randomChoice([
      'QUEUED',
      'SENT',
      'DELIVERED',
      'BOUNCED',
      'FAILED'
    ]) as EmailStatus

    // Create email
    const email = await prisma.email.create({
      data: {
        id: uuidv4(),
        messageId,
        subject,
        from,
        body,
        status,
        campaignId,
        contactId: contact.id,
        sentAt: status !== 'QUEUED' ? randomDate() : null,
        createdAt: randomDate(),
        updatedAt: new Date()
      }
    })

    // Create task for this email
    await prisma.task.create({
      data: {
        id: uuidv4(),
        type: 'SEND_EMAIL',
        status:
          status === 'QUEUED'
            ? 'PENDING'
            : status === 'FAILED'
            ? 'FAILED'
            : 'COMPLETED',
        scheduledAt: randomDate(),
        processedAt: status !== 'QUEUED' ? randomDate() : null,
        error:
          status === 'FAILED'
            ? 'Failed to deliver: recipient mailbox unavailable'
            : null,
        projectId,
        campaignId,
        emailId: email.id,
        createdAt: randomDate(),
        updatedAt: new Date()
      }
    })

    // Create clicks for delivered emails (randomly for some emails)
    if (status === 'DELIVERED' && Math.random() > 0.7) {
      const clicksCount = Math.floor(Math.random() * 3) + 1
      const links = [
        'https://example.com/product',
        'https://example.com/pricing',
        'https://example.com/contact',
        'https://example.com/blog',
        'https://example.com/about',
        'https://example.com/signup',
        'https://example.com/demo'
      ]

      for (let i = 0; i < clicksCount; i++) {
        await prisma.click.create({
          data: {
            id: uuidv4(),
            link: randomChoice(links),
            emailId: email.id,
            createdAt: randomDate()
          }
        })
      }
    }
  }

  // Create campaign task
  await prisma.task.create({
    data: {
      id: uuidv4(),
      type: 'SEND_CAMPAIGN',
      status: randomChoice(['PENDING', 'PROCESSING', 'COMPLETED']),
      scheduledAt: randomDate(),
      processedAt: randomDate(),
      projectId,
      campaignId,
      createdAt: randomDate(),
      updatedAt: new Date()
    }
  })
}
