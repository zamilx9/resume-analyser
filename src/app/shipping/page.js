export default function ShippingAndExchange() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6">Shipping and Exchange Policy</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Digital Service Delivery</h2>
            <p>
              ATS Resume is a digital service application. Upon successful payment, you will receive immediate access to your account. There are no physical goods to ship, and the service is available 24/7 online.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Account Access</h2>
            <p>
              After completing your purchase, you will receive an email confirmation with your login credentials. Access to your account is available immediately and can be used across all devices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Service Upgrade and Downgrade</h2>
            <p>
              Users can upgrade or downgrade their subscription plans at any time. Changes will take effect at the next billing cycle. Any price differences will be adjusted proportionally.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Plan Exchange</h2>
            <p>
              If you wish to exchange your current plan for a different one within 7 days of purchase, we can facilitate this at no additional cost (assuming no upgrade to a higher-tier plan is involved).
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Contact our support team with your exchange request</li>
              <li>Provide your order ID and desired plan</li>
              <li>We will process the exchange within 1-2 business days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Service Availability</h2>
            <p>
              We strive to maintain 99% uptime. In case of planned maintenance or unexpected downtime, we will notify users in advance where possible. Service credits may be issued for extended outages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Data and Content Transfers</h2>
            <p>
              Users can export their resume data and content at any time. We provide options to download your information in standard formats for portability.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Support and Assistance</h2>
            <p>
              Our support team is available to assist you with any issues or concerns regarding your service. Contact us at support@atsresume.com for help with account access, features, or technical difficulties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Changes to Terms</h2>
            <p>
              We reserve the right to modify this Shipping and Exchange Policy at any time. Changes will be communicated to users via email.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
