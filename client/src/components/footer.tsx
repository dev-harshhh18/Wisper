import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";

export function Footer() {
  return (
    <footer className="py-6 md:px-8 md:py-0">
      <div className="container flex flex-col items-center justify-center gap-4 text-center">
        {/* Built by Section */}
        <h3 className="text-sm font-medium text-muted-foreground">
          Built by Harshad Nikam
        </h3>
        <div className="flex justify-center gap-3 mt-2">
          <a
            href="https://www.linkedin.com/in/harshad-nikam-311734281/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <FaLinkedin
              size={18}
              className="text-blue-600 hover:text-blue-800"
            />
          </a>
          <a
            href="https://x.com/not_harshad_18"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <FaXTwitter size={18} className="text-black hover:text-gray-700" />
          </a>
          <a
            href="https://github.com/dev-harshhh18/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <FaGithub size={18} className="text-gray-900 hover:text-gray-700" />
          </a>
        </div>

        {/* Copyright Section */}
        <div className="mt-4 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Wisper. All rights reserved by{" "}
          <a
            href="https://www.linkedin.com/in/harshad-nikam-311734281/"
            target="_blank"
            className="font-medium underline underline-offset-4"
          >
            <b>Harshad Nikam</b>
          </a>
        </div>
      </div>
    </footer>
  );
}
