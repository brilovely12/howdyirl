import Link from "next/link";
import Image from "next/image";
import type { Spot } from "@/lib/types";
import { color, initials, relTime } from "@/lib/format";
import CheckBadge from "./CheckBadge";

export default function SpotRow({ spot, index, city }: { spot: Spot; index: number; city: string }) {
  return (
    <Link href={`/${city}/spots/${spot.slug}`} className="row">
      {spot.image_url ? (
        <Image className="thumb" src={spot.image_url} alt={spot.name} width={64} height={64} style={{ objectFit: "cover" }} />
      ) : (
        <div className="thumb" style={{ background: color(index) }}>
          {initials(spot.name)}
        </div>
      )}
      <div>
        <div className="ttl">
          {spot.name}
          {spot.claimed && <CheckBadge />}
        </div>
        <div className="desc">{spot.description}</div>
        <div className="meta">
          {spot.address && <>{spot.address}<span className="dot">·</span></>}
          updated {relTime(spot.updated_at)}
        </div>
        <div className="topics-row">
          {spot.tags.map((t) => (
            <span className="topic" key={t}>
              {t}
            </span>
          ))}
        </div>
      </div>
      <div />
    </Link>
  );
}
