export function BananaDecorations() {
  return (
    <>
      {/* Top right decoration */}
      <div className="absolute top-20 right-0 w-32 h-32 opacity-20 pointer-events-none select-none hidden lg:block">
        <div className="text-8xl transform rotate-45">🍌</div>
      </div>

      {/* Top left decoration */}
      <div className="absolute top-40 left-0 w-24 h-24 opacity-15 pointer-events-none select-none hidden lg:block">
        <div className="text-6xl transform -rotate-30">🍌</div>
      </div>

      {/* Middle right decoration */}
      <div className="absolute top-[60vh] right-10 w-20 h-20 opacity-10 pointer-events-none select-none hidden xl:block">
        <div className="text-5xl transform rotate-12">🍌</div>
      </div>

      {/* Bottom left decoration */}
      <div className="absolute bottom-40 left-20 w-28 h-28 opacity-15 pointer-events-none select-none hidden lg:block">
        <div className="text-7xl transform -rotate-45">🍌</div>
      </div>
    </>
  )
}
