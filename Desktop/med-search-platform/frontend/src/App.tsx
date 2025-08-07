import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { RoleRedirectHandler } from '@components/RoleRedirectHandler';
import { DevRoleTool } from '@components/DevRoleTool';
import { LandingPage } from '@components/LandingPage';
import { SearchResults } from '@pages/SearchResults';
import Preloader from '@components/Preloader';

function App() {
  const [showPreloader, setShowPreloader] = useState<boolean>(true);
  const [isPreloaderComplete, setIsPreloaderComplete] = useState<boolean>(false);

  useEffect(() => {
    // Check if preloader has been shown in this session
    const preloaderShown = sessionStorage.getItem('medsearch-preloader-shown');
    
    if (preloaderShown === 'true') {
      // Skip preloader if already shown in this session
      setShowPreloader(false);
      setIsPreloaderComplete(true);
    }
  }, []);

  const handlePreloaderComplete = () => {
    // Mark preloader as shown for this session
    sessionStorage.setItem('medsearch-preloader-shown', 'true');
    setShowPreloader(false);
    setIsPreloaderComplete(true);
  };

  // Show preloader first, before anything else
  if (showPreloader && !isPreloaderComplete) {
    return <Preloader onComplete={handlePreloaderComplete} />;
  }

  // Show main app content after preloader
  return (
    <div>
      <SignedIn>
        <RoleRedirectHandler />
        <DevRoleTool isDevMode={process.env.NODE_ENV === 'development'} />
      </SignedIn>
      
      <SignedOut>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/search" element={<SearchResults />} />
        </Routes>
      </SignedOut>
    </div>
  );
}

export default App;