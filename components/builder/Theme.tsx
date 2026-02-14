"use client";

type Props = {
  primary?: string;
  secondary?: string;
  light?: string;
  text?: string;
  muted?: string;
  bg?: string;

  headingFont?: string;
  bodyFont?: string;
  radius?: number;

  children?: React.ReactNode;
};

export default function Theme({
  primary = "#0B3C6F",
  secondary = "#2F80C1",
  light = "#E6F2FA",
  text = "#2B2B2B",
  muted = "#6F7A85",
  bg = "#ffffff",
  headingFont = "var(--font-lora)",
  bodyFont = "var(--font-lora)",
  radius = 28,
  children,
}: Props) {
  return (
    <div
      style={
        {
          // your CSS tokens
          ["--primary" as any]: primary,
          ["--secondary" as any]: secondary,
          ["--light" as any]: light,
          ["--text" as any]: text,
          ["--muted" as any]: muted,
          ["--bg" as any]: bg,

          // optional typography
          ["--font-heading" as any]: headingFont,
          ["--font-body" as any]: bodyFont,

          // optional radius token if you want to use it later
          ["--radius" as any]: `${radius}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
