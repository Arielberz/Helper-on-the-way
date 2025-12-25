import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useEffect, useState } from "react";

const Landing = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="min-h-screen bg-white" dir="rtl">
            <Header />
            
            <main>
                {/* Hero Section */}
                <section className="relative pt-6 pb-0 overflow-hidden">
                    <div className="container mx-auto px-6">
                        <div className={`relative z-20 flex flex-col items-center text-center max-w-5xl mx-auto mb-0 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            <span className="inline-block py-2 px-4 rounded-full bg-blue-50 text-blue-600 font-bold text-sm mb-4 border border-blue-100 animate-pulse">
                                🌟 הפלטפורמה המובילה בישראל
                            </span>
                            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
                                עזרה בדרך <br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                    בדיוק כשצריך אותה
                                </span>
                            </h1>
                            <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed">
                                נתקעתם בצד הדרך? אל דאגה. הקהילה שלנו כאן בשבילכם.
                                חיבור מהיר למתנדבים ובעלי מקצוע בקרבת מקום, בזמן אמת.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
                                <Link 
                                    to="/register" 
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-lg flex items-center justify-center gap-2"
                                >
                                    <span>הצטרפו עכשיו</span>
                                    <span>🚀</span>
                                </Link>
                                <Link 
                                    to="/about" 
                                    className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 px-10 rounded-full border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 text-lg"
                                >
                                    איך זה עובד?
                                </Link>
                            </div>
                        </div>

                        {/* Hero Image */}
                        <div className={`relative mx-auto max-w-6xl md:-mt-24 transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                            <div className="relative z-10 group">
                                <img 
                                    src="/mapHeroB.png" 
                                    alt="Helper on the Way Interface" 
                                    className="relative w-full  mx-auto h-auto object-contain transform group-hover:scale-[1.01] transition-transform duration-700 mix-blend-multiply drop-shadow-xl"
                                />
                            </div>
                            {/* Hidden blur: Was causing background artifacts with mix-blend-mode 
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-[80px] -z-10 rounded-full"></div>
                            */}
                        </div>
                    </div>
                </section>

                {/* Statistics / Trust Indicators */}
                <section className="py-12 border-y border-gray-100 bg-gray-50/50">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center opacity-80">
                            {[
                                { number: "24/7", label: "זמינות מסביב לשעון" },
                                { number: "100%", label: "חינם למתנדבים" },
                                { number: "500+", label: "מתנדבים פעילים" },
                                { number: "< 15", label: "דקות זמן הגעה ממוצע" },
                            ].map((stat, i) => (
                                <div key={i} className="text-center group hover:-translate-y-1 transition-transform duration-300">
                                    <div className="text-3xl font-bold text-blue-600 mb-1 group-hover:text-blue-700 transition-colors">{stat.number}</div>
                                    <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
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

            </main>

            <Footer />
        </div>
    );
}

export default Landing;