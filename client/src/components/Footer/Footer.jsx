import { Link } from "react-router-dom";

const Footer = () => {
    return (
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
                            <Link to="/terms" className="block text-gray-400 hover:text-white transition-colors">תנאי שימוש</Link>
                            <Link to="/privacy" className="block text-gray-400 hover:text-white transition-colors">מדיניות פרטיות</Link>
                            <Link to="/about" className="block text-gray-400 hover:text-white transition-colors">אודות</Link>
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
    );
};

export default Footer;
