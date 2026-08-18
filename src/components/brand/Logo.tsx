import type { SVGProps } from 'react'

interface LogoProps extends SVGProps<SVGSVGElement> {
  size?: number
}

export function Logo({ size = 48, ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CreditFlow"
      {...props}
    >
      <rect width="48" height="48" rx="14" fill="#3B5BDB" />
      <path
        d="M14 24.5c0-6.1 4.6-10.2 10.8-10.2 4.2 0 7.6 1.8 9.6 4.5"
        stroke="#fff"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M34 22.8c0 6.1-4.6 10.2-10.8 10.2-4.2 0-7.6-1.8-9.6-4.5"
        stroke="#C7D2FE"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="33.4" cy="18.2" r="3.2" fill="#BBF7D0" />
    </svg>
  )
}
