import { SVGProps } from "react";

export function NailPolishIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2a1 1 0 0 0-1 1v5.586a1 1 0 0 0 .293.707l4.414 4.414a1 1 0 0 0 .707.293h.172a1 1 0 0 0 .707-.293l2.828-2.828a1 1 0 0 0 0-1.414l-4.414-4.414a1 1 0 0 0-.707-.293H13a1 1 0 0 0-1-1z" />
      <path d="M4 14.5a3.5 3.5 0 0 1 7 0" />
      <path d="M4 21h16" />
    </svg>
  );
}
