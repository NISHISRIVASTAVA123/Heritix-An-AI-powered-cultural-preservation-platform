'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Record {
    _id: string;
    title: string;
    transcript: string;
    category: string;
    created_at: string;
}

export default function ArchivePage() {
    const [records, setRecords] = useState<Record[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                // In a real app this would be an env var
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/archive/all`);
                setRecords(res.data);
            } catch (err) {
                console.error("Failed to fetch records", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, []);

    return (
        <div className="py-10">
            <h1 className="text-3xl font-serif font-bold text-amber-900 mb-8">Cultural Archive</h1>

            {loading ? (
                <p>Loading archive...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {records.map((record) => (
                        <div key={record._id} className="bg-white p-6 rounded-lg shadow-md border border-stone-200 hover:shadow-lg transition">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2 block">{record.category || 'Uncategorized'}</span>
                            <h3 className="text-xl font-bold mb-3 text-stone-900">{record.title}</h3>
                            <p className="text-stone-600 line-clamp-3 mb-4">{record.transcript}</p>
                            <div className="text-xs text-stone-400">
                                {new Date(record.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {records.length === 0 && !loading && (
                <p className="text-stone-500 text-center italic">No records found. Start capturing knowledge!</p>
            )}
        </div>
    );
}
