import fs from 'node:fs/promises';
import path from 'node:path';

const projectRoot = process.cwd();
const svgPath = path.join(projectRoot, 'app', 'icon.svg');
const outIcoPath = path.join(projectRoot, 'app', 'favicon.ico');

async function main() {
  const svg = await fs.readFile(svgPath);

  let sharp;
  let pngToIco;
  try {
    ({ default: sharp } = await import('sharp'));
  } catch (e) {
    throw new Error(
      'Missing dev dependency "sharp". Install it with: npm i -D sharp\n' +
        String(e)
    );
  }

  try {
    ({ default: pngToIco } = await import('png-to-ico'));
  } catch (e) {
    throw new Error(
      'Missing dev dependency "png-to-ico". Install it with: npm i -D png-to-ico\n' +
        String(e)
    );
  }

  const sizes = [16, 32, 48, 64, 128, 256];
  const pngBuffers = await Promise.all(
    sizes.map((size) =>
      sharp(svg, { density: 512 })
        .resize(size, size)
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toBuffer()
    )
  );

  const icoBuffer = await pngToIco(pngBuffers);
  await fs.writeFile(outIcoPath, icoBuffer);

  // eslint-disable-next-line no-console
  console.log(`Wrote ${path.relative(projectRoot, outIcoPath)} (${icoBuffer.length} bytes)`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
