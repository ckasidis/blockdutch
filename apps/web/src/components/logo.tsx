import clsx from "clsx";
import Image from "next/image";
import { type HTMLAttributes } from "react";

export function DarkLogo({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("relative overflow-hidden", className)} {...props}>
      <Image
        src="/dark-logo.svg"
        alt="BlockDutch Logo - Dark Mode"
        fill
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}
