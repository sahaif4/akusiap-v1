import React, { useState } from 'react';
import { HeroSlide, User, Unit } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Views
import LandingPageView from './views/LandingPageView';
import LoginView from './views/LoginView';
import AppShell from './components/AppShell';

const INITIAL_HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    image: 'https://cdn.rri.co.id/berita/1/images/1690860992458-20230723_135407/1690860992458-20230723_135407.jpg', 
    title: 'Politeknik Enjiniring Pertanian Indonesia',
    subtitle: 'Kampus vokasi modern di bawah Kementerian Pertanian, mencetak SDM unggul berstandar internasional.'
  },
  { id: 2, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:AN9GcQIs_UwB-cnpwzb9fbuLFlBzBVG9aLZMDkbFg&s', title: 'Teknologi Mekanisasi Pertanian', subtitle: 'Praktik bengkel dan rekayasa alat mesin pertanian (Alsintan) dengan fasilitas workshop terpadu.' },
  { id: 3, image: 'https://kepopedia.co.id/images/post/content/1/2023/2023-05-24/3a73379fc84c9dbcea57c1a99aa9ac66.jpg', title: 'Tata Air & Irigasi Presisi', subtitle: 'Kompetensi survei, pemetaan, dan manajemen tata air lahan rawa berbasis teknologi digital.' },
  { id: 4, image: 'https://pepi.ac.id/wp-content/uploads/2023/05/WhatsApp-Image-2023-05-26-at-07.52.14-768x512.jpeg', title: 'Teknologi Hasil Pertanian', subtitle: 'Inovasi pengolahan pangan dan pasca panen berbasis teknologi untuk meningkatkan nilai tambah produk pertanian.' },
  { id: 5, image: 'https://pepi.ac.id/wp-content/uploads/2025/04/WhatsApp-Image-2025-04-15-at-16.14.10-768x512.jpeg', title: 'Pembelajaran Berbasis Industri', subtitle: 'Sinergi pendidikan vokasi dengan dunia usaha dan dunia industri (DUDI) untuk mencetak lulusan siap kerja.' }
];

const AppContent: React.FC = () => {
    const { isAuthenticated, login, brandingConfig } = useAuth();
    const [showLogin, setShowLogin] = useState(false);

    const handleLoginSuccess = (user: User, unit?: Unit) => {
        login(user, unit);
        setShowLogin(false);
    };

    if (!isAuthenticated) {
        if (showLogin) {
            return <LoginView onLoginSuccess={handleLoginSuccess} onBack={() => setShowLogin(false)} brandingConfig={brandingConfig} />;
        }
        return <LandingPageView onLoginClick={() => setShowLogin(true)} slides={INITIAL_HERO_SLIDES} brandingConfig={brandingConfig} />;
    }

    return <AppShell />;
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
