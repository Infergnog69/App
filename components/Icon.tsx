// The icon set from the prototype, as one component: <Icon name="heart" />.
// Styling (size, stroke) comes from the `svg` rules in app/globals.css.

const PATHS = {
  home: <path d="M3 10.8 12 3l9 7.8v9.7a.5.5 0 0 1-.5.5H15v-6H9v6H3.5a.5.5 0 0 1-.5-.5v-9.7Z" />,
  search: (<><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>),
  plus: <path d="M12 4v16M4 12h16" />,
  chat: (<><path d="M4 4h16v12H9l-5 4V4Z" /><path d="M8 10h.01M12 10h.01M16 10h.01" /></>),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4 21c.5-5 3.2-7 8-7s7.5 2 8 7" /></>),
  heart: <path d="M20.8 5.8a5.4 5.4 0 0 0-7.7 0L12 6.9l-1.1-1.1a5.4 5.4 0 0 0-7.7 7.7L12 22l8.8-8.5a5.4 5.4 0 0 0 0-7.7Z" />,
  back: <path d="m15 18-6-6 6-6" />,
  bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />,
  filter: <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6" />,
  share: (<><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.7 10.6 6.6-4.2M8.7 13.4l6.6 4.2" /></>),
  more: (<><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  star: <path d="m12 2.5 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.1l6.2-.9L12 2.5Z" />,
  location: (<><path d="M12 22s7-6.3 7-13a7 7 0 1 0-14 0c0 6.7 7 13 7 13Z" /><circle cx="12" cy="9" r="2.5" /></>),
  logout: <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />,
  sparkles: <path d="m12 2 1.5 5.3L19 9l-5.5 1.7L12 16l-1.5-5.3L5 9l5.5-1.7L12 2ZM19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15ZM5 14l.8 2.8L9 18l-3.2 1.2L5 22l-.8-2.8L1 18l3.2-1.2L5 14Z" />,
  dress: (<><path d="M9 3h6l1 5 4 12H4L8 8l1-5Z" /><path d="M9 3c.6 2.3 5.4 2.3 6 0" /></>),
  shirt: <path d="m8 4 4 2 4-2 5 4-3 4-2-2v10H8V10l-2 2-3-4 5-4Z" />,
  bag: (<><path d="M5 8h14l1 12H4L5 8Z" /><path d="M8 8a4 4 0 0 1 8 0" /></>),
  glasses: (<><circle cx="7" cy="13" r="4" /><circle cx="17" cy="13" r="4" /><path d="M11 13h2M3 11 1 9M21 11l2-2" /></>),
  shoe: <path d="M3 15c4 1 6-1 7-6l4 3c2 1 4 2 7 2v5H3v-4Z" />,
  check: <path d="m5 12 4 4L19 6" />,
  send: (<><path d="m3 11 18-8-8 18-2-8-8-2Z" /><path d="m11 13 10-10" /></>),
} as const;

export type IconName = keyof typeof PATHS;

export default function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}
