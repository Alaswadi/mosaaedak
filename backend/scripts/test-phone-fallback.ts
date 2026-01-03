
process.env.DATABASE_URL = 'postgresql://mosaaedak:mosaaedak_db_password_2026@localhost:5433/mosaaedak?schema=public';
process.env.REDIS_URL = 'redis://localhost:6379';

import { tenantService } from '../src/services/tenantService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function testFallback() {
    try {
        const phone = '+19894472583';
        console.log(`Testing lookup for phone: ${phone}`);

        // First, verify the state in DB for clarity
        const user = await prisma.user.findFirst({
            where: { phone: phone },
            include: { tenant: true }
        });

        console.log('--- DB STATE ---');
        console.log(`User found with phone? ${!!user}`);
        if (user) {
            console.log(`User Email: ${user.email}`);
            console.log(`User Tenant ID: ${user.tenantId}`);
            console.log(`Tenant TwilioPhone: ${user.tenant?.twilioPhone}`);
        } else {
            console.log('User not found.');
        }

        const tenantByDirectLookup = await prisma.tenant.findUnique({
            where: { twilioPhone: phone }
        });
        console.log(`Direct Tenant Lookup (should be null based on problem description): ${!!tenantByDirectLookup}`);
        console.log('----------------');

        // Now test the service
        console.log('Calling tenantService.getTenantByPhone...');
        const result = await tenantService.getTenantByPhone(phone);

        if (result) {
            console.log('✅ SUCCESS: Tenant found via service!');
            console.log(`Tenant ID: ${result.id}`);
            console.log(`Business Name: ${result.businessName}`);
        } else {
            console.log('❌ FAILURE: Tenant NOT found via service.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
        process.exit();
    }
}

testFallback();
