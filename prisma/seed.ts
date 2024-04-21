import { PrismaClient, QrType } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    await prisma.qrcode.upsert({
        where: { id: '2d6f1979-67c3-4860-b074-3a8ee8b5eea3' },
        update: {},
        create: {
            id: '2d6f1979-67c3-4860-b074-3a8ee8b5eea3',
            shirtId: 'BDAEX223',
            urlCode: 'http://localhost:5173/BDAEX223',
            activationCode: 'AA3-322-1ZX',
            type: QrType.TEXT,
        },
    });

    await prisma.qrcode.upsert({
        where: { id: '4d6f1979-67c3-4860-b074-3a8ee8b5dfc2' },
        update: {
            purchased: true,
        },
        create: {
            id: '4d6f1979-67c3-4860-b074-3a8ee8b5dfc2',
            shirtId: 'XSE22AS',
            urlCode: 'http://localhost:5173/XSE22AS',
            activationCode: 'AA3-822-AXF',
            purchased: true,
            type: QrType.TEXT,
        },
    });

    await prisma.qrcode.upsert({
        where: { id: '4d6f1979-67c3-4860-b074-3a8ee8b5dfbb' },
        update: {},
        create: {
            id: '4d6f1979-67c3-4860-b074-3a8ee8b5dfbb',
            shirtId: 'XSE22BB',
            urlCode: 'http://localhost:5173/XSE22BB',
            activationCode: 'AA3-822-ABB',
            type: QrType.TEXT,
        },
    });

    await prisma.qrcode.upsert({
        where: { id: '4d6f1979-67c3-4860-b074-3a8ee8b5dfcc' },
        update: {},
        create: {
            id: '4d6f1979-67c3-4860-b074-3a8ee8b5dfcc',
            shirtId: 'XSE22CC',
            urlCode: 'http://localhost:5173/XSE22CC',
            activationCode: 'AA3-822-ACC',
            type: QrType.TEXT,
        },
    });

    // const qrcode = await prisma.qrcode.create({
    //     data: {
    //         pinCode: '1234',
    //     }

    // });

    // const alice = await prisma.quser.upsert({
    //     where: { email: 'alice@prisma.io' },
    //     update: {},
    //     create: {
    //         email: 'alice@prisma.io',
    //         name: 'Alice',
    //         posts: {
    //             create: {
    //                 title: 'Check out Prisma with Next.js',
    //                 content: 'https://www.prisma.io/nextjs',
    //                 published: true,
    //             },
    //         },
    //     },
    // })
    // const bob = await prisma.user.upsert({
    //     where: { email: 'bob@prisma.io' },
    //     update: {},
    //     create: {
    //         email: 'bob@prisma.io',
    //         name: 'Bob',
    //         posts: {
    //             create: [
    //                 {
    //                     title: 'Follow Prisma on Twitter',
    //                     content: 'https://twitter.com/prisma',
    //                     published: true,
    //                 },
    //                 {
    //                     title: 'Follow Nexus on Twitter',
    //                     content: 'https://twitter.com/nexusgql',
    //                     published: true,
    //                 },
    //             ],
    //         },
    //     },
    // })
    // console.log({ alice, bob })
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
