export default function DashboardPage() {
    return (
        <div className="py-10">
            <h1 className="text-3xl font-serif font-bold text-primary mb-6">Learning Dashboard</h1>
            <p className="text-on-surface-variant mb-8">Explore educational content generated from our cultural archive.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-surface-container-lowest p-6 rounded-lg shadow border border-outline-variant/30">
                    <h2 className="text-xl font-bold mb-4 text-primary">Recent Lessons</h2>
                    <ul className="space-y-4">
                        <li className="p-3 bg-surface-container-low rounded border border-outline-variant/20">
                            <h4 className="font-bold text-on-surface">The Significance of Turmeric</h4>
                            <p className="text-sm text-on-surface-variant">Learn about the ritualistic uses of turmeric in weddings.</p>
                            <button className="text-secondary text-sm font-semibold mt-2 hover:underline">Start Lesson →</button>
                        </li>
                        <li className="p-3 bg-surface-container-low rounded border border-outline-variant/20">
                            <h4 className="font-bold text-on-surface">Folk Songs of the Harvest</h4>
                            <p className="text-sm text-on-surface-variant">Analysis of common themes in harvest festival songs.</p>
                            <button className="text-secondary text-sm font-semibold mt-2 hover:underline">Start Lesson →</button>
                        </li>
                    </ul>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-lg shadow border border-outline-variant/30">
                    <h2 className="text-xl font-bold mb-4 text-primary">Your Contributions</h2>
                    <div className="text-center py-8 text-on-surface-variant">
                        <p className="text-4xl font-bold text-outline-variant mb-2">0</p>
                        <p>You haven't contributed any stories yet.</p>
                        <a href="/capture" className="text-secondary font-semibold mt-2 block hover:underline">Record Now</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
