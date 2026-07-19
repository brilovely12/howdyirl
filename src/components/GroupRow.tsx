import Link from "next/link";
import Image from "next/image";
import type { Group } from "@/lib/types";
import { color, initials, relTime } from "@/lib/format";
import CheckBadge from "./CheckBadge";

export default function GroupRow({ group, index, city }: { group: Group; index: number; city: string }) {
  return (
    <Link href={`/${city}/groups/${group.slug}`} className="row">
      {group.image_url ? (
        <Image className="thumb" src={group.image_url} alt={group.name} width={64} height={64} style={{ objectFit: "cover" }} />
      ) : (
        <div className="thumb" style={{ background: color(index) }}>
          {initials(group.name)}
        </div>
      )}
      <div>
        <div className="ttl">
          {group.name}
          {group.claimed && <CheckBadge />}
        </div>
        <div className="desc">{group.description}</div>
        <div className="meta">
          updated {relTime(group.updated_at)}
        </div>
        <div className="topics-row">
          {group.tags.map((t) => (
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
