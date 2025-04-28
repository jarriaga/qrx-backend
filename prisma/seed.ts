import { PrismaClient, QrType } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    await prisma.qrcode.upsert({
        where: { id: '2d6f1979-67c3-4860-b074-3a8ee8b5eea3' },
        update: {},
        create: {
            id: '2d6f1979-67c3-4860-b074-3a8ee8b5eea3',
            type: QrType.TEXT,
        },
    });
}
main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
