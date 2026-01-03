
process.env.DATABASE_URL = 'postgresql://mosaaedak:mosaaedak_db_password_2026@localhost:5433/mosaaedak?schema=public';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function updateTenant() {
    try {
        const email = 'fadi.alaswadi@gmail.com';
        const phone = '+19894472583';

        console.log(`Updating tenant for user ${email}...`);

        const user = await prisma.user.findUnique({
            where: { email },
            include: { tenant: true }
        });

        if (!user || !user.tenant) {
            console.error('User or tenant not found');
            return;
        }

        const updated = await prisma.tenant.update({
            where: { id: user.tenant.id },
            data: { twilioPhone: phone }
        });

        console.log(`✅ Updated tenant ${updated.businessName} with phone ${updated.twilioPhone}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateTenant();
