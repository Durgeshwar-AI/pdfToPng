import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");

    if (!consent) {
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setVisible(false);
  };

  const rejectCookies = () => {
    localStorage.setItem("cookieConsent", "rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:max-w-lg bg-white border border-gray-200 rounded-xl shadow-xl p-5 z-50">
      <h3 className="text-lg font-semibold mb-2">
        🍪 Cookie Preferences
      </h3>

      <p className="text-sm text-gray-600 mb-4">
        We use cookies to improve your experience and remember your preferences.
        Read our{" "}
        <Link
          to="/cookies"
          className="text-blue-600 underline"
        >
          Cookie Policy
        </Link>.
      </p>

      <div className="flex gap-3">
        <button
          onClick={acceptCookies}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Accept
        </button>

        <button
          onClick={rejectCookies}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

export default CookieBanner;