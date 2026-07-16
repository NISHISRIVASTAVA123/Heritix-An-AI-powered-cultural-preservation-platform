import ExploreClient from '@/components/ExploreClient';

export const metadata = {
  title: 'AI Cultural Explorer | Heritix',
  description: 'Discover regional heritage on our cultural map and explore motifs in the 3D Wisdom Web.',
};

export default function ExplorePage() {
    return (
        <div className="pt-24 h-screen w-full box-border bg-indian-prussian bg-indian-pattern relative overflow-hidden">
            <ExploreClient />
        </div>
    );
}
