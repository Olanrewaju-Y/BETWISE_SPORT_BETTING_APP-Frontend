/* About.js */
import React from 'react';
import Navbar from '../components/Navbar'; // Import Navbar

import Footer from '../components/Footer'; // Import Footer


const About = () => {    
  return (
    <>
      <Navbar /> {/* Added Navbar */}
    
    <div className="bg-black min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-gray-900 shadow-xl rounded-lg p-8 md:p-12">
        <h2 className="text-4xl font-bold text-gray-100 text-center mb-8">About BetWise</h2>
        
        <section className="mb-8">
          <p className="text-lg text-gray-200 leading-relaxed mb-4">
            BetWise is your go-to platform for smart betting. We provide insights, predictions, and tools to help you make informed decisions.
          </p>
          <p className="text-lg text-gray-200 leading-relaxed mb-4">
            Founded by a team of passionate sports enthusiasts and data scientists, BetWise aims to revolutionize the way you approach sports betting.
          </p>
          <p className="text-lg text-gray-200 leading-relaxed mb-4">
            At BetWise, we believe that informed betting is responsible betting. We are committed to providing transparent and reliable information.
          </p>
          <p className="text-lg text-gray-200 leading-relaxed">
            Our mission is to empower bettors with data-driven analysis and a user-friendly experience.
          </p>
        </section>

        <section className="mb-8 border-t border-gray-200 pt-8">
          <h3 className="text-2xl font-semibold text-gray-100 text-center mb-6">Contact Us</h3>
          <p className="text-lg text-gray-200 leading-relaxed text-center">
            For any inquiries, please reach out to us at: <a href="mailto:support@betwise.com" className="text-lime-400 hover:text-lime-300 underline">support@betwise.com</a>
          </p>
        </section>

        
      </div>
    </div>
    <Footer />
    </>
  );
};

export default About;
