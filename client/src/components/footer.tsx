import { Link } from "wouter";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6"; // Import icons

export function Footer() {
  return (
    <footer className="py-4 md:px-8 md:py-2">
      <div className="container flex flex-col items-center justify-center gap-2 md:h-20 md:flex-row">
        <div className="text-center md:text-center">
          <h3 className="text-sm font-medium text-muted-foreground">
            Built by Harshad Nikam
          </h3>
          <div className="flex justify-center gap-3 mt-1">
            <Link
              href="https://www.linkedin.com/in/harshad-nikam-311734281/"
              target="_blank"
              className="inline-block"
            >
              <FaLinkedin
                size={20}
                className="text-blue-600 hover:text-blue-800"
              />
            </Link>
            <Link
              href="https://x.com/not_harshad_18"
              target="_blank"
              className="inline-block"
            >
              <FaXTwitter
                size={20}
                className="text-black hover:text-gray-700"
              />
            </Link>
            <Link
              href="https://github.com/dev-harshhh18/"
              target="_blank"
              className="inline-block"
            >
              <FaGithub
                size={20}
                className="text-gray-900 hover:text-gray-700"
              />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
