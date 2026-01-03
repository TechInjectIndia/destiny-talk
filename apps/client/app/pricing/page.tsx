import PageLayout from '../../components/PageLayout';
import { Card, Button } from '@destiny-ai/ui';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <PageLayout title="Pricing">
      <div className="leading-relaxed text-gray-800">
        <p className="text-center text-lg mb-10 text-gray-600">
          Simple, transparent pricing. No hidden fees. Pay only for what you use.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <Card title="Destiny Blueprint" className="border-2 border-primary-600 text-center">
            <div className="text-5xl font-bold text-primary-600 mb-2.5">₹100</div>
            <p className="text-gray-600 mb-5">One-time purchase</p>
            <ul className="text-left pl-5 mb-5 list-none">
              <li className="mb-2">✓ Complete numerology analysis</li>
              <li className="mb-2">✓ Loshu Grid calculation</li>
              <li className="mb-2">✓ Moolank & Bhagyank insights</li>
              <li className="mb-2">✓ Career, relationships & health predictions</li>
              <li className="mb-2">✓ Remedial measures & lucky numbers</li>
              <li className="mb-2">✓ Lifetime access to your report</li>
            </ul>
            <Link href="/" className="no-underline">
              <Button variant="success" className="w-full">Get Started</Button>
            </Link>
          </Card>

          <Card title="Consultation Questions" className="border-2 border-green-500 text-center">
            <div className="text-5xl font-bold text-green-500 mb-2.5">₹10</div>
            <p className="text-gray-600 mb-5">Per question</p>
            <ul className="text-left pl-5 mb-5 list-none">
              <li className="mb-2">✓ Context-aware answers</li>
              <li className="mb-2">✓ Based on your Destiny Blueprint</li>
              <li className="mb-2">✓ Detailed, personalized guidance</li>
              <li className="mb-2">✓ Free clarifying questions</li>
              <li className="mb-2">✓ Chat history saved</li>
              <li className="mb-2">✓ Voice input & output support</li>
            </ul>
            <Link href="/" className="no-underline">
              <Button variant="success" className="w-full">Start Consulting</Button>
            </Link>
          </Card>
        </div>

        <Card title="How It Works" className="mt-8">
          <ol className="pl-5">
            <li className="mb-4">
              <strong>Sign Up:</strong> Create your free account with email or Google
            </li>
            <li className="mb-4">
              <strong>Complete Profile:</strong> Provide your birth details (Name, DOB, Gender, Place of Birth)
            </li>
            <li className="mb-4">
              <strong>Purchase Blueprint:</strong> Buy your Destiny Blueprint for ₹100 (one-time)
            </li>
            <li className="mb-4">
              <strong>Add Wallet Credits:</strong> Pre-load your wallet with ₹50, ₹100, ₹200, or ₹500
            </li>
            <li className="mb-4">
              <strong>Ask Questions:</strong> Get personalized answers at ₹10 per question
            </li>
          </ol>
        </Card>

        <div className="mt-8 p-5 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="mt-0 text-blue-800">💡 Pro Tip</h3>
          <p className="m-0 text-blue-900">
            Start with ₹200 in your wallet to get your Blueprint (₹100) and have ₹100 left for 10 follow-up
            questions. This gives you a complete numerology experience!
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
