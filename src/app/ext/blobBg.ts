export function generateBlobSVG(
  width: number,
  height: number,
  darkness: number, // Use this value to control lightness
  blobCount: number = 6
) {
  function randomPastel() {
    const hue = Math.floor(Math.random() * 360);
    // Combine the darkness value with a random factor for lightness
    // The range is now centered around the darkness setting
    const baseLightness = 70 - (darkness / 1.5); // Adjust multiplier for desired range
    const lightness = baseLightness + (Math.random() * 20 - 10); // Randomize +/- 10%
    const saturation = 50 + Math.random() * 30; // Randomize saturation to add variety
    
    // Ensure lightness stays within a valid range
    const finalLightness = Math.min(Math.max(lightness, 20), 80);

    return `hsl(${hue}, ${saturation}%, ${finalLightness}%)`;
  }

  const bgColor = randomPastel();

  let blobs = "";
  for (let i = 0; i < blobCount; i++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const r = Math.max(width, height) / 3 + Math.random() * 150;
    const color = randomPastel();
    blobs += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" />`;
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;">
  <defs>
    <filter id="blur1" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="161" result="blur" />
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="${bgColor}" />
  <g filter="url(#blur1)">
    ${blobs}
  </g>
</svg>`;
}