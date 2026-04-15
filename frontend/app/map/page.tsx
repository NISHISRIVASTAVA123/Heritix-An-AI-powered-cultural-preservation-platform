import MapExplorer from '@/components/MapExplorer';

export const metadata = {
  title: 'Cultural Map Explorer | Heritix',
  description: 'Explore preserved cultural heritage and stories interactively on a geographical map.',
};

export default function MapPage() {
  return (
    <div className="pt-20 lg:pt-0">
      <MapExplorer />
    </div>
  );
}
