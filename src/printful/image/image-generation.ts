import { createCanvas, loadImage, registerFont } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';

// Register the font
function registerCustomFont(fontFamily: string): void {
    try {
        // Try both absolute and relative paths
        const absoluteFontPath = path.join(
            __dirname,
            'fonts',
            `${fontFamily}.ttf`,
        );
        const relativeFontPath = `./src/printful/image/fonts/${fontFamily}.ttf`;

        console.log('Checking font paths:');
        console.log(`- Absolute path: ${absoluteFontPath}`);
        console.log(`- Relative path: ${relativeFontPath}`);
        console.log(`- __dirname: ${__dirname}`);

        // Check if files exist
        const absoluteExists = fs.existsSync(absoluteFontPath);
        const relativeExists = fs.existsSync(relativeFontPath);

        console.log(`- Absolute path exists: ${absoluteExists}`);
        console.log(`- Relative path exists: ${relativeExists}`);

        // Register using the path that exists
        if (absoluteExists) {
            console.log(
                `Registering font using absolute path: ${absoluteFontPath}`,
            );
            registerFont(absoluteFontPath, { family: fontFamily });
        } else if (relativeExists) {
            console.log(
                `Registering font using relative path: ${relativeFontPath}`,
            );
            registerFont(relativeFontPath, { family: fontFamily });
        } else {
            throw new Error('Font file not found at any of the expected paths');
        }
    } catch (error) {
        console.error('Error registering font:', error);
    }
}

export async function createCombinedTemplate(qrCodeBuffer: Buffer) {
    try {
        // Register the font
        const fontFamily = 'ArchitectsDaughter-Regular';
        registerCustomFont(fontFamily);

        // Load the three separate images
        const cornerFrameImage = await loadImage(
            './src/printful/image/corner-frame-tr.png',
        ); // Image 1
        const topMshapeImage = await loadImage(
            './src/printful/image/top-mshape-tr.png',
        ); // Image 2
        const qrificTextImage = await loadImage(
            './src/printful/image/qrific-text-tr.png',
        ); // Image 3
        const qrCodeImage = await loadImage(qrCodeBuffer); // Image 4

        // Create a canvas to combine all images
        const width = 1200;
        const height = 1600;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Make background transparent
        ctx.clearRect(0, 0, width, height);

        // Try different ways to specify the font
        console.log('Setting font...');

        // First attempt with registered font name
        ctx.font = `80px "${fontFamily}"`;
        console.log(`Font set to: ${ctx.font}`);

        // Add "SCAN ME!" text 100px from top with fallback fonts
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('SCAN ME!', width / 2, 240);

        // Position and draw images
        // Top M-shape
        const mshapeY = 200;
        ctx.drawImage(
            topMshapeImage,
            (width - topMshapeImage.width / 1.3) / 2,
            mshapeY,
            topMshapeImage.width / 1.3,
            topMshapeImage.height / 1.3,
        );

        // QR Code frame corners
        const frameY = 1350;
        ctx.drawImage(
            cornerFrameImage,
            (width - cornerFrameImage.width / 1.7) / 2,
            frameY,
            cornerFrameImage.width / 1.7,
            cornerFrameImage.height / 1.7,
        );
        // Draw black circle dot
        ctx.beginPath();
        ctx.arc(width / 2 + 108, frameY + 135, 15, 0, Math.PI * 2); // 5px radius circle
        ctx.fillStyle = '#7a64c9';
        ctx.fill();

        // QRIFIC.ME text
        const textY = frameY;
        ctx.drawImage(
            qrificTextImage,
            (width - qrificTextImage.width / 2) / 2,
            textY + 60,
            qrificTextImage.width / 2,
            qrificTextImage.height / 2,
        );

        // QR Code
        const qrCodeY = 420;
        ctx.drawImage(
            qrCodeImage,
            (width - qrCodeImage.width / 1.3) / 2,
            qrCodeY,
            qrCodeImage.width / 1.3,
            qrCodeImage.height / 1.3,
        );

        // Save the combined image
        const buffer = canvas.toBuffer('image/png');

        return buffer;
    } catch (error) {
        console.error('Error creating combined template:', error);
    }
}
