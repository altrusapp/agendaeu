import type { SVGProps } from "react"

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 12.5c0-4.5-3.5-8-8-8s-8 3.5-8 8c0 2 .8 4 2 5.5-1.5 2-2 4.5-2 4.5h16s-.5-2.5-2-4.5c1.2-1.5 2-3.5 2-5.5Z" />
      <path d="M12 2C6.5 2 2 6.5 2 12c0 2 1.3 4.8 2.5 6.5C8 22 12 22 12 22s4-4 7.5-8.5C20.7 16.8 22 14 22 12c0-5.5-4.5-10-10-10Z" />
      <path d="M14.5 10.5c-1 0-2.5 1-2.5 3s1.5 3 2.5 3" />
    </svg>
  );
}
