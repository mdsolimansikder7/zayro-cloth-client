import { Star } from "lucide-react";

// Rating star - rating onujayi koto % yellow hobe
// (4.5 mane 90% star yellow, baki ta grey)
// size "sm" card er jonno, "md" details page er jonno
export default function Stars({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const starSize = size === "md" ? "size-5" : "size-3.5";
  const gap = size === "md" ? "gap-1" : "gap-0.5";

  return (
    <div className="relative inline-flex">
      {/* nicher layer: 5 ta grey star */}
      <div className={`flex ${gap}`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`${starSize} shrink-0 fill-black/10 text-black/10`}
          />
        ))}
      </div>

      {/* upore layer: yellow star gula, rating er onujayi width kete dewa */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${(rating / 5) * 100}%` }}
      >
        <div className={`flex w-max ${gap}`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              className={`${starSize} shrink-0 fill-[#FFC633] text-[#FFC633]`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
