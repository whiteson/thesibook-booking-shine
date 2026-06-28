import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  href?: string;
};

export function Logo({ className, href = "/" }: LogoProps) {
  return (
    <Link href={href} aria-label="ThesiBook" className="inline-flex items-center">
      <Image
        src="/thesibook-logo.svg"
        alt="ThesiBook"
        width={160}
        height={36}
        priority
        className={cn("h-9 w-auto", className)}
      />
    </Link>
  );
}
