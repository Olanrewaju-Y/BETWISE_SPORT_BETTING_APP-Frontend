/* Contact.js */
import React, { useState } from 'react';
import Navbar from '../components/Navbar'; // Import Navbar
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'; // For icons
import Footer from '../components/Footer'; // Import Footer

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setError(''); // Clear error when user types
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setError('All fields are required.');
      return;
    }
    setError('');
    setIsLoading(true);
    setIsSubmitted(false); // Reset submission status in case of re-submission

    // Here you would typically send the data to a backend or email service
    // Simulate API call
    setTimeout(() => {
      console.log('Form data submitted:', formData);
      setIsSubmitted(true);
      setIsLoading(false);
      setFormData({ name: '', email: '', message: '' }); // Reset form on successful submission
    }, 1500); // Simulate network delay
  };

  // Clear submission status if user starts typing again after a successful submission
  React.useEffect(() => {
    if (isSubmitted && (formData.name || formData.email || formData.message)) setIsSubmitted(false);
  }, [formData, isSubmitted]);

  return (
    <>
      <Navbar />
    
      <div className="bg-black min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-gray-900 shadow-xl rounded-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-100 text-center mb-8">Contact Us</h2>
          <p className="text-lg text-gray-200 leading-relaxed mb-6 text-center">
            If you have any questions or inquiries, feel free to reach out to us using the form below.
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
              <FaExclamationCircle className="mr-3 text-red-300" size={20} />
              <span>{error}</span>
            </div>
          )}

          {isSubmitted ? (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-md flex items-center justify-center">
              <FaCheckCircle className="mr-3" size={24} />
              <span className="text-lg text-green-300">Thank you for your message! We'll get back to you soon.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-200">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" // Added name attribute for consistency
                  value={formData.name} 
                  onChange={handleChange} 
                  className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm" 
                  placeholder="Your Name"
                  required 
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-200">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" // Added name attribute
                  value={formData.email} 
                  onChange={handleChange} 
                  className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm" 
                  placeholder="you@example.com"
                  required 
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-200">Message</label>
                <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows="4" className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm" placeholder="Your message..." required></textarea>
              </div>
              <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-lime-500 hover:bg-lime-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 disabled:bg-lime-300 disabled:cursor-not-allowed">
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Contact;
