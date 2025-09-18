import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend, FiChevronDown } from 'react-icons/fi';

const faqs = [
  {
    q: 'What is RPL (Recognition of Prior Learning)?',
    a: 'RPL is a formal process that evaluates your skills, knowledge, and ministry experience to award recognition or certification without necessarily going through traditional schooling.'
  },
  {
    q: 'Who can apply for RPL?',
    a: 'Grassroots pastors, ministry leaders, and individuals with significant ministry experience looking for formal recognition can apply.'
  },
  {
    q: 'What documents are required?',
    a: 'Typical evidence includes sermons, teachings, mentorship activities, testimonies, community impact records, and recommendations. Exact requirements will be provided during the application.'
  },
  {
    q: 'How long does the process take?',
    a: 'Timelines vary depending on evidence readiness and assessment schedules. Many candidates complete within a few weeks to a few months.'
  },
];

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }
  const [openIndex, setOpenIndex] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus(null);
    try {
      // Placeholder: wire to backend endpoint if available, e.g. POST /contact
      // await api.post('/contact', form)
      await new Promise((res) => setTimeout(res, 800));
      setStatus({ type: 'success', message: 'Thanks! Your message has been sent. We will get back to you shortly.' });
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to send message. Please try again later or use the email/phone below.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Contact Us</h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl">
            We would love to hear from you. Ask a question, share feedback, or request guidance about the RPL process.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reach Us Directly</h2>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-start space-x-3">
                <FiPhone className="text-blue-600 mt-1" />
                <div>
                  <p className="font-semibold">Phone</p>
                  <a href="tel:+254725326367" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
                    +254 725 326 367
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FiMail className="text-blue-600 mt-1" />
                <div>
                  <p className="font-semibold">Email</p>
                  <a href="mailto:info@kingdomequippers.org" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
                    info@kingdomequippers.org
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FiMapPin className="text-blue-600 mt-1" />
                <div>
                  <p className="font-semibold">Location</p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Oyugis%2C%20Homa%20Bay%20County%2C%20Kenya"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                  >
                    Oyugis, Homa Bay County, Kenya
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <a
                href="mailto:info@kingdomequippers.org"
                className="inline-flex items-center justify-center w-full rounded-lg bg-blue-600 text-white px-4 py-3 font-semibold hover:bg-blue-700 transition"
              >
                <FiSend className="mr-2" /> Email Us
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Send a Message</h2>
            {status && (
              <div className={`mb-4 rounded-lg border px-4 py-3 ${
                status.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'
              }`}>
                {status.message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center rounded-lg bg-blue-600 text-white px-6 py-3 font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {sending ? 'Sending...' : (<><FiSend className="mr-2"/> Send Message</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between text-left px-4 py-3 hover:bg-gray-50"
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                >
                  <span className="font-medium text-gray-900">{item.q}</span>
                  <FiChevronDown className={`transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} />
                </button>
                {openIndex === idx && (
                  <div className="px-4 pb-4 text-gray-700">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
