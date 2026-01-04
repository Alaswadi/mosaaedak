import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Fetching tenants...');
        const tenants = await prisma.tenant.findMany({
            select: { id: true, businessName: true }
        });
        console.log(`Found ${tenants.length} tenants.`);

        if (tenants.length === 0) return;

        const tenantIds = tenants.map(t => t.id);

        console.log('\nFetching UsageLogs count...');
        const totalLogs = await prisma.usageLog.count();
        console.log(`Total UsageLogs in DB: ${totalLogs}`);

        console.log('\nDetailed Breakdown:');
        for (const tenant of tenants) {
            const logs = await prisma.usageLog.count({
                where: { tenantId: tenant.id }
            });
            const inboundLogs = await prisma.usageLog.count({
                where: { tenantId: tenant.id, direction: 'INBOUND' }
            });
            const distinctSenders = await prisma.usageLog.groupBy({
                by: ['fromPhone'],
                where: { tenantId: tenant.id, direction: 'INBOUND' },
            });

            console.log(`Tenant: ${tenant.businessName} (${tenant.id})`);
            console.log(`- Total Logs: ${logs}`);
            console.log(`- Inbound Logs: ${inboundLogs}`);
            console.log(`- Distinct Inbound Chatters: ${distinctSenders.length}`);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
