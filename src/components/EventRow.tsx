import Link from "next/link";
import Image from "next/image";
import type { EventRow as EventRowType } from "@/lib/types";
import { color, initials, eventDate, eventTime } from "@/lib/format";

export default function EventRow({ event, index, city }: { event: EventRowType; index: number; city: string }) {
  return (
    <Link href={`/${city}/events/${event.slug}`} className="row">
      {event.image_url ? (
        <Image className="thumb" src={event.image_url} alt={event.name} width={64} height={64} style={{ objectFit: "cover" }} />
      ) : (
        <div className="thumb" style={{ background: color(index + 3) }}>
          {initials(event.name)}
        </div>
      )}
      <div>
        <div className="ttl">{event.name}</div>
        <div className="desc">{event.description}</div>
        <div className="meta">
          {event.host_group_name && (
            <>
              Hosted by {event.host_group_name}
              <span className="dot">·</span>
            </>
          )}
          <span className="tag evt">event</span>
        </div>
        <div className="topics-row">
          {event.tags.map((t) => (
            <span className="topic" key={t}>
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="when">
        <b>{eventDate(event.next_at ?? event.starts_at)}</b>
        {eventTime(event.starts_at)}
        {event.recurrence && <span className="recur">{event.recurrence}</span>}
      </div>
    </Link>
  );
}
