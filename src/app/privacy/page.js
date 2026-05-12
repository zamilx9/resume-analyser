export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p>
              We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our ATS Resume application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
            <p>We may collect information about you in a variety of ways:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Personal Data:</strong> Name, email address, phone number, resume/CV content</li>
              <li><strong>Payment Information:</strong> Credit card and billing information (processed securely through Razorpay)</li>
              <li><strong>Usage Data:</strong> Browser type, IP address, pages visited, time spent on pages</li>
              <li><strong>Cookies:</strong> Information stored on your device to enhance user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Use of Your Information</h2>
            <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. We use information collected about you for various purposes:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>To process your transactions and send related information</li>
              <li>To email you regarding your account or order</li>
              <li>To improve our application and services</li>
              <li>To respond to your inquiries and provide customer support</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Disclosure of Your Information</h2>
            <p>
              We may share your information with third parties who assist us in operating our website, conducting our business, or servicing you, including payment processors like Razorpay. These parties are obligated not to disclose or use your information except as necessary to provide the services they provide.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to protect your personal information. All payment transactions are encrypted using SSL technology to ensure the safety of your financial information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Contact Us</h2>
            <p>
              If you have questions or concerns regarding this Privacy Policy, please contact us at support@atsresume.com
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Policy Updates</h2>
            <p>
              We reserve the right to modify this Privacy Policy at any time. Changes and clarifications will take effect immediately upon their posting to the website.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
