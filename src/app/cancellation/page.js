export default function CancellationAndRefund() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6">Cancellation and Refund Policy</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Cancellation Policy</h2>
            <p>
              Customers can cancel their subscription or service at any time. To cancel, please log into your account and navigate to the subscription settings, or contact our support team at support@atsresume.com
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Refund Eligibility</h2>
            <p>
              Refunds are available under the following conditions:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Refund requests must be made within 7 days of purchase</li>
              <li>The service must not have been significantly used</li>
              <li>Refunds are issued for the full subscription amount paid</li>
              <li>One-time purchases may be refundable within 7 days if unused</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Refund Process</h2>
            <p>
              To request a refund:
            </p>
            <ol className="list-decimal pl-6 mt-2 space-y-1">
              <li>Contact our support team at support@atsresume.com</li>
              <li>Provide your order ID and reason for refund</li>
              <li>Our team will review and process your request within 5-7 business days</li>
              <li>Approved refunds will be credited back to your original payment method</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Non-Refundable Items</h2>
            <p>
              The following are non-refundable:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Services used beyond the 7-day refund period</li>
              <li>Custom services or specialized consultations</li>
              <li>Purchases made with promotional or discount codes (unless specified otherwise)</li>
              <li>Refunds requested after cancellation of subscription</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Subscription Cancellation</h2>
            <p>
              Subscriptions can be cancelled at any time. Cancellation takes effect at the end of the current billing cycle. No refund will be issued for the remaining subscription period.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Refund Method</h2>
            <p>
              All refunds will be processed to the original payment method used at the time of purchase. Please allow 5-10 business days for the refund to appear in your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Contact Support</h2>
            <p>
              If you have any questions about our cancellation and refund policy, please contact us at support@atsresume.com or reach out through our contact page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
