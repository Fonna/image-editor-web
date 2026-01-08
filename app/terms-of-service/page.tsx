import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TermsOfService() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight mb-8">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last Updated: January 8, 2026</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-foreground/90 leading-relaxed">
                By accessing or using <strong>Bananaimage</strong> ("the Service"), you agree to be bound by these Terms. If you disagree with any part of the terms, you may not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-foreground/90 mb-4">
                Bananaimage provides a web-based interface that aggregates and routes requests to various third-party Artificial Intelligence (AI) models for text-to-image and image-to-image generation.
              </p>
              <p className="text-foreground/90 leading-relaxed">
                <strong>Acknowledgment:</strong> You understand that the AI models are third-party technologies, and we do not guarantee the accuracy, quality, or uniqueness of the generated content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>You are responsible for maintaining the security of your account.</li>
                <li>You must be at least 18 years old to use this Service.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use & Content Policy</h2>
              <p className="text-foreground/90 mb-4">
                <strong>Strictly Prohibited Content:</strong> You agree NOT to use the Service to generate:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90 mb-4">
                <li>Child Sexual Abuse Material (CSAM).</li>
                <li>Non-consensual sexual content (deepfakes).</li>
                <li>Content that promotes violence, harassment, or illegal acts.</li>
                <li>Real-world political figures or celebrities in defamatory contexts.</li>
              </ul>
              <p className="text-red-500 font-semibold leading-relaxed">
                Violation of this policy will result in immediate account termination without refund.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li><strong>Your Input:</strong> You retain ownership of the text prompts and images you upload.</li>
                <li><strong>Generated Output:</strong> Subject to the terms of the underlying AI model providers, we assign to you all rights, title, and interest in the images you generate using the Service for both personal and commercial use.</li>
                <li><strong>Liability:</strong> You are solely responsible for the content you generate and how you use it.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Credits, Payments, and Refunds</h2>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li><strong>Credits:</strong> Our Service operates on a credit-based system. Credits are deducted based on the specific AI model and settings selected.</li>
                <li><strong>Payment Processing:</strong> Payments are processed by our Merchant of Record, <strong>Creem</strong>. By purchasing credits, you agree to their terms of service and privacy policy in addition to ours.</li>
                <li><strong>Pricing:</strong> All prices are clearly displayed on our Pricing page.</li>
                <li><strong>Refund Policy:</strong>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li><strong>Unused Credits:</strong> If you have purchased a credit pack and have not used any credits, you may request a refund within 7 days of purchase.</li>
                    <li><strong>Used Credits:</strong> Once credits have been utilized to generate images, they are non-refundable, regardless of your satisfaction with the AI's artistic output.</li>
                    <li>To request a refund, contact support@bananaimage.online.</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
              <p className="text-foreground/90 leading-relaxed">
                The Service is provided "AS IS". We are not liable for any downtime, data loss, or the specific output generated by third-party AI models. We act solely as a router to facilitate your access to these models.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
              <p className="text-foreground/90 leading-relaxed">
                For any questions regarding these Terms, please contact us at:
                <br />
                <strong>Email:</strong> support@bananaimage.online
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
