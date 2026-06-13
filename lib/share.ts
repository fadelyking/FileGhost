export function canShareFiles(file: File) {
  if (typeof navigator === "undefined") return false;
  if (!navigator.canShare) return false;
  return navigator.canShare({ files: [file] });
}
