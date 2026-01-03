import PageLayout from '../../components/PageLayout';

export default function PrivacyPage() {
  return (
    <PageLayout title="Privacy Policy">
      <div style={{ lineHeight: '1.8', color: '#333' }}>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '30px' }}>
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>1. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us, including:
          </p>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Personal identification information (name, email address)</li>
            <li>Birth details (date of birth, time of birth, place of birth, gender)</li>
            <li>Payment information (processed securely through our payment partners)</li>
            <li>Chat history and consultation records</li>
            <li>Usage data and analytics</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Generate your personalized numerology reports</li>
            <li>Provide AI-powered consultations based on your profile</li>
            <li>Process payments and manage your wallet</li>
            <li>Improve our services and user experience</li>
            <li>Send important updates and notifications</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>3. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your personal information. 
            All data is encrypted in transit and at rest. We use Firebase (Google Cloud) for secure 
            data storage and processing.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>4. Data Sharing</h2>
          <p>
            We do not sell your personal information. We may share data only with:
          </p>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Service providers (payment processors, cloud hosting) who assist in our operations</li>
            <li>Legal authorities when required by law</li>
            <li>Business partners in case of merger or acquisition (with prior notice)</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your account and data</li>
            <li>Export your data</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>6. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to enhance your experience, analyze usage, 
            and assist with authentication. You can control cookies through your browser settings.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>7. Children's Privacy</h2>
          <p>
            Our services are intended for users aged 18 and above. We do not knowingly collect 
            information from children under 18.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#111' }}>8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any 
            material changes by posting the new policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section>
          <h2 style={{ marginTop: 0, color: '#111' }}>9. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:privacy@destinyai.com" style={{ color: '#4f46e5' }}>privacy@destinyai.com</a> 
            or visit our <a href="/contact" style={{ color: '#4f46e5' }}>Contact page</a>.
          </p>
        </section>
      </div>
    </PageLayout>
  );
}






