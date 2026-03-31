export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <h1 className="font-serif text-4xl tracking-[0.2em] text-foreground">
          WRISTLIST
        </h1>
        <div className="h-px w-12 bg-gold" />
        <p className="text-sm tracking-[0.15em] text-muted-text">
          SHARE YOUR COLLECTION
        </p>
      </div>
    </div>
  );
}
