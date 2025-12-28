import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

function Recommendations() {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modelInfo, setModelInfo] = useState(null);
    const [isPersonalized, setIsPersonalized] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    const ITEMS_PER_PAGE = 9; // 3x3 grid
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!userId) {
            navigate('/');
            return;
        }
        loadRecommendations();
    }, [userId, navigate]);

    const loadRecommendations = async () => {
        setLoading(true);
        setError('');

        try {
            const data = await apiService.getRecommendations(userId, 20);
            setRecommendations(data.recommendations || []);
            setIsPersonalized(data.is_personalized);
            setModelInfo({
                version: data.model_version,
                count: data.count,
            });
        } catch (err) {
            setError('Failed to load recommendations. Make sure ML service is running on port 8000.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userId');
        navigate('/');
    };

    // Calculate paginated items
    const totalPages = Math.ceil(recommendations.length / ITEMS_PER_PAGE);
    const paginatedRecommendations = recommendations.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-teal-600">
                        🎯 RecomServe
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats */}
                {modelInfo && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <p className="text-sm text-gray-600">Model Version</p>
                            <p className="text-2xl font-bold text-teal-600">
                                {modelInfo.version}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <p className="text-sm text-gray-600">Recommendations</p>
                            <p className="text-2xl font-bold text-teal-600">
                                {modelInfo.count}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <p className="text-sm text-gray-600">Type</p>
                            <p className="text-2xl font-bold text-teal-600">
                                {isPersonalized ? '✨ Personalized' : '🔥 Popular'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-teal-600 mb-2">
                        Recommended for You
                    </h2>
                    <p className="text-gray-600">
                        Based on your preferences and behavior
                    </p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {/* Recommendations Grid */}
                {!loading && !error && recommendations.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {paginatedRecommendations.map((rec, index) => {
                                const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
                                return (
                                    <div
                                        key={rec.content_id}
                                        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-3">
                                                <span className="text-sm font-bold text-gray-400">
                                                    #{globalIndex + 1}
                                                </span>
                                                <span className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-full">
                                                    ⭐ {rec.score.toFixed(2)}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 min-h-[56px]">
                                                {rec.title || 'Untitled Content'}
                                            </h3>

                                            <div className="mb-3">
                                                <span className="px-3 py-1 bg-teal-50 text-teal-700 text-sm font-medium rounded-full">
                                                    {rec.category || 'General'}
                                                </span>
                                            </div>

                                            {rec.tags && rec.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {rec.tags.slice(0, 3).map((tag, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {rec.tags.length > 3 && (
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                            +{rec.tags.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {recommendations.length > ITEMS_PER_PAGE && (
                            <div className="flex items-center justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    ← Previous
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === page
                                            ? 'bg-teal-600 text-white'
                                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Empty State */}
                {!loading && !error && recommendations.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-4xl mb-4">📭</p>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            No Recommendations Yet
                        </h3>
                        <p className="text-gray-600">
                            Start interacting with content to get personalized recommendations!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Recommendations;
