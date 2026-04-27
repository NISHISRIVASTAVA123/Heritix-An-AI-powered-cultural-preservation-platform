import GroqCulturalMap from '@/components/GroqCulturalMap';

export const metadata = {
  title: 'AI Cultural Explorer | Heritix',
  description: 'Click anywhere on the map to discover its cultural heritage instantly.',
};

export default function ExplorePage() {
    return (
        <div className="pt-24 h-screen w-full box-border">
            <GroqCulturalMap />
        </div>
    );
}
