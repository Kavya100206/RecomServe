import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SignIn() {
    const [userId, setUserId] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!userId.trim()) {
            setError('Please enter a User ID');
            return;
        }

        // Store user ID in localStorage
        localStorage.setItem('userId', userId);

        // Navigate to recommendations
        navigate('/recommendations');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-teal-600 mb-2">
                        🎯 RecomServe
                    </h1>
                    <p className="text-gray-600">ML-Powered Recommendations</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Mock sign-in for demo purposes
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="userId"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                            User ID (UUID)
                        </label>
                        <input
                            type="text"
                            id="userId"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            placeholder="e.g., 004deb95-9cc2-43e6-8445-14faae27a12f"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-teal-600 transition-colors"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Tip: Get a user ID from your database users table
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                    >
                        Sign In
                    </button>
                </form>

            </div>
        </div>
    );
}

export default SignIn;
