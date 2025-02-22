import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <a 
              href="https://forms.gle/WvMVJ5aeRooz3VWf8" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Feedback
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            Made in India – Harshad Nikam
          </p>
        </div>
      </div>
    </footer>
  );
}
