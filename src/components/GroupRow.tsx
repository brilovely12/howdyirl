import Link from "next/link";
import type { Group } from "@/lib/types";
import { color, initials, relTime } from "@/lib/format";
import CheckBadge from "./CheckBadge";

export default function GroupRow({ group, index }: { group: Group; index: number }) {
  return (
    <Link href={`/groups/${group.id}`} className="row">
      <div className="thumb" style={{ background: color(index) }}>
        {initials(group.name)}
      </div>
      <div>
        <div className="ttl">
          {group.name}
          {group.claimed && <CheckBadge />}
        </div>
        <div className="desc">{group.description}</div>
        <div className="meta">
          {group.joins_count} members<span className="dot">·</span>updated {relTime(group.updated_at)}
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
