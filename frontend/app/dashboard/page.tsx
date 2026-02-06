export default function DashboardPage() {
    return (
        <div className="py-10">
            <h1 className="text-3xl font-serif font-bold text-amber-900 mb-6">Learning Dashboard</h1>
            <p className="text-stone-600 mb-8">Explore educational content generated from our cultural archive.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow border border-stone-200">
                    <h2 className="text-xl font-bold mb-4 text-amber-800">Recent Lessons</h2>
                    <ul className="space-y-4">
                        <li className="p-3 bg-stone-50 rounded border border-stone-100">
                            <h4 className="font-bold text-stone-800">The Significance of Turmeric</h4>
                            <p className="text-sm text-stone-600">Learn about the ritualistic uses of turmeric in weddings.</p>
                            <button className="text-amber-700 text-sm font-semibold mt-2 hover:underline">Start Lesson →</button>
                        </li>
                        <li className="p-3 bg-stone-50 rounded border border-stone-100">
                            <h4 className="font-bold text-stone-800">Folk Songs of the Harvest</h4>
                            <p className="text-sm text-stone-600">Analysis of common themes in harvest festival songs.</p>
                            <button className="text-amber-700 text-sm font-semibold mt-2 hover:underline">Start Lesson →</button>
                        </li>
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-stone-200">
                    <h2 className="text-xl font-bold mb-4 text-amber-800">Your Contributions</h2>
                    <div className="text-center py-8 text-stone-500">
                        <p className="text-4xl font-bold text-stone-300 mb-2">0</p>
                        <p>You haven't contributed any stories yet.</p>
                        <a href="/capture" className="text-amber-600 font-semibold mt-2 block hover:underline">Record Now</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
