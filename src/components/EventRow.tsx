import Link from "next/link";
import type { EventRow as EventRowType } from "@/lib/types";
import { color, initials, eventDate, eventTime } from "@/lib/format";

export default function EventRow({ event, index }: { event: EventRowType; index: number }) {
  return (
    <Link href={`/events/${event.id}`} className="row">
      {event.image_url ? (
        <img className="thumb" src={event.image_url} alt="" style={{ objectFit: "cover" }} />
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
