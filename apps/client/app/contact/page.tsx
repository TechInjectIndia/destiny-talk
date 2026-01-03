'use client';

import { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import { Button, Input, TextArea, Card } from '@destiny-ai/ui';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement contact form submission
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <PageLayout title="Contact Us">
      <div className="leading-relaxed text-gray-800">
        <p className="mb-8">
          Have questions or feedback? We'd love to hear from you. Fill out the form below or reach out to us directly.
        </p>

        {submitted ? (
          <Card title="Message Sent" className="border-l-4 border-green-500">
            <p className="text-green-700 m-0">
              Thank you for contacting us! We'll get back to you within 24-48 hours.
            </p>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <Input
              label="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              required
            />
            <Input
              label="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="How can we help?"
              required
            />
            <TextArea
              label="Message"
              rows={6}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tell us what's on your mind..."
              required
            />
            <Button type="submit">Send Message</Button>
          </form>
        )}

        <div className="mt-10 pt-5 border-t border-gray-200">
          <h3 className="mt-0 text-gray-900">Other Ways to Reach Us</h3>
          <p className="mb-2.5">
            <strong>Email:</strong> support@destinyai.com
          </p>
          <p className="mb-2.5">
            <strong>Response Time:</strong> We typically respond within 24-48 hours
          </p>
          <p className="mb-0">
            <strong>Business Hours:</strong> Monday - Friday, 9 AM - 6 PM IST
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
