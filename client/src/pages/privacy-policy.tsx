import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="prose dark:prose-invert mx-auto">
          <h1>Privacy Policy</h1>
          
          <p>Last updated: February 22, 2025</p>
          
          <h2>Introduction</h2>
          <p>
            Welcome to Wisper. We take your privacy seriously and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
          </p>

          <h2>Information We Collect</h2>
          <ul>
            <li>Account information (username and encrypted password)</li>
            <li>Content you post (encrypted wispers)</li>
            <li>Interaction data (likes, comments)</li>
            <li>Optional location data (if shared)</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>
            We use your information to:
          </p>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Enable anonymous content sharing</li>
            <li>Improve user experience</li>
            <li>Enforce our content moderation policies</li>
          </ul>

          <h2>Data Security</h2>
          <p>
            We implement strong security measures to protect your data:
          </p>
          <ul>
            <li>End-to-end encryption for wispers</li>
            <li>Secure password hashing</li>
            <li>Regular security audits</li>
          </ul>

          <h2>Your Rights</h2>
          <p>
            You have the right to:
          </p>
          <ul>
            <li>Access your personal data</li>
            <li>Delete your account and associated data</li>
            <li>Object to data processing</li>
            <li>Request data portability</li>
          </ul>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us through the feedback form.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
