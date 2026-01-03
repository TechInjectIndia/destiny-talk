import PageLayout from '../../components/PageLayout';

export default function RefundPage() {
  return (
    <PageLayout title="Cancellation & Refund Policy">
      <div style={{ lineHeight: '1.8', color: '#333' }}>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '30px' }}>
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>1. Refund Eligibility</h2>
          <p>
            We offer refunds under the following circumstances:
          </p>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Technical failure preventing report generation (within 24 hours of purchase)</li>
            <li>Duplicate payment due to system error</li>
            <li>Unauthorized transaction on your account</li>
            <li>Service unavailability for more than 48 hours</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>2. Non-Refundable Items</h2>
          <p>The following are not eligible for refunds:</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Successfully generated Destiny Blueprint reports (once generated, the report is yours to keep)</li>
            <li>Consultation questions that have been answered</li>
            <li>Wallet credits that have been used</li>
            <li>Refund requests made more than 7 days after purchase</li>
            <li>Refunds requested due to dissatisfaction with numerology predictions or advice</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>3. Refund Process</h2>
          <p>To request a refund:</p>
          <ol style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '10px' }}>
              Contact us at <a href="mailto:support@destinyai.com" style={{ color: '#4f46e5' }}>support@destinyai.com</a> 
              or through our <a href="/contact" style={{ color: '#4f46e5' }}>Contact page</a>
            </li>
            <li style={{ marginBottom: '10px' }}>
              Provide your order ID, transaction details, and reason for refund
            </li>
            <li style={{ marginBottom: '10px' }}>
              Our team will review your request within 2-3 business days
            </li>
            <li style={{ marginBottom: '10px' }}>
              If approved, refunds will be processed to your original payment method within 5-10 business days
            </li>
          </ol>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>4. Wallet Credits</h2>
          <p>
            Unused wallet credits do not expire. You can use them at any time for future consultations. 
            Wallet credits are non-refundable once added, except in cases of technical errors or unauthorized 
            transactions.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>5. Cancellation Policy</h2>
          <p>
            You may cancel your account at any time. Upon cancellation:
          </p>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Your account and data will be deleted after 30 days</li>
            <li>You will retain access to your Destiny Blueprint until account deletion</li>
            <li>Unused wallet credits will be forfeited (non-refundable)</li>
            <li>You can reactivate your account within 30 days by logging in</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>6. Partial Refunds</h2>
          <p>
            In exceptional circumstances, we may offer partial refunds. This is evaluated on a case-by-case 
            basis and is at our sole discretion.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>7. Payment Method Refunds</h2>
          <p>
            Refunds will be processed to the original payment method used for the transaction. If the original 
            payment method is no longer available, please contact us to arrange an alternative refund method.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>8. Dispute Resolution</h2>
          <p>
            If you are not satisfied with our refund decision, you may contact us to discuss your case further. 
            We are committed to fair resolution of all disputes.
          </p>
        </section>

        <section>
          <h2 style={{ marginTop: 0, color: '#111' }}>9. Contact for Refunds</h2>
          <p>
            For refund requests or questions about this policy, please contact us at{' '}
            <a href="mailto:support@destinyai.com" style={{ color: '#4f46e5' }}>support@destinyai.com</a> 
            or visit our <a href="/contact" style={{ color: '#4f46e5' }}>Contact page</a>.
          </p>
          <p style={{ marginTop: '15px', padding: '15px', backgroundColor: '#fef3c7', borderRadius: '6px', border: '1px solid #fcd34d' }}>
            <strong>Note:</strong> Please include your order ID and transaction details when requesting a refund 
            to expedite the process.
          </p>
        </section>
      </div>
    </PageLayout>
  );
}






