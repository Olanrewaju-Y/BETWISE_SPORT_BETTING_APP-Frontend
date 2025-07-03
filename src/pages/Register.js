import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // For navigation
import Navbar from '../components/Navbar'; // Import Navbar

// Sign up
const Register = () => {
    const [registerData, setRegisterData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        nickName: '',
        age: '',
        // role is often set by the backend or based on registration type.
        // For this example, we'll include it with a default.
        role: 'user',
        gender: '',
        country: '',
        interests: '', // Will be a comma-separated string from input
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = e => {
        setError(''); // Clear error when user starts typing
        setRegisterData({
            ...registerData,
            [e.target.name]: e.target.value
        });
    }

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');

        if (registerData.password !== registerData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (registerData.password.length < 6) { // Example: Basic password length validation
            setError("Password must be at least 6 characters long.");
            return;
        }

        if (!/^\d+$/.test(registerData.age) || parseInt(registerData.age, 10) < 18) {
            setError("Age must be a number and at least 18.");
            return;
        }

        setLoading(true);

        // Replace with your actual registration API endpoint
        const API_ENDPOINT = process.env.REACT_APP_API_SIGNUP_ENDPOINT;

        try {
            // Prepare data for the API, matching the provided JSON structure
            const interestsArray = registerData.interests
                .split(',')
                .map(interest => interest.trim())
                .filter(interest => interest !== ''); // Remove empty strings

            const dataToSend = {
                email: registerData.email, 
                password: registerData.password,
                age: parseInt(registerData.age, 10),
                nickName: registerData.nickName,
                role: registerData.role, // 'user' by default from state
                gender: registerData.gender,
                phoneNo: registerData.phoneNo,
                country: registerData.country,
                interests: interestsArray,
            };

            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }

            // Handle successful registration
            alert('Registration successful! Please login.'); // Replace with a more user-friendly notification
            navigate('/login'); // Redirect to login page

        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Navbar /> {/* Added Navbar */}
            <div className='min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8'>
                <form onSubmit={handleSubmit} className='bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md'>
                    <h2 className='text-2xl font-display text-center mb-6'>Sign Up</h2>
                    {error && <p className="text-red-500 text-xs italic text-center mb-4">{error}</p>}

                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='email'>Email</label>
                        <input className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' id='email' type='email' placeholder='Email' name='email' value={registerData.email} onChange={handleChange} required />
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='nickName'>Nickname</label>
                        <input className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' id='nickName' type='text' placeholder='e.g., User02' name='nickName' value={registerData.nickName} onChange={handleChange} required />
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='password'>Password</label>
                        <input className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' id='password' type='password' placeholder='Password (min. 6 characters)' name='password' value={registerData.password} onChange={handleChange} required />
                    </div>
                    <div className='mb-6'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='confirmPassword'>Confirm Password</label>
                        <input className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' id='confirmPassword' type='password' placeholder='Confirm Password' name='confirmPassword' value={registerData.confirmPassword} onChange={handleChange} required />
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='age'>Age</label>
                        <input className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' id='age' type='number' placeholder='e.g., 18' name='age' value={registerData.age} onChange={handleChange} required />
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='gender'>Gender</label>
                        <select className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' id='gender' name='gender' value={registerData.gender} onChange={handleChange} required>
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='country'>Country</label>
                        <input className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' id='country' type='text' placeholder='e.g., Nigeria' name='country' value={registerData.country} onChange={handleChange} required />
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='interests'>Interests (comma-separated)</label>
                        <input className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' id='interests' type='text' placeholder='e.g., football, tennis' name='interests' value={registerData.interests} onChange={handleChange} />
                        <p className="text-xs text-gray-500 mt-1">Enter interests separated by commas.</p>
                    </div>
                    <div className='flex items-center justify-between'>
                        <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full' type='submit' disabled={loading}>
                            {loading ? 'Signing Up...' : 'Sign Up'}
                        </button>
                    </div>
                    <div className="text-center mt-6">
                        <Link to="/login" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                            Already have an account? Login
                        </Link>
                    </div>
                </form>
            </div>
        </>
    )
}

export default Register;
