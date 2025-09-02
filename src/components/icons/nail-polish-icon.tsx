
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
      <path d="M8.5 2.5l3 3" />
      <path d="M11.5 5.5l-3-3" />
      <path d="M8.5 12v-.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2V12" />
      <path d="M10 12h5" />
      <path d="M5 12h14a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z" />
    </svg>
  );
}
