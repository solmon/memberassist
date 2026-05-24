import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-health' },
    update: {},
    create: {
      name: 'Demo Health Plan',
      slug: 'demo-health',
      primaryColour: '#1565C0',
    },
  });

  // District
  const district = await prisma.district.upsert({
    where: { id: 'district-demo-001' },
    update: {},
    create: {
      id: 'district-demo-001',
      tenantId: tenant.id,
      name: 'Demo School District',
    },
  });

  // Broker
  const broker = await prisma.broker.upsert({
    where: { id: 'broker-demo-001' },
    update: {},
    create: {
      id: 'broker-demo-001',
      tenantId: tenant.id,
      name: 'Demo Benefits Broker',
      licenceNumber: 'LIC-DEMO-001',
      email: 'broker@demo-health.example',
    },
  });

  // Member
  const passwordHash = await bcrypt.hash('Password1!', 12);
  const member = await prisma.member.upsert({
    where: { memberIdNumber: 'DHP-000001' },
    update: {},
    create: {
      tenantId: tenant.id,
      districtId: district.id,
      email: 'jane.doe@example.com',
      passwordHash,
      firstName: 'Jane',
      lastName: 'Doe',
      dateOfBirth: new Date('1985-06-15'),
      role: 'MEMBER',
      memberIdNumber: 'DHP-000001',
    },
  });

  // PlanEnrollment
  const enrollment = await prisma.planEnrollment.upsert({
    where: { id: 'enrollment-demo-001' },
    update: {},
    create: {
      id: 'enrollment-demo-001',
      tenantId: tenant.id,
      memberId: member.id,
      planName: 'Gold PPO Plan',
      planTier: 'GOLD',
      groupNumber: 'GRP-DEMO-001',
      effectiveDate: new Date('2025-01-01'),
      terminationDate: new Date('2025-12-31'),
      status: 'ACTIVE',
      premiumAmount: 450.00,
      premiumCycle: 'MONTHLY',
      nextRenewalDate: new Date('2026-01-01'),
    },
  });

  // DigitalInsuranceCard
  await prisma.digitalInsuranceCard.upsert({
    where: { id: 'card-demo-001' },
    update: {},
    create: {
      id: 'card-demo-001',
      tenantId: tenant.id,
      enrollmentId: enrollment.id,
      cardholderName: 'Jane Doe',
      memberIdNumber: 'DHP-000001',
      groupNumber: 'GRP-DEMO-001',
      planName: 'Gold PPO Plan',
      planTier: 'GOLD',
      effectiveDate: new Date('2025-01-01'),
    },
  });

  // CommunicationMessages (idempotent via count check)
  const msgCount = await prisma.communicationMessage.count({ where: { tenantId: tenant.id } });
  if (msgCount === 0) {
    await prisma.communicationMessage.createMany({
      data: [
        {
          tenantId: tenant.id,
          brokerId: broker.id,
          channel: 'BROKER_NOTICE',
          subject: 'Open Enrollment Starts Soon',
          body: 'Open enrollment for the upcoming plan year begins November 1st. Review your options and make changes in the portal.',
          sentAt: new Date('2025-10-01'),
        },
        {
          tenantId: tenant.id,
          districtId: district.id,
          channel: 'DISTRICT_ALERT',
          subject: 'Wellness Fair - October 15',
          body: 'Join us for our annual wellness fair on October 15 in the district gymnasium. Free health screenings available.',
          sentAt: new Date('2025-10-05'),
        },
      ],
    });
  }

  // HealthEvents
  const eventCount = await prisma.healthEvent.count({ where: { tenantId: tenant.id } });
  if (eventCount === 0) {
    await prisma.healthEvent.createMany({
      data: [
        {
          tenantId: tenant.id,
          title: 'Flu Shot Clinic',
          description: 'Get your annual flu shot at the district health center.',
          category: 'VACCINATION',
          location: '123 Main St, Springfield',
          startAt: new Date('2025-10-20T09:00:00'),
          endAt: new Date('2025-10-20T17:00:00'),
          capacity: 100,
        },
        {
          tenantId: tenant.id,
          title: 'Diabetes Management Webinar',
          description: 'Learn strategies for managing diabetes in your daily life.',
          category: 'EDUCATION',
          isVirtual: true,
          meetingUrl: 'https://zoom.example/diabetes-webinar',
          startAt: new Date('2025-11-05T18:00:00'),
          endAt: new Date('2025-11-05T19:30:00'),
          capacity: 200,
        },
        {
          tenantId: tenant.id,
          title: '5K Fun Run for Heart Health',
          description: 'Participate in our annual 5K run to promote heart health awareness.',
          category: 'FITNESS',
          location: 'City Park, Springfield',
          startAt: new Date('2025-11-15T08:00:00'),
          endAt: new Date('2025-11-15T12:00:00'),
          capacity: 300,
        },
      ],
    });
  }

  // MarketplaceOffers
  const offerCount = await prisma.marketplaceOffer.count({ where: { tenantId: tenant.id } });
  if (offerCount === 0) {
    await prisma.marketplaceOffer.createMany({
      data: [
        {
          tenantId: tenant.id,
          title: 'Dental Premier Plan',
          description: 'Comprehensive dental coverage including orthodontics, implants, and preventive care.',
          category: 'DENTAL',
          eligibleTiers: JSON.stringify(['GOLD', 'SILVER']),
          priceAmount: 35.00,
          priceCycle: 'MONTHLY',
        },
        {
          tenantId: tenant.id,
          title: 'Vision Care Plus',
          description: 'Enhanced vision coverage with frames, contacts, and laser eye surgery discount.',
          category: 'VISION',
          eligibleTiers: JSON.stringify(['GOLD', 'SILVER', 'HDHP']),
          priceAmount: 12.00,
          priceCycle: 'MONTHLY',
        },
        {
          tenantId: tenant.id,
          title: 'Gym Membership Subsidy',
          description: 'Discounted membership at 500+ partner gyms and fitness centers.',
          category: 'WELLNESS',
          eligibleTiers: JSON.stringify(['GOLD']),
          priceAmount: 25.00,
          priceCycle: 'MONTHLY',
        },
        {
          tenantId: tenant.id,
          title: 'Critical Illness Insurance',
          description: 'Lump-sum payment upon diagnosis of covered critical illness conditions.',
          category: 'SUPPLEMENTAL',
          eligibleTiers: JSON.stringify(['GOLD', 'SILVER']),
          priceAmount: 18.50,
          priceCycle: 'MONTHLY',
        },
        {
          tenantId: tenant.id,
          title: 'Employee Assistance Program',
          description: 'Mental health counseling, legal advice, and financial planning resources.',
          category: 'WELLNESS',
          eligibleTiers: JSON.stringify(['GOLD', 'SILVER', 'HDHP']),
          priceAmount: 0,
          priceCycle: 'MONTHLY',
        },
      ],
    });
  }

  // Providers
  const providerCount = await prisma.provider.count({ where: { tenantId: tenant.id } });
  if (providerCount === 0) {
    await prisma.provider.createMany({
      data: [
        {
          tenantId: tenant.id,
          npi: '1234567890',
          firstName: 'Alice',
          lastName: 'Smith',
          specialty: 'Primary Care',
          clinicName: 'Springfield Family Practice',
          address: '456 Oak Ave',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
          phone: '217-555-0101',
          acceptingNew: true,
          networkTiers: JSON.stringify(['GOLD', 'SILVER']),
          latitude: 39.7817,
          longitude: -89.6501,
        },
        {
          tenantId: tenant.id,
          npi: '0987654321',
          firstName: 'Bob',
          lastName: 'Johnson',
          specialty: 'Cardiology',
          clinicName: 'Heart Care Center',
          address: '789 Elm St',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62702',
          phone: '217-555-0202',
          acceptingNew: true,
          networkTiers: JSON.stringify(['GOLD']),
          latitude: 39.7990,
          longitude: -89.6440,
        },
        {
          tenantId: tenant.id,
          npi: '1122334455',
          firstName: 'Carol',
          lastName: 'Davis',
          specialty: 'Dermatology',
          clinicName: 'SkinCare Associates',
          address: '321 Pine Rd',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62703',
          phone: '217-555-0303',
          acceptingNew: false,
          networkTiers: JSON.stringify(['SILVER', 'HDHP']),
          latitude: 39.7650,
          longitude: -89.6610,
        },
        {
          tenantId: tenant.id,
          npi: '5544332211',
          firstName: 'David',
          lastName: 'Wilson',
          specialty: 'Pediatrics',
          clinicName: 'Kids First Pediatrics',
          address: '654 Maple Blvd',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62704',
          phone: '217-555-0404',
          acceptingNew: true,
          networkTiers: JSON.stringify(['GOLD', 'SILVER', 'HDHP']),
          latitude: 39.7720,
          longitude: -89.6380,
        },
        {
          tenantId: tenant.id,
          npi: '9988776655',
          firstName: 'Eve',
          lastName: 'Martinez',
          specialty: 'Orthopedics',
          clinicName: 'Bone & Joint Clinic',
          address: '987 Willow Way',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62705',
          phone: '217-555-0505',
          acceptingNew: true,
          networkTiers: JSON.stringify(['GOLD']),
          latitude: 39.7880,
          longitude: -89.6550,
        },
      ],
    });
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
