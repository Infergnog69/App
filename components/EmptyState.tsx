// The friendly "nothing here yet" block, with an optional button.
import Link from "next/link";
import Icon, { type IconName } from "./Icon";

type Props = { icon: IconName; title: string; text: string; href?: string; action?: string };

export default function EmptyState({ icon, title, text, href, action }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon name={icon} />
      </div>
      <h2>{title}</h2>
      <p>{text}</p>
      {href && action && (
        <Link href={href} className="primary-button compact-button" style={{ textDecoration: "none" }}>
          {action}
        </Link>
      )}
    </div>
  );
}
