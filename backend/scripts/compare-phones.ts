
process.env.DATABASE_URL = 'postgresql://mosaaedak:mosaaedak_db_password_2026@localhost:5433/mosaaedak?schema=public';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function comparePhones() {
    try {
        console.log('--- Phone Number Comparison ---');
        console.log('User Phone = Personal Contact (Visible in UI)');
        console.log('Bot Phone  = Twilio Number (Used for n8n/Bot)');
        console.log('-------------------------------------------');

        const tenants = await prisma.tenant.findMany({
            include: {
                user: {
                    select: { email: true, name: true, phone: true }
                }
            }
        });

        tenants.forEach(t => {
            console.log(`\nAccount: ${t.businessName} (${t.user?.email})`);
            console.log(`   👤 User Phone (UI):   ${t.user?.phone || 'Not set'}`);
            console.log(`   🤖 Bot Phone (n8n):   ${t.twilioPhone || 'NULL (Not configured)'}`);

            if (t.user?.phone && !t.twilioPhone) {
                console.log(`   ⚠️  This account has a user phone but NO bot phone.`);
            }
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

comparePhones();
