import PageLayout from '../../components/PageLayout';
import { Card, Button } from '@destiny-ai/ui';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <PageLayout title="Pricing">
      <div style={{ lineHeight: '1.8', color: '#333' }}>
        <p style={{ textAlign: 'center', fontSize: '1.1rem', marginBottom: '40px', color: '#666' }}>
          Simple, transparent pricing. No hidden fees. Pay only for what you use.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
          <Card title="Destiny Blueprint" style={{ border: '2px solid #4f46e5', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4f46e5', marginBottom: '10px' }}>
              ₹100
            </div>
            <p style={{ color: '#666', marginBottom: '20px' }}>One-time purchase</p>
            <ul style={{ textAlign: 'left', paddingLeft: '20px', marginBottom: '20px', listStyle: 'none' }}>
              <li style={{ marginBottom: '8px' }}>✓ Complete numerology analysis</li>
              <li style={{ marginBottom: '8px' }}>✓ Loshu Grid calculation</li>
              <li style={{ marginBottom: '8px' }}>✓ Moolank & Bhagyank insights</li>
              <li style={{ marginBottom: '8px' }}>✓ Career, relationships & health predictions</li>
              <li style={{ marginBottom: '8px' }}>✓ Remedial measures & lucky numbers</li>
              <li style={{ marginBottom: '8px' }}>✓ Lifetime access to your report</li>
            </ul>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Button variant="success" style={{ width: '100%' }}>Get Started</Button>
            </Link>
          </Card>

          <Card title="Consultation Questions" style={{ border: '2px solid #10b981', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981', marginBottom: '10px' }}>
              ₹10
            </div>
            <p style={{ color: '#666', marginBottom: '20px' }}>Per question</p>
            <ul style={{ textAlign: 'left', paddingLeft: '20px', marginBottom: '20px', listStyle: 'none' }}>
              <li style={{ marginBottom: '8px' }}>✓ Context-aware answers</li>
              <li style={{ marginBottom: '8px' }}>✓ Based on your Destiny Blueprint</li>
              <li style={{ marginBottom: '8px' }}>✓ Detailed, personalized guidance</li>
              <li style={{ marginBottom: '8px' }}>✓ Free clarifying questions</li>
              <li style={{ marginBottom: '8px' }}>✓ Chat history saved</li>
              <li style={{ marginBottom: '8px' }}>✓ Voice input & output support</li>
            </ul>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Button variant="success" style={{ width: '100%' }}>Start Consulting</Button>
            </Link>
          </Card>
        </div>

        <Card title="How It Works" style={{ marginTop: '30px' }}>
          <ol style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '15px' }}>
              <strong>Sign Up:</strong> Create your free account with email or Google
            </li>
            <li style={{ marginBottom: '15px' }}>
              <strong>Complete Profile:</strong> Provide your birth details (Name, DOB, Gender, Place of Birth)
            </li>
            <li style={{ marginBottom: '15px' }}>
              <strong>Purchase Blueprint:</strong> Buy your Destiny Blueprint for ₹100 (one-time)
            </li>
            <li style={{ marginBottom: '15px' }}>
              <strong>Add Wallet Credits:</strong> Pre-load your wallet with ₹50, ₹100, ₹200, or ₹500
            </li>
            <li style={{ marginBottom: '15px' }}>
              <strong>Ask Questions:</strong> Get personalized answers at ₹10 per question
            </li>
          </ol>
        </Card>

        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
          <h3 style={{ marginTop: 0, color: '#0369a1' }}>💡 Pro Tip</h3>
          <p style={{ margin: 0, color: '#075985' }}>
            Start with ₹200 in your wallet to get your Blueprint (₹100) and have ₹100 left for 10 follow-up 
            questions. This gives you a complete numerology experience!
          </p>
        </div>
      </div>
    </PageLayout>
  );
}






