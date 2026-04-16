'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCity } from '@/lib/api';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';

export default function CityPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: city, isLoading } = useQuery({
    queryKey: ['city', slug],
    queryFn: () => getCity(slug),
    enabled: !!slug
  });

  if (isLoading) return (
    <SmoothScrollProvider>
      <Navbar />
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
      <Footer />
    </SmoothScrollProvider>
  );

  if (!city) return (
    <SmoothScrollProvider>
      <Navbar />
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>City not found</div>
      </div>
      <Footer />
    </SmoothScrollProvider>
  );

  return (
    <SmoothScrollProvider>
      <Navbar />
      <section style={{ paddingTop: 'clamp(120px, 15vw, 180px)', paddingBottom: 'clamp(60px, 8vw, 120px)', minHeight: '80vh' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 5vw, 56px)' }}>
            <div className="section-divider-line" />
            <span className="overline overline-dot">Gardening in {city.name}</span>
            <h1 className="display-2" style={{ color: 'var(--forest)', marginTop: 12 }}>{city.name} Gardening Services</h1>
            <p style={{ color: 'var(--text-2)', fontSize: '1.05rem', maxWidth: 720, margin: '12px auto 0', lineHeight: 1.7 }}>
              {city.description || 'Professional gardening services tailored for your city.'}
            </p>
          </div>
          <div dangerouslySetInnerHTML={{ __html: city.content || '<p>Content coming soon...</p>' }} />
        </div>
      </section>
      <Footer />
    </SmoothScrollProvider>
  );
}