import React from "react";

const iconProps = {
  viewBox: "0 0 24 24",
  width: 22,
  height: 22,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.8",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export const PhoneIcon = () => (
  <svg {...iconProps}>
    <path d="M6.5 3.8h3.2l1.2 3.2-2 1.2a12 12 0 0 0 6.9 6.9l1.2-2 3.2 1.2v3.2c0 .8-.6 1.5-1.4 1.6A16.2 16.2 0 0 1 4.9 5.2c.1-.8.8-1.4 1.6-1.4Z" />
  </svg>
);

export const UserIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="8" r="3.2" />
    <path d="M5 19.2c1.4-3 4-4.6 7-4.6s5.6 1.6 7 4.6" />
  </svg>
);

export const MenuIcon = () => (
  <svg {...iconProps}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden="true">
    <path
      fill="currentColor"
      d="M14.2 20v-7.2h2.4l.4-2.8h-2.8V8.4c0-.8.2-1.4 1.4-1.4H17V4.4C16.6 4.4 15.7 4.2 14.7 4.2c-2.2 0-3.7 1.3-3.7 3.8v2h-2.4v2.8h2.4V20h3.2Z"
    />
  </svg>
);

export const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width={22} height={22} fill="none" aria-hidden="true">
    <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="16.6" cy="7.4" r="1" fill="currentColor" />
  </svg>
);

export const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden="true">
    <path
      fill="currentColor"
      d="M6.6 9.2H4.2V20h2.4V9.2ZM5.4 4.2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM20 20h-2.4v-5.4c0-1.5-.6-2.4-1.8-2.4s-1.8.9-1.8 2.4V20H11.6V9.2h2.3v1.4c.5-.9 1.6-1.6 3-1.6 2.2 0 3.1 1.4 3.1 4.1V20Z"
    />
  </svg>
);

export const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden="true">
    <path
      fill="currentColor"
      d="M21.5 8.2a3 3 0 0 0-2.1-2.1C17.6 5.6 12 5.6 12 5.6s-5.6 0-7.4.5A3 3 0 0 0 2.5 8.2 31 31 0 0 0 2 12a31 31 0 0 0 .5 3.8 3 3 0 0 0 2.1 2.1c1.8.5 7.4.5 7.4.5s5.6 0 7.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22 12a31 31 0 0 0-.5-3.8ZM10.2 15.1V8.9L15.4 12l-5.2 3.1Z"
    />
  </svg>
);
