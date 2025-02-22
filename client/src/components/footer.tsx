import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="py-6 md:px-8 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built by{" "}
          <Link href="https://www.linkedin.com/in/harshad-nikam-311734281/" target="_blank" className="font-medium underline underline-offset-4">
            Harshad Nikam
          </Link>{" "}
          ({" "}
          <Link href="https://x.com/not_harshad_18" target="_blank" className="font-medium underline underline-offset-4">
            @not_harshad_18
          </Link>{" "}
          ). The source code is available on{" "}
          <Link href="https://github.com/not-harsh/wisper" className="font-medium underline underline-offset-4">
            GitHub
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}