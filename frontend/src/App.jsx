// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout/Layout';
// Import your routing setup or pages here as needed

function App() {
  // Initialize state by checking localStorage or fallback to system preference
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  });

  // Watch for changes to the theme state and update the DOM attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <Layout theme={theme} toggleTheme={toggleTheme}>
      {/* Your standard routing or view components go here.
        Example: <LandingPage /> or <Routes>...</Routes>
      */}
      <div className="p-8 bg-bg-secondary min-h-screen">
        <div className="max-w-md mx-auto bg-card-bg border border-border-custom p-6 rounded-lg shadow-sm">
          <h1 className="text-xl font-bold text-text-primary mb-2">
            Tailwind v4 Theme Connected!
          </h1>
          <p className="text-text-secondary">
            This card dynamically responds to utility classes like <code className="bg-bg-primary px-1 rounded">bg-card-bg</code> and <code className="bg-bg-primary px-1 rounded">text-text-primary</code> seamlessly.
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default App;
