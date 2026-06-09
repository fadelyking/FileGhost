import sharp, { type FormatEnum, type Metadata } from "sharp";

export type MetadataSummary = Record<string, string | number | boolean | null>;

const hiddenMarkers = [
  "exif",
  "xmp",
  "iptc",
  "gps",
  "make",
  "model",
  "software",
  "artist",
  "copyright",
  "c2pa",
  "provenance",
  "content credentials"
];

export function isAllowedImageType(type: string) {
  return ["image/jpeg", "image/png", "image/webp"].includes(type);
}

export function extensionForType(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export function sharpFormatForType(type: string): keyof FormatEnum {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpeg";
}

export async function readSharpMetadata(buffer: Buffer) {
  return sharp(buffer, { failOn: "error" }).metadata();
}

export function extractSimpleMetadata(metadata: Metadata, buffer?: Buffer): MetadataSummary {
  const summary: MetadataSummary = {};

  if (metadata.format) summary["File format"] = metadata.format.toUpperCase();
  if (metadata.width && metadata.height) summary["Image size"] = `${metadata.width} x ${metadata.height}`;
  if (metadata.exif) summary["EXIF metadata"] = "Found";
  if (metadata.xmp) summary["XMP metadata"] = "Found";
  if (metadata.iptc) summary["IPTC metadata"] = "Found";
  if (metadata.orientation) summary["Orientation data"] = "Found";
  if (metadata.density) summary["Pixel density"] = metadata.density;
  if (metadata.space) summary["Color space"] = metadata.space;

  if (buffer) {
    const text = buffer.toString("latin1").toLowerCase();
    if (hiddenMarkers.some((marker) => text.includes(marker))) {
      summary["Hidden metadata markers"] = "Found";
    }
    if (text.includes("gps") || text.includes("latitude") || text.includes("longitude")) {
      summary["GPS/location data"] = "May be present";
    }
    if (text.includes("c2pa") || text.includes("content credentials") || text.includes("provenance")) {
      summary["C2PA/provenance data"] = "May be present";
    }
    if (text.includes("photoshop") || text.includes("lightroom") || text.includes("canva")) {
      summary["Software/editor tags"] = "May be present";
    }
  }

  return summary;
}

export async function cleanImageBuffer(buffer: Buffer, mimeType: string) {
  const format = sharpFormatForType(mimeType);
  const pipeline = sharp(buffer, { failOn: "error" }).rotate();

  // Sharp strips common metadata by default when re-encoding because we do not call withMetadata().
  // C2PA/provenance data is also usually removed by re-encoding, but complete guarantees require
  // a dedicated C2PA/ExifTool verification layer in a hardened worker.
  if (format === "png") {
    return pipeline.png({ compressionLevel: 9, quality: 92 }).toBuffer();
  }

  if (format === "webp") {
    return pipeline.webp({ quality: 92 }).toBuffer();
  }

  return pipeline.jpeg({ quality: 92, mozjpeg: true }).toBuffer();
}

export function removedMetadata(before: MetadataSummary, after: MetadataSummary) {
  const removed: MetadataSummary = {};
  for (const [key, value] of Object.entries(before)) {
    if (!(key in after)) removed[key] = value;
  }
  return removed;
}
