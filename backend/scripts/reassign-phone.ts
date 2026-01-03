
process.env.DATABASE_URL = 'postgresql://mosaaedak:mosaaedak_db_password_2026@localhost:5433/mosaaedak?schema=public';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function reassignPhone() {
    try {
        const phone = '+19894472583';
        const correctEmail = 'hosam@gmail.com';
        const wrongEmail = 'fadi.alaswadi@gmail.com';

        console.log(`Checking conflicts for phone ${phone}...`);

        // 1. Check if 'fadi' has this phone (from my previous mistake)
        const wrongUser = await prisma.user.findUnique({
            where: { email: wrongEmail },
            include: { tenant: true }
        });

        if (wrongUser && wrongUser.tenant && wrongUser.tenant.twilioPhone === phone) {
            console.log(`Fixing: Removing phone from ${wrongEmail}'s tenant...`);
            await prisma.tenant.update({
                where: { id: wrongUser.tenant.id },
                data: { twilioPhone: null }
            });
            console.log('✅ Removed phone from wrong tenant.');
        }

        // 2. Assign to 'Hosam'
        const correctUser = await prisma.user.findUnique({
            where: { email: correctEmail },
            include: { tenant: true }
        });

        if (!correctUser || !correctUser.tenant) {
            console.error(`User ${correctEmail} or their tenant not found!`);
            return;
        }

        console.log(`Assigning ${phone} to ${correctEmail}'s tenant (Business: ${correctUser.tenant.businessName})...`);

        await prisma.tenant.update({
            where: { id: correctUser.tenant.id },
            data: { twilioPhone: phone }
        });

        console.log(`✅ SUCCESS: Assigned ${phone} to correct tenant.`);

        // Verification output
        const finalTenant = await prisma.tenant.findUnique({
            where: { id: correctUser.tenant.id }
        });
        console.log(`Current State: ${finalTenant?.businessName} -> ${finalTenant?.twilioPhone}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

reassignPhone();
