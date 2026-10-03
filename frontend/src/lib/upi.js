// Handles such as name@okaxis have no dot, so the dotted suffix is optional.
const UPI_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{1,63}@[A-Za-z0-9][A-Za-z0-9-]{0,31}(\.[A-Za-z0-9][A-Za-z0-9-]{0,31})*$/;

export const isValidUpiId = (value) => UPI_PATTERN.test((value || '').trim());

export const formatCurrency = (value) => {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num.toFixed(2) : '0.00';
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read that image'));
    reader.readAsDataURL(file);
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('That file is not a readable image'));
    img.src = src;
  });

const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality));

/**
 * Phone cameras produce 3-6 MB photos, but the API caps uploads at 512 KB.
 * Downscaling in the browser also strips EXIF location metadata, which we do
 * not want to store alongside someone's payment QR.
 *
 * PNG is tried first because QR codes need hard edges; a JPEG fallback keeps
 * photographic QR screenshots under the limit.
 */
export async function prepareQrImage(file, maxDimension = 640, maxBytes = 380_000) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file (PNG, JPG or WEBP)');
  }

  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(dataUrl);

  const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  let blob = await canvasToBlob(canvas, 'image/png');
  let type = 'image/png';

  if (!blob || blob.size > maxBytes) {
    blob = await canvasToBlob(canvas, 'image/jpeg', 0.9);
    type = 'image/jpeg';
  }
  if (!blob) {
    throw new Error('Could not process that image');
  }
  if (blob.size > maxBytes) {
    throw new Error('That image is still too large after resizing. Try a screenshot of the QR instead.');
  }

  return new File([blob], 'upi-qr.' + (type === 'image/png' ? 'png' : 'jpg'), { type });
}