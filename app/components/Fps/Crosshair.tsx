export default function Crosshair() {
  return (
    <div className="pointer-events-none fixed top-1/2 left-1/2 z-50 w-0 h-0">
      <div className="absolute w-[2px] h-[5px] bg-white top-[-7px] left-[-1px]" />
      <div className="absolute w-[2px] h-[5px] bg-white bottom-[-7px] left-[-1px]" />
      <div className="absolute w-[5px] h-[2px] bg-white left-[-7px] top-[-1px]" />
      <div className="absolute w-[5px] h-[2px] bg-white right-[-7px] top-[-1px]" />
    </div>
  );
}
