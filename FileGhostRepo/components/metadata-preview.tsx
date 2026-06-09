"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, MapPinOff, SlidersHorizontal } from "lucide-react";
import type { MetadataSummary } from "@/lib/metadata";

type Props = {
  metadataBefore: MetadataSummary;
  metadataAfter: MetadataSummary;
};

export function MetadataPreview({ metadataBefore, metadataAfter }: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const beforeLabels = useMemo(() => humanBefore(metadataBefore), [metadataBefore]);
  const afterLabels = useMemo(() => humanAfter(metadataBefore, metadataAfter), [metadataBefore, metadataAfter]);

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="font-semibold">Before cleaning</h4>
          <div className="mt-3 space-y-2">
            {beforeLabels.map((label) => (
              <Fact key={label} icon="before" label={label} />
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold">After cleaning</h4>
          <div className="mt-3 space-y-2">
            {afterLabels.map((label) => (
              <Fact key={label} icon="after" label={label} />
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowDetails((value) => !value)}
        className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm font-semibold text-white/78 focus-ring hover:bg-white/10"
      >
        <SlidersHorizontal size={16} />
        Show technical details
        <ChevronDown size={16} className={showDetails ? "rotate-180 transition" : "transition"} />
      </button>

      {showDetails ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Technical title="Before JSON" data={metadataBefore} />
          <Technical title="After JSON" data={metadataAfter} />
        </div>
      ) : null}
    </div>
  );
}

function Fact({ icon, label }: { icon: "before" | "after"; label: string }) {
  const Icon = icon === "before" ? MapPinOff : CheckCircle2;
  return (
    <div className="flex gap-2 rounded-lg border border-white/[0.08] bg-ink/50 px-3 py-2 text-sm text-white/72">
      <Icon className="mt-0.5 shrink-0 text-mint" size={16} />
      <span>{label}</span>
    </div>
  );
}

function Technical({ title, data }: { title: string; data: MetadataSummary }) {
  return (
    <div className="rounded-lg border border-white/10 bg-ink/70 p-3">
      <p className="mb-2 text-sm font-semibold">{title}</p>
      <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-white/62">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

function humanBefore(metadata: MetadataSummary) {
  const keys = Object.keys(metadata);
  const labels = [];

  if (hasKey(keys, "GPS") || hasKey(keys, "location")) labels.push("GPS/location data found");
  if (hasKey(keys, "EXIF")) labels.push("EXIF metadata found");
  if (hasKey(keys, "XMP")) labels.push("XMP metadata found");
  if (hasKey(keys, "IPTC")) labels.push("IPTC metadata found");
  if (hasKey(keys, "C2PA") || hasKey(keys, "provenance")) labels.push("C2PA/provenance data may be present");
  if (hasKey(keys, "Software") || hasKey(keys, "editor")) labels.push("Software/editor tags may be present");
  if (hasKey(keys, "Orientation")) labels.push("Orientation data found");

  if (metadata["File format"]) labels.push(`File format: ${metadata["File format"]}`);
  if (metadata["Image size"]) labels.push(`Image size: ${metadata["Image size"]}`);

  return labels.length ? labels : ["No obvious hidden metadata found"];
}

function humanAfter(before: MetadataSummary, after: MetadataSummary) {
  const beforeKeys = Object.keys(before);
  const afterKeys = Object.keys(after);
  const labels = ["Clean file ready"];

  if ((hasKey(beforeKeys, "GPS") || hasKey(beforeKeys, "location")) && !hasKey(afterKeys, "GPS")) {
    labels.unshift("GPS/location data removed");
  }
  if (hasKey(beforeKeys, "EXIF") && !hasKey(afterKeys, "EXIF")) labels.unshift("Camera/device info removed");
  if (hasKey(beforeKeys, "Software") || hasKey(beforeKeys, "editor")) labels.unshift("Software/editor tags reduced");
  if (Object.keys(before).length > Object.keys(after).length) labels.unshift("Hidden metadata reduced");

  return labels;
}

function hasKey(keys: string[], pattern: string) {
  return keys.some((key) => key.toLowerCase().includes(pattern.toLowerCase()));
}
