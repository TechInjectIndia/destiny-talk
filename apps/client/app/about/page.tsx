import PageLayout from '../../components/PageLayout';

export default function AboutPage() {
  return (
    <PageLayout title="About Us">
      <div style={{ lineHeight: '1.8', color: '#333' }}>
        <h2 style={{ marginTop: 0, color: '#111' }}>Our Mission</h2>
        <p>
          DestinyAI is an AI-powered numerology platform that democratizes access to personalized destiny guidance. 
          We believe everyone deserves access to high-quality numerological insights without the prohibitive costs 
          of traditional consultations.
        </p>

        <h2 style={{ marginTop: '30px', color: '#111' }}>What Makes Us Different</h2>
        <ul style={{ paddingLeft: '20px' }}>
          <li style={{ marginBottom: '10px' }}>
            <strong>Context-Aware AI:</strong> Unlike generic chatbots, our AI remembers your unique numerology 
            profile and provides personalized guidance based on your Destiny Blueprint.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Mathematical Accuracy:</strong> We combine strict numerology algorithms (Loshu Grid, Moolank, 
            Bhagyank) with empathetic AI reasoning to ensure both accuracy and understanding.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Affordable Access:</strong> Starting at just ₹100 for your complete Destiny Blueprint, 
            with follow-up consultations at ₹10 per question.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Wallet-Based System:</strong> Pre-load your wallet for seamless, frictionless consultations 
            without repeated payment steps.
          </li>
        </ul>

        <h2 style={{ marginTop: '30px', color: '#111' }}>Our Technology</h2>
        <p>
          DestinyAI uses advanced AI models powered by Google's Gemini, trained on numerological principles 
          and Vedic wisdom. Our system calculates your core numbers using proven mathematical formulas and 
          generates insights tailored to your unique profile.
        </p>

        <h2 style={{ marginTop: '30px', color: '#111' }}>Who We Serve</h2>
        <p>
          We serve spiritual seekers aged 25-45 who are tech-savvy and looking for guidance on career, 
          relationships, and health, but are skeptical of expensive traditional astrologers. Our platform 
          bridges the gap between ancient wisdom and modern technology.
        </p>
      </div>
    </PageLayout>
  );
}





