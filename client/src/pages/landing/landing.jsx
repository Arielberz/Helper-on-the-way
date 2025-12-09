
import { Link } from "react-router-dom";

const Landing = () => {
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        
            
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-6 py-20 md:py-32 relative z-10" dir="rtl">
                    {/* Mobile Logo - Shows only on mobile */}
                    <div className="flex justify-center mb-8 md:hidden">
                        <img 
                            src="/helper-logo-removebg.png" 
                            alt="Helper on the way" 
                            className="w-48"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="text-center md:text-right">
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                            ברוכים הבאים 
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                                פלטפורמה לסיוע הדדי בדרכים - קבלו עזרה מהירה וקלה בכל מקום ובכל זמן
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <Link 
                                    to="/register" 
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-lg"
                                >
                                    🚀 התחל עכשיו
                                </Link>
                                <Link 
                                    to="/login" 
                                    className="bg-white hover:bg-gray-50 text-blue-600 font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-lg border-2 border-blue-600"
                                >
                                    🔐 כניסה למערכת
                                </Link>
                            </div>
                        </div>

                        {/* Right Image/Illustration */}
                        <div className="hidden md:flex justify-center">
                            <img 
                                src="/helper-logo-removebg.png" 
                                alt="Helper on the way" 
                                className="transform hover:scale-105 transition-transform duration-500 w-full max-w-lg"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6" dir="rtl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            למה לבחור בנו?
                        </h2>
                        <p className="text-xl text-gray-600">
                            הפתרון המושלם לכל בעיה בדרכים
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
                            <div className="text-5xl mb-4">🚗</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">סיוע מהיר</h3>
                            <p className="text-gray-600 leading-relaxed">
                                קבלו עזרה תוך דקות ספורות ממתנדבים באזור שלכם
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
                            <div className="text-5xl mb-4">🗺️</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">מעקב בזמן אמת</h3>
                            <p className="text-gray-600 leading-relaxed">
                                עקבו אחר המתנדב בדרכו אליכם על המפה החיה
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
                            <div className="text-5xl mb-4">💬</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">תקשורת ישירה</h3>
                            <p className="text-gray-600 leading-relaxed">
                                צ'אט מובנה לתקשורת קלה ומהירה עם המתנדב
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
                            <div className="text-5xl mb-4">⭐</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">דירוגים וביקורות</h3>
                            <p className="text-gray-600 leading-relaxed">
                                מערכת דירוג שמבטיחה שירות איכותי ואמין
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
                            <div className="text-5xl mb-4">💳</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">תשלום גמיש</h3>
                            <p className="text-gray-600 leading-relaxed">
                                אפשרות להציע תשלום למתנדבים כהערכה
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
                            <div className="text-5xl mb-4">🔒</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">בטוח ומאובטח</h3>
                            <p className="text-gray-600 leading-relaxed">
                                מערכת אימות וזיהוי שמבטיחה את הבטיחות שלכם
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                <div className="container mx-auto px-6" dir="rtl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            איך זה עובד?
                        </h2>
                        <p className="text-xl opacity-90">
                            ארבעה שלבים פשוטים לקבלת עזרה
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="bg-white text-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                                1
                            </div>
                            <h3 className="text-xl font-bold mb-2">הרשמה</h3>
                            <p className="opacity-90">צרו חשבון בקלות תוך דקה</p>
                        </div>

                        <div className="text-center">
                            <div className="bg-white text-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                                2
                            </div>
                            <h3 className="text-xl font-bold mb-2">בקשת עזרה</h3>
                            <p className="opacity-90">תארו את הבעיה והמיקום שלכם</p>
                        </div>

                        <div className="text-center">
                            <div className="bg-white text-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                                3
                            </div>
                            <h3 className="text-xl font-bold mb-2">מתנדב נבחר</h3>
                            <p className="opacity-90">מתנדב מתאים נמצא ומגיע אליכם</p>
                        </div>

                        <div className="text-center">
                            <div className="bg-white text-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                                4
                            </div>
                            <h3 className="text-xl font-bold mb-2">קבלו עזרה</h3>
                            <p className="opacity-90">המתנדב מסייע לכם במקום</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 text-center" dir="rtl">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        מוכנים להצטרף?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        הצטרפו לקהילת המתנדבים והנהגים שלנו והתחילו לעזור או לקבל עזרה עוד היום!
                    </p>
                    <Link 
                        to="/register" 
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-lg"
                    >
                        התחילו עכשיו בחינם! 🚀
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-6" dir="rtl">
                    <div className="grid md:grid-cols-3 gap-8 text-center md:text-right">
                        <div>
                            <h3 className="text-xl font-bold mb-4">Helper on the Way</h3>
                            <p className="text-gray-400">פלטפורמה לסיוע הדדי בדרכים</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">קישורים</h3>
                            <div className="space-y-2">
                                <Link to="/about" className="block text-gray-400 hover:text-white transition-colors">אודות</Link>
                                <Link to="/services" className="block text-gray-400 hover:text-white transition-colors">שירותים</Link>
                                <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors">צור קשר</Link>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">צור קשר</h3>
                            <p className="text-gray-400">info.helperontheway@gmail.com</p>
                            <p className="text-gray-400">054-123-4567</p>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2025 Helper on the Way. כל הזכויות שמורות.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Landing;