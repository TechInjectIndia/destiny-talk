import PageLayout from '../../components/PageLayout';

export default function TermsPage() {
  return (
    <PageLayout title="Terms & Conditions">
      <div style={{ lineHeight: '1.8', color: '#333' }}>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '30px' }}>
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>1. Acceptance of Terms</h2>
          <p>
            By accessing and using DestinyAI, you accept and agree to be bound by these Terms and Conditions. 
            If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>2. Service Description</h2>
          <p>
            DestinyAI provides AI-powered numerology services including personalized destiny reports and 
            consultation services. Our services are for entertainment and guidance purposes only and should 
            not be used as a substitute for professional medical, legal, or financial advice.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>3. User Accounts</h2>
          <p>To use our services, you must:</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Be at least 18 years old</li>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account</li>
            <li>Notify us immediately of any unauthorized access</li>
            <li>Not share your account with others</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>4. Payments and Refunds</h2>
          <p>
            All payments are processed securely through our payment partners. Prices are displayed in INR (₹). 
            Please refer to our <a href="/refund" style={{ color: '#4f46e5' }}>Refund Policy</a> for details 
            on cancellations and refunds.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>5. Intellectual Property</h2>
          <p>
            All content on DestinyAI, including reports, AI-generated responses, and platform design, 
            is protected by copyright and other intellectual property laws. You may not reproduce, 
            distribute, or create derivative works without our written permission.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>6. User Conduct</h2>
          <p>You agree not to:</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Use the service for any illegal purpose</li>
            <li>Attempt to reverse engineer or hack our systems</li>
            <li>Impersonate others or provide false information</li>
            <li>Interfere with the service's operation</li>
            <li>Use automated systems to access the service without permission</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>7. Disclaimers</h2>
          <p>
            DestinyAI provides numerology services for entertainment and guidance purposes. We make no 
            warranties or guarantees about the accuracy of predictions or advice. Our services are not 
            intended to replace professional medical, legal, financial, or psychological advice.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, DestinyAI shall not be liable for any indirect, 
            incidental, special, or consequential damages arising from your use of our services.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>9. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account at any time for violation of these 
            terms or for any other reason we deem necessary.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>10. Changes to Terms</h2>
          <p>
            We may modify these Terms and Conditions at any time. Continued use of our services after 
            changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 style={{ marginTop: 0, color: '#111' }}>11. Governing Law</h2>
          <p>
            These Terms and Conditions are governed by the laws of India. Any disputes shall be subject 
            to the exclusive jurisdiction of courts in India.
          </p>
        </section>

        <section style={{ marginTop: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>12. Contact</h2>
          <p>
            For questions about these Terms, please contact us at{' '}
            <a href="mailto:legal@destinyai.com" style={{ color: '#4f46e5' }}>legal@destinyai.com</a> 
            or visit our <a href="/contact" style={{ color: '#4f46e5' }}>Contact page</a>.
          </p>
        </section>
      </div>
    </PageLayout>
  );
}






