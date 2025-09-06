
import Image from "next/image"

export function Logo({ className, ...props }: { className?: string }) {
  return (
    <Image 
        src="/logo.svg" 
        alt="AgendaEu.com Logo" 
        width={32} 
        height={32} 
        className={className} 
        {...props} 
    />
  )
}
