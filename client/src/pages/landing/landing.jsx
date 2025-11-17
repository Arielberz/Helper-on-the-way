
import LandingHeader from "../../components/landingHeader/landingHeader";
import "./landing.css";

const Landing = () => {
    
    return <>
    <LandingHeader />
    <div className="landing-container">
        <div className="landing-content">
            <h1 className="landing-title">ברוכים הבאים לאתר</h1>
            <h2 className="landing-subtitle">Helper on the Way!</h2>
            <p className="landing-description">
                פלטפורמה לסיוע הדדי בדרכים - כאן תמצאו עזרה מהירה וקלה בכל מקום ובכל זמן
            </p>
            <div className="landing-buttons">
                <a href="/register" className="btn-primary-landing">התחל עכשיו</a>
                <a href="/login" className="btn-secondary-landing">כניסה למערכת</a>
            </div>
        </div>
    </div>
    </>
    
}
export default Landing;