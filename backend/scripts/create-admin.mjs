import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdmin(email, password, name) {
    try {
        // Check if admin already exists
        const existing = await prisma.user.findUnique({
            where: { email }
        });

        if (existing) {
            console.log(`❌ User with email ${email} already exists`);
            process.exit(1);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create admin user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                name,
                role: 'ADMIN',
            }
        });

        console.log(`✅ Admin user created successfully!`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Role: ${user.role}`);
        console.log(`\nYou can now log in at http://localhost with these credentials.`);

    } catch (error) {
        console.error('❌ Failed to create admin:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 3) {
    console.log('Usage: node scripts/create-admin.mjs <email> <password> <name>');
    console.log('Example: node scripts/create-admin.mjs admin@mosaaedak.com Admin@123 "Admin Name"');
    process.exit(1);
}

const [email, password, name] = args;
createAdmin(email, password, name);
