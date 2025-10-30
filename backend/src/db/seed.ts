/**
 * Database seeding script
 * Populates initial data for development and testing
 * Following Cursor Clause 4.5 Rules
 */

import { db } from './client';
import { searchService } from '../services/search.service';

/**
 * Seed database with initial data
 */
async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Initialize Meilisearch
    await searchService.initialize();
    // Create test users (using upsert for SQLite compatibility)
    await db.user.upsert({
      where: { email: 'programmer@millpoint.com' },
      update: {},
      create: { email: 'programmer@millpoint.com', name: 'Hans Jensen', role: 'programmer' },
    });
    await db.user.upsert({
      where: { email: 'quality@millpoint.com' },
      update: {},
      create: { email: 'quality@millpoint.com', name: 'Mette Nielsen', role: 'quality' },
    });
    await db.user.upsert({
      where: { email: 'operator@millpoint.com' },
      update: {},
      create: { email: 'operator@millpoint.com', name: 'Lars Andersen', role: 'operator' },
    });
    await db.user.upsert({
      where: { email: 'admin@millpoint.com' },
      update: {},
      create: { email: 'admin@millpoint.com', name: 'Admin User', role: 'admin' },
    });
    console.log('✅ Created users');

    // Get programmer user
    const programmer = await db.user.findUnique({
      where: { email: 'programmer@millpoint.com' },
    });

    // Create machines (check if exists first for SQLite compatibility)
    const machineData = [
      { name: 'DMG Mori DMU 50', type: 'Fræsemaskine', manufacturer: 'DMG Mori', model: 'DMU 50', status: 'Online', ipAddress: '192.168.1.101' },
      { name: 'Haas VF-2', type: 'Fræsemaskine', manufacturer: 'Haas', model: 'VF-2', status: 'Online', ipAddress: '192.168.1.102' },
      { name: 'Mazak Integrex i-200', type: 'Drejebænk', manufacturer: 'Mazak', model: 'Integrex i-200', status: 'Offline', ipAddress: null },
      { name: 'Okuma MU-6300V', type: '5-akset fræser', manufacturer: 'Okuma', model: 'MU-6300V', status: 'Online', ipAddress: '192.168.1.103' },
      { name: 'Sodick AQ537L', type: 'EDM', manufacturer: 'Sodick', model: 'AQ537L', status: 'Maintenance', ipAddress: null },
    ];
    
    for (const m of machineData) {
      const exists = await db.machine.findFirst({ where: { name: m.name } });
      if (!exists) {
        await db.machine.create({ data: m as any });
      }
    }
    console.log('✅ Created machines');

    // Get first machine
    const machine = await db.machine.findFirst();

    if (programmer && machine) {
      // Create sample programs
      const program1 = await db.nCProgram.create({
        data: {
          name: 'Flange_Face_Mill',
          partNumber: 'P-2024-001',
          revision: 'A',
          machineId: machine.id,
          operation: 'Froning af flange',
          material: 'Aluminium 6061',
          status: 'Released',
          customer: 'Vestas Wind Systems',
          description: 'CNC program til froning af vindmølle flange komponent',
          authorId: programmer.id,
          workOrder: 'WO-2024-156',
        },
      });
      console.log('✅ Created sample program');

      // Create a setup sheet for the program
      await db.setupSheet.create({
        data: {
          programId: program1.id,
          machineId: machine.id,
          machineType: machine.type,
          safetyChecklist: [
            'Kontroller sikkerhedsbriller',
            'Verificer spindelhastighed',
            'Check kølevæskeniveau',
            'Inspicer værktøjer for skader',
            'Bekræft nødstop funktion',
          ],
          createdById: programmer.id,
          tools: {
            create: [
              {
                toolNumber: 1,
                toolName: 'Face Mill Ø100mm',
                length: 150.5,
                offsetH: 1,
                offsetD: 1,
                comment: 'Sandvik Coromant',
              },
              {
                toolNumber: 2,
                toolName: 'Spot Drill Ø6mm',
                length: 75.0,
                offsetH: 2,
                offsetD: 2,
                comment: 'TiAlN coated',
              },
              {
                toolNumber: 3,
                toolName: 'Drill Ø8.5mm',
                length: 120.0,
                offsetH: 3,
                offsetD: 3,
                comment: 'Coolant through',
              },
            ],
          },
          originOffsets: {
            create: [
              {
                name: 'G54',
                x: 0.0,
                y: 0.0,
                z: 50.0,
                a: 0.0,
                b: 0.0,
                c: 0.0,
              },
            ],
          },
          fixtures: {
            create: [
              {
                fixtureId: 'FIX-001',
                quantity: 1,
                setupDescription: 'Montér emne i maskinklemme med 4 kæber',
              },
            ],
          },
          media: {
            create: [
              {
                type: 'image',
                url: '/media/setup-1.jpg',
                caption: 'Værktøjsopsætning oversigt',
                order: 0,
              },
            ],
          },
        },
      });

      // Program now has setup sheet (relation exists)

      console.log('✅ Created sample setup sheet');

      // Index programs in Meilisearch
      await searchService.indexAllPrograms();
    }

    console.log('');
    console.log('✅ Database seeded successfully!');
    console.log('');
    console.log('Test users created:');
    console.log('  - programmer@millpoint.com (Hans Jensen)');
    console.log('  - quality@millpoint.com (Mette Nielsen)');
    console.log('  - operator@millpoint.com (Lars Andersen)');
    console.log('  - admin@millpoint.com (Admin User)');
    console.log('');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seed };

