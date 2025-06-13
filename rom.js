export async function loadChrRom(url) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const data = new Uint8Array(buffer);

  const prgSize = data[4] * 16 * 1024;
  const chrSize = data[5] * 8 * 1024;

  const chrStart = 16 + prgSize;
  const chrData = data.slice(chrStart, chrStart + chrSize);

  return chrData;
}
