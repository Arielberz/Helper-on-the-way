import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE } from '../../utils/apiConfig';

const Contact = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear messages when user starts typing
        if (errorMessage) setErrorMessage('');
        if (successMessage) setSuccessMessage('');
    };

    const validateForm = () => {
        // Check required fields
        if (!formData.fullName.trim()) {
            setErrorMessage('נא למלא את השם המלא');
            return false;
        }
        if (!formData.email.trim()) {
            setErrorMessage('נא למלא את כתובת האימייל');
            return false;
        }
        if (!formData.message.trim()) {
            setErrorMessage('נא לכתוב הודעה');
            return false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setErrorMessage('כתובת אימייל לא תקינה');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await fetch(`${API_BASE}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setSuccessMessage(data.message || 'ההודעה נשלחה בהצלחה, נחזור אליך בהקדם');
                // Clear form
                setFormData({
                    fullName: '',
                    email: '',
                    phone: '',
                    subject: '',
                    message: ''
                });
            } else {
                setErrorMessage(data.message || 'שגיאה בשליחת ההודעה, אנא נסה שוב');
            }
        } catch (error) {
            console.error('Error submitting contact form:', error);
            setErrorMessage('שגיאה בשליחת ההודעה, אנא נסה שוב מאוחר יותר');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--background)' }} dir="rtl">
            {/* Hero Section with Navigation */}
            <section 
                style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' }} 
                className="text-white py-12"
            >
                <div className="container mx-auto px-6">
                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mb-8">
                        <button 
                            onClick={() => navigate(-1)}
                            className="glass text-white font-bold py-2 px-6 hover:scale-105 transform transition-all"
                            style={{ 
                                borderRadius: 'var(--rounded-full)',
                                transition: 'var(--transition-mid)'
                            }}
                        >
                            ← חזרה
                        </button>
                        <Link 
                            to="/"
                            className="glass text-white font-bold py-2 px-6 hover:scale-105 transform transition-all"
                            style={{ 
                                borderRadius: 'var(--rounded-full)',
                                transition: 'var(--transition-mid)'
                            }}
                        >
                            🏠 דף הבית
                        </Link>
                    </div>

                    {/* Page Title */}
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-bold mb-4">
                            צור קשר
                        </h1>
                        <p className="text-xl text-white/90">
                            יש לכם שאלה, בעיה או הצעה? נשמח לשמוע מכם.
                        </p>
                        <div className="w-24 h-1 bg-white mx-auto mt-4" style={{ borderRadius: 'var(--rounded-full)' }}></div>
                    </div>
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="py-16">
                <div className="container mx-auto px-6 max-w-2xl">
                    <div 
                        className="glass bg-white" 
                        style={{ 
                            borderRadius: 'var(--rounded-xl)',
                            padding: 'var(--space-xxl)',
                            boxShadow: 'var(--shadow-lg)'
                        }}
                    >
                        {/* Success Message */}
                        {successMessage && (
                            <div 
                                className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-center"
                                style={{ borderRadius: 'var(--rounded-md)' }}
                            >
                                <p className="font-semibold">✅ {successMessage}</p>
                            </div>
                        )}

                        {/* Error Message */}
                        {errorMessage && (
                            <div 
                                className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-center"
                                style={{ borderRadius: 'var(--rounded-md)' }}
                            >
                                <p className="font-semibold">❌ {errorMessage}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Full Name */}
                            <div>
                                <label 
                                    htmlFor="fullName" 
                                    className="block text-lg font-semibold mb-2"
                                    style={{ color: 'var(--text-main)' }}
                                >
                                    שם מלא <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2"
                                    style={{ 
                                        borderRadius: 'var(--rounded-md)',
                                        color: 'var(--text-main)'
                                    }}
                                    placeholder="הזן את שמך המלא"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label 
                                    htmlFor="email" 
                                    className="block text-lg font-semibold mb-2"
                                    style={{ color: 'var(--text-main)' }}
                                >
                                    אימייל <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2"
                                    style={{ 
                                        borderRadius: 'var(--rounded-md)',
                                        color: 'var(--text-main)'
                                    }}
                                    placeholder="example@email.com"
                                />
                            </div>

                            {/* Phone (Optional) */}
                            <div>
                                <label 
                                    htmlFor="phone" 
                                    className="block text-lg font-semibold mb-2"
                                    style={{ color: 'var(--text-main)' }}
                                >
                                    טלפון (אופציונלי)
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2"
                                    style={{ 
                                        borderRadius: 'var(--rounded-md)',
                                        color: 'var(--text-main)'
                                    }}
                                    placeholder="050-1234567"
                                />
                            </div>

                            {/* Subject (Optional) */}
                            <div>
                                <label 
                                    htmlFor="subject" 
                                    className="block text-lg font-semibold mb-2"
                                    style={{ color: 'var(--text-main)' }}
                                >
                                    נושא (אופציונלי)
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2"
                                    style={{ 
                                        borderRadius: 'var(--rounded-md)',
                                        color: 'var(--text-main)'
                                    }}
                                    placeholder="על מה תרצה לדבר?"
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label 
                                    htmlFor="message" 
                                    className="block text-lg font-semibold mb-2"
                                    style={{ color: 'var(--text-main)' }}
                                >
                                    הודעה <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={6}
                                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 resize-none"
                                    style={{ 
                                        borderRadius: 'var(--rounded-md)',
                                        color: 'var(--text-main)'
                                    }}
                                    placeholder="כתוב כאן את הודעתך..."
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full text-white font-bold py-4 px-6 hover:scale-105 transform transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ 
                                    background: loading ? 'var(--text-secondary)' : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                                    borderRadius: 'var(--rounded-md)',
                                    transition: 'var(--transition-mid)'
                                }}
                            >
                                {loading ? 'שולח...' : 'שלח הודעה'}
                            </button>
                        </form>
                    </div>

                    {/* Additional Contact Info */}
                    <div className="mt-8 text-center" style={{ color: 'var(--text-secondary)' }}>
                        <p className="text-lg">
                            או שלחו לנו אימייל ישירות: <a href="mailto:info.helperontheway@gmail.com" className="font-bold hover:underline" style={{ color: 'var(--primary)' }}>info.helperontheway@gmail.com</a>
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
