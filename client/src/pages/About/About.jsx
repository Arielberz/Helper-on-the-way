/*
  קובץ זה אחראי על:
  - דף אודות המערכת - מידע על הפרויקט
  - הסבר על השירות, צוות הפיתוח, חזון
  - עיצוב מודרני עם Header ו-Footer

  הקובץ משמש את:
  - משתמשים שרוצים לדעת על המערכת
  - קישור מה-Footer

  הקובץ אינו:
  - דף פונקציונלי - רק תוכן סטטי
  - דף landing - יש landing.jsx נפרד
*/

import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

const About = () => {
    return (
        <div className="min-h-screen" style={{ background: 'var(--background)' }} dir="rtl">
            <Header />
            

            


            <section className="py-16">
                <div className="container mx-auto px-6 max-w-4xl">
                    

                    <div className="glass bg-white mb-8" style={{ 
                        borderRadius: 'var(--rounded-xl)',
                        padding: 'var(--space-xxl)',
                        boxShadow: 'var(--shadow-lg)'
                    }}>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center" style={{ color: 'var(--text-main)' }}>
                            הסיפור שלנו
                        </h2>
                        <div className="space-y-6 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            <p className="text-xl font-semibold" style={{ color: 'var(--primary)' }}>
                                Helper on the Way נולדה מתוך חוויה אישית אמיתית על הכביש.
                            </p>
                            <p>
                                במהלך נסיעה בכביש ראשי, הרכב נעצר בעקבות פאנצ'ר. ללא ידע טכני מתאים וללא כלים בסיסיים להחלפת גלגל, מצאתי את עצמי עומד בצד הדרך, במצב מלחיץ וחסר אונים. ניסיונות לעצור עוברי אורח לא צלחו – עד שאדם זר אחד עצר, ובתוך דקות ספורות פתר את הבעיה.
                            </p>
                            <p className="font-semibold" style={{ color: 'var(--text-main)' }}>
                                עבורו זו הייתה פעולה פשוטה ושגרתית. עבורי – הצלה של ממש.
                            </p>
                            <div className="p-6" style={{ 
                                background: 'linear-gradient(90deg, var(--background) 0%, var(--background-dark) 100%)',
                                borderRight: '4px solid var(--primary)',
                                borderRadius: 'var(--rounded-md)'
                            }}>
                                <p className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>
                                    הרגע הזה העלה שאלה פשוטה אך מהותית:
                                </p>
                                <p className="mt-2 italic">
                                    איך ייתכן שיש כל כך הרבה אנשים עם ידע וכלים שיכולים לעזור – אבל אין דרך מהירה, נגישה ואמינה לחבר ביניהם לבין מי שזקוק לעזרה?
                                </p>
                            </div>
                            <p className="text-xl font-bold text-center" style={{ color: 'var(--primary)' }}>
                                מכאן נולדה האפליקציה.
                            </p>
                        </div>
                    </div>


                    <div className="glass mb-8" style={{ 
                        background: 'var(--background-dark)',
                        borderRadius: 'var(--rounded-xl)',
                        padding: 'var(--space-xxl)',
                        boxShadow: 'var(--shadow-lg)'
                    }}>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center" style={{ color: 'var(--text-main)' }}>
                            למה האפליקציה קיימת?
                        </h2>
                        <div className="space-y-4 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            <p>
                                במצבי תקלה קטנים בדרכים – פאנצ'ר, חוסר דלק, בעיית חשמל או צורך בכבלים – הפתרונות הקיימים כיום אינם אידיאליים:
                            </p>
                            <ul className="space-y-3 mr-6">
                                <li className="flex items-start gap-3">
                                    <span className="text-2xl" style={{ color: 'var(--danger)' }}>❌</span>
                                    <span>שירותי גרירה יקרים ולא תמיד זמינים</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-2xl" style={{ color: 'var(--danger)' }}>❌</span>
                                    <span>שירותים התנדבותיים עם זמני המתנה לא ברורים</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-2xl" style={{ color: 'var(--danger)' }}>❌</span>
                                    <span>פתרונות ביטוחיים מוגבלים או יקרים</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-2xl" style={{ color: 'var(--danger)' }}>❌</span>
                                    <span>ואפליקציות בינלאומיות שלא מותאמות לשוק הישראלי</span>
                                </li>
                            </ul>
                            <p className="text-xl font-bold text-center mt-6" style={{ color: 'var(--primary)' }}>
                                Helper on the Way נועדה למלא את הפער הזה.
                            </p>
                        </div>
                    </div>


                    <div className="glass bg-white mb-8" style={{ 
                        borderRadius: 'var(--rounded-xl)',
                        padding: 'var(--space-xxl)',
                        boxShadow: 'var(--shadow-lg)'
                    }}>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center" style={{ color: 'var(--text-main)' }}>
                            איך זה עובד?
                        </h2>
                        <div className="space-y-6 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            <p>האפליקציה מחברת בין:</p>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="glass p-6" style={{ 
                                    background: 'var(--glass-bg-strong)',
                                    borderRadius: 'var(--rounded-lg)'
                                }}>
                                    <div className="text-4xl mb-3 text-center">🆘</div>
                                    <h3 className="text-xl font-bold mb-2 text-center" style={{ color: 'var(--text-main)' }}>מבקשי עזרה</h3>
                                    <p className="text-center">
                                        נהגים ונהגות שנתקעים בדרכים וזקוקים לפתרון מהיר
                                    </p>
                                </div>
                                
                                <div className="glass p-6" style={{ 
                                    background: 'var(--glass-bg-strong)',
                                    borderRadius: 'var(--rounded-lg)'
                                }}>
                                    <div className="text-4xl mb-3 text-center">🛠️</div>
                                    <h3 className="text-xl font-bold mb-2 text-center" style={{ color: 'var(--text-main)' }}>מציעי סיוע</h3>
                                    <p className="text-center">
                                        אנשים עם ידע, כלים וזמינות, שמוכנים לעזור תמורת תשלום הוגן
                                    </p>
                                </div>
                            </div>

                            <div className="p-6" style={{ 
                                background: 'var(--background)',
                                borderRight: '4px solid var(--primary)',
                                borderRadius: 'var(--rounded-md)'
                            }}>
                                <p className="font-semibold">
                                    החיבור מתבצע בזמן אמת, לפי מיקום, סוג התקלה והכלים הזמינים – בצורה פשוטה, שקופה ונגישה.
                                </p>
                            </div>
                        </div>
                    </div>


                    <div className="glass mb-8" style={{ 
                        background: 'var(--background-dark)',
                        borderRadius: 'var(--rounded-xl)',
                        padding: 'var(--space-xxl)',
                        boxShadow: 'var(--shadow-lg)'
                    }}>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center" style={{ color: 'var(--text-main)' }}>
                            הערכים שמובילים אותנו
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="glass bg-white p-6" style={{ 
                                borderRadius: 'var(--rounded-lg)',
                                boxShadow: 'var(--shadow-md)'
                            }}>
                                <div className="text-3xl mb-3">⚡</div>
                                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>זמינות מיידית</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>עזרה כשצריך, בלי המתנה מיותרת</p>
                            </div>
                            
                            <div className="glass bg-white p-6" style={{ 
                                borderRadius: 'var(--rounded-lg)',
                                boxShadow: 'var(--shadow-md)'
                            }}>
                                <div className="text-3xl mb-3">⚖️</div>
                                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>הוגנות ושקיפות</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>תשלום ברור והוגן לשני הצדדים</p>
                            </div>
                            
                            <div className="glass bg-white p-6" style={{ 
                                borderRadius: 'var(--rounded-lg)',
                                boxShadow: 'var(--shadow-md)'
                            }}>
                                <div className="text-3xl mb-3">🤝</div>
                                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>קהילתיות וסולידריות</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>חיבור בין אנשים, לא רק בין שירותים</p>
                            </div>
                            
                            <div className="glass bg-white p-6" style={{ 
                                borderRadius: 'var(--rounded-lg)',
                                boxShadow: 'var(--shadow-md)'
                            }}>
                                <div className="text-3xl mb-3">✅</div>
                                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>אמינות ובטיחות</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>דירוגים, ביקורות, דיווחים ופיקוח</p>
                            </div>
                            
                            <div className="glass bg-white p-6 md:col-span-2" style={{ 
                                borderRadius: 'var(--rounded-lg)',
                                boxShadow: 'var(--shadow-md)'
                            }}>
                                <div className="text-3xl mb-3">🚀</div>
                                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>טכנולוגיה חכמה</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>שימוש במיקום בזמן אמת, פרופילים וכלים מותאמים</p>
                            </div>
                        </div>
                    </div>


                    <div className="glass mb-8" style={{ 
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                        color: 'var(--text-inverted)',
                        borderRadius: 'var(--rounded-xl)',
                        padding: 'var(--space-xxl)',
                        boxShadow: 'var(--shadow-lg)'
                    }}>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
                            החזון
                        </h2>
                        <div className="space-y-6 text-lg leading-relaxed">
                            <p className="text-center text-xl">
                                אנחנו מאמינים שבעזרת טכנולוגיה פשוטה ונכונה, אפשר להפוך רגעים מלחיצים על הכביש לחוויה אנושית, יעילה ובטוחה יותר.
                            </p>
                            <div className="glass p-8 text-center" style={{ 
                                borderRadius: 'var(--rounded-lg)'
                            }}>
                                <p className="text-2xl font-bold mb-2">
                                    Helper on the Way היא לא רק אפליקציה –
                                </p>
                                <p className="text-xl">
                                    היא קהילה של אנשים שעוזרים זה לזה, בדרך הוגנת, חכמה ומודרנית.
                                </p>
                            </div>
                        </div>
                    </div>


                    <div className="glass bg-white text-center" style={{ 
                        borderRadius: 'var(--rounded-xl)',
                        padding: 'var(--space-xxl)',
                        boxShadow: 'var(--shadow-lg)'
                    }}>
                        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>
                            מוכנים להצטרף לקהילה?
                        </h2>
                        <p className="text-xl mb-8" style={{ color: 'var(--text-secondary)' }}>
                            התחילו לעזור או לקבל עזרה עוד היום!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link 
                                to="/register" 
                                className="text-white font-bold py-4 px-8 hover:scale-105 transform text-lg"
                                style={{ 
                                    background: 'var(--primary)',
                                    borderRadius: 'var(--rounded-full)',
                                    boxShadow: 'var(--shadow-md)',
                                    transition: 'var(--transition-mid)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-dark)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
                            >
                                🚀 הצטרפו עכשיו
                            </Link>
                            <Link 
                                to="/" 
                                className="font-bold py-4 px-8 hover:scale-105 transform text-lg"
                                style={{ 
                                    background: 'var(--background-dark)',
                                    color: 'var(--text-main)',
                                    borderRadius: 'var(--rounded-full)',
                                    boxShadow: 'var(--shadow-md)',
                                    transition: 'var(--transition-mid)'
                                }}
                            >
                                📖 למד עוד
                            </Link>
                        </div>
                    </div>

                </div>
            </section>


            <Footer />
        </div>
    );
};

export default About;
