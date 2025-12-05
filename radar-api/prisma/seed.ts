import { PrismaClient } from '@prisma/client';
import { seedData } from './seed-data';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');
    for (const data of seedData) {
        // Example: Create a user
        // const user = await prisma.user.create({
        //   data: {
        //     clerkId: data.clerkId,
        //     // ... other user data
        //   },
        // });
        // console.log(`Created user with id: ${user.id}`);
    }
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
