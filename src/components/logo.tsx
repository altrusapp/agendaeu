
import Image from "next/image"

export function Logo({ className, ...props }: { className?: string }) {
  return (
    <Image 
        src="/agendaeu_logo.png" 
        alt="AgendaEu.com Logo" 
        width={32} 
        height={32} 
        className={className} 
        {...props} 
    />
  )
}
