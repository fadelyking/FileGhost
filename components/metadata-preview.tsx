"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, SlidersHorizontal } from "lucide-react";
import type { MetadataSummary } from "@/lib/metadata";

type Props = {
  metadataBefore: MetadataSummary;
  metadataAfter: MetadataSummary;
  showEducationalCleanState?: boolean;
};

type CategoryState = "removed" | "not_found" | "partial";

type Category = {
  label: string;
  patterns: string[];
  partial?: boolean;
};

const categories: Category[] = [
  { label: "GPS & location data", patterns: ["gps", "location", "latitude", "longitude"] },
  { label: "Camera model & device info", patterns: ["exif", "make", "model", "orientation", "camera", "device"] },
  { label: "Software & editor tags", patterns: ["software", "editor", "photoshop", "lightroom", "canva"] },
  { label: "XMP metadata", patterns: ["xmp"] },
  { label: "IPTC metadata", patterns: ["iptc"] },
  { label: "Timestamps & edit history", patterns: ["date", "time", "timestamp", "history", "created", "modified"] },
  { label: "Embedded notes & comments", patterns: ["comment", "note", "description", "artist", "copyright"] },
  { label: "AI provenance markers (C2PA)", patterns: ["c2pa", "provenance", "content credentials"], partial: true }
];

const technicalRows = [
  { label: "File format", before: "File format", after: "File format" },
  { label: "Dimensions", before: "Image size", after: "Image size" },
  { label: "Pixel density", before: "Pixel density", after: "Pixel density" },
  { label: "Color space", before: "Color space", after: "Color space" },
  { label: "GPS coordinates", before: "GPS/location data", after: "GPS/location data" },
  { label: "Camera model", before: "EXIF metadata", after: "EXIF metadata" },
  { label: "Software tag", before: "Software/editor tags", after: "Software/editor tags" },
  { label: "XMP metadata", before: "XMP metadata", after: "XMP metadata" },
  { label: "IPTC metadata", before: "IPTC metadata", after: "IPTC metadata" },
  { label: "C2PA markers", before: "C2PA/provenance data", after: "C2PA/provenance data" }
];

export function MetadataPreview({ metadataBefore, metadataAfter, showEducationalCleanState = true }: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const categoryStates = useMemo(() => getCategoryStates(metadataBefore, metadataAfter), [metadataBefore, metadataAfter]);
  const foundCount = categoryStates.filter((item) => item.state !== "not_found").length;
  const hasSensitiveMetadata = foundCount > 0;

  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      {hasSensitiveMetadata ? (
        <>
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[color:var(--color-text-muted)]">What was removed</p>
          <div className="mt-3 space-y-2">
            {categoryStates.map((item) => (
              <RemovalRow key={item.label} label={item.label} state={item.state} />
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-mint/20 bg-mint/[0.05] p-5 text-center">
          <CheckCircle2 className="mx-auto text-mint" size={32} />
          <h4 className="mt-3 text-lg font-bold text-[color:var(--color-text)]">
            {showEducationalCleanState ? "Good news — this file was already clean." : "This file had no metadata to remove."}
          </h4>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[color:var(--color-text-muted)]">
            {showEducationalCleanState
              ? "No sensitive metadata was detected in this file. This is common with screenshots and images that have already been processed."
              : "Your download is ready."}
          </p>
          {showEducationalCleanState ? <CleanEducationPanel /> : null}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowDetails((value) => !value)}
        className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-line bg-white/5 px-3 text-sm font-semibold text-white/78 focus-ring hover:bg-white/10"
      >
        <SlidersHorizontal size={16} />
        Show technical details
        <ChevronDown size={16} className={showDetails ? "rotate-180 transition" : "transition"} />
      </button>

      {showDetails ? <TechnicalTable metadataBefore={metadataBefore} metadataAfter={metadataAfter} /> : null}
    </div>
  );
}

function CleanEducationPanel() {
  const checked = [
    "GPS coordinates and location data",
    "Camera model and device identifiers",
    "Software and editor tags",
    "XMP and IPTC metadata",
    "Timestamps and edit history",
    "AI provenance markers (C2PA, where supported)",
    "Embedded notes and comments"
  ];

  return (
    <div className="mt-4 rounded-[10px] border border-line bg-[color:var(--color-surface-alt)] p-5 text-left">
      <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-text-muted)]">What FileGhost checks for</p>
      <p className="mt-2 text-[13px] text-[color:var(--color-text-muted)]">
        In typical photos taken on a phone or camera, we remove:
      </p>
      <div className="mt-3 space-y-2">
        {checked.map((item) => (
          <div key={item} className="flex gap-2 text-[13px] text-[color:var(--color-text-muted)]">
            <span className="font-bold text-mint">✓</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs italic text-[color:var(--color-text-muted)]">
        Try uploading a photo taken on your phone — you may be surprised what we find.
      </p>
    </div>
  );
}

function RemovalRow({ label, state }: { label: string; state: CategoryState }) {
  const isRemoved = state === "removed";
  const isPartial = state === "partial";
  const icon = isRemoved ? "✓" : isPartial ? "!" : "—";
  const status = isRemoved ? "Removed" : isPartial ? "Removed where supported" : "Not found";

  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm ${
        isRemoved ? "bg-mint/[0.05]" : isPartial ? "bg-[#F59E0B]/[0.05]" : ""
      }`}
      title={isPartial ? "C2PA removal depends on the file and how it was created." : undefined}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className={`w-4 shrink-0 text-center font-bold ${isRemoved ? "text-mint" : isPartial ? "text-[#F59E0B]" : "text-[color:var(--color-text-muted)]"}`}>
          {icon}
        </span>
        <span className={`${isRemoved || isPartial ? "font-medium text-[color:var(--color-text)]" : "text-[color:var(--color-text-muted)]"}`}>{label}</span>
      </div>
      <span className={`shrink-0 text-[13px] ${isRemoved ? "text-mint" : isPartial ? "text-[#F59E0B]" : "text-[color:var(--color-text-muted)]"}`}>{status}</span>
    </div>
  );
}

function TechnicalTable({ metadataBefore, metadataAfter }: Props) {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[560px] border-collapse text-left">
        <thead className="bg-[color:var(--color-surface-alt)]">
          <tr>
            <th className="px-3 py-2 text-xs font-medium uppercase tracking-[0.06em] text-[color:var(--color-text-muted)]">Field</th>
            <th className="px-3 py-2 text-xs font-medium uppercase tracking-[0.06em] text-[color:var(--color-text-muted)]">Before</th>
            <th className="px-3 py-2 text-xs font-medium uppercase tracking-[0.06em] text-[color:var(--color-text-muted)]">After</th>
          </tr>
        </thead>
        <tbody>
          {technicalRows.map((row, index) => {
            const values = readTechnicalValues(metadataBefore, metadataAfter, row.before);
            return (
              <tr key={row.label} className={index % 2 === 0 ? "bg-transparent" : "bg-[color:var(--color-surface-alt)]/60"}>
                <td className="px-3 py-2 text-sm text-[color:var(--color-text)]">{row.label}</td>
                <td className={`px-3 py-2 text-sm ${values.before === "Found" ? "text-[#EF4444]" : "text-[color:var(--color-text)]"}`}>{values.before}</td>
                <td className={`px-3 py-2 text-sm ${values.after === "Removed" ? "text-mint" : values.after === "Found" ? "text-[#EF4444]" : "text-[color:var(--color-text)]"}`}>{values.after}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function getCategoryStates(before: MetadataSummary, after: MetadataSummary) {
  const beforeKeys = Object.keys(before);
  const afterKeys = Object.keys(after);
  const hasAnyHiddenMarkers = beforeKeys.some((key) => hiddenKey(key));

  return categories.map((category) => {
    const found = hasAnyHiddenMarkers || hasPattern(beforeKeys, category.patterns);
    const stillPresent = hasPattern(afterKeys, category.patterns);
    let state: CategoryState = "not_found";

    if (found) {
      state = category.partial ? "partial" : stillPresent ? "partial" : "removed";
    }

    return { label: category.label, state };
  });
}

function hasPattern(keys: string[], patterns: string[]) {
  return keys.some((key) => patterns.some((pattern) => key.toLowerCase().includes(pattern)));
}

function hiddenKey(key: string) {
  const lower = key.toLowerCase();
  return !["file format", "image size", "pixel density", "color space"].includes(lower);
}

function readTechnicalValues(before: MetadataSummary, after: MetadataSummary, key: string) {
  const beforeValue = before[key];
  const afterValue = after[key];

  if (!hiddenKey(key)) {
    return {
      before: beforeValue == null ? "—" : String(beforeValue),
      after: afterValue == null ? "—" : String(afterValue)
    };
  }

  const wasFound = beforeValue != null;
  const stillFound = afterValue != null;
  return {
    before: wasFound ? "Found" : "Not found",
    after: wasFound ? (stillFound ? "Found" : "Removed") : "Not found"
  };
}
