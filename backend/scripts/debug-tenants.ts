
process.env.DATABASE_URL = 'postgresql://mosaaedak:mosaaedak_db_password_2026@localhost:5433/mosaaedak?schema=public';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function listTenants() {
    try {
        console.log('--- Checking Tenants ---');
        const tenants = await prisma.tenant.findMany({
            select: {
                id: true,
                businessName: true,
                twilioPhone: true,
                status: true,
                user: {
                    select: { email: true, name: true }
                }
            }
        });

        console.log(`Found ${tenants.length} tenants:`);
        tenants.forEach(t => {
            console.log(`- [${t.status}] ${t.businessName} (${t.user?.email}): '${t.twilioPhone}' (ID: ${t.id})`);
        });

        const targetPhone = '+19894472583';
        const match = tenants.find(t => t.twilioPhone === targetPhone);
        if (match) {
            console.log(`\n✅ EXACT TIM: Found match for ${targetPhone}`);
        } else {
            console.log(`\n❌ NO EXACT MATCH for ${targetPhone}`);
            // Check for partial matches
            const partial = tenants.find(t => t.twilioPhone?.includes('19894472583'));
            if (partial) {
                console.log(`⚠️ Possible match (missing prefix?): '${partial.twilioPhone}'`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listTenants();
