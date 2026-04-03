export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <div
      className="border-2 border-[rgba(138,122,90,0.2)] border-t-[#8a7a5a] rounded-full animate-spin"
      style={{ width: size, height: size }}
    />
  );
}
