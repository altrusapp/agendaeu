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
        <path d="M20 12.5c0 .38-.02.75-.06 1.12" />
        <path d="M17.52 4.4C15.86 2.97 13.77 2 11.5 2 6.25 2 2 6.25 2 11.5c0 2.27.97 4.36 2.6 5.88" />
        <path d="M14.5 10.5c-1 0-2.5 1-2.5 3s1.5 3 2.5 3" />
        <path d="M19.37 6.13a10.4 10.4 0 0 1 0 11.74" />
        <path d="M22 11.5c0 1.94-.54 3.73-1.48 5.25" />
    </svg>
  );
}
