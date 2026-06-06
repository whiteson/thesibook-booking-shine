import logoAsset from "@/assets/thesibook-logo.png.asset.json";

export function Logo({ className = "h-9" }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt="ThesiBook"
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}
