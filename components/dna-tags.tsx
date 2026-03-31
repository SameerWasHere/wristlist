interface DnaTag {
  text: string;
  primary: boolean;
}

interface DnaTagsProps {
  tags: DnaTag[];
}

export function DnaTags({ tags }: DnaTagsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag.text}
          className={`
            rounded-full text-[11px] font-semibold px-4 py-[7px]
            ${
              tag.primary
                ? "bg-gradient-to-b from-[#f5f0e3] to-[#ebe4d0] text-[#8a7a5a] border border-[rgba(138,122,90,0.2)]"
                : "bg-[rgba(26,24,20,0.04)] text-[rgba(26,24,20,0.4)]"
            }
          `}
        >
          {tag.text}
        </span>
      ))}
    </div>
  );
}
