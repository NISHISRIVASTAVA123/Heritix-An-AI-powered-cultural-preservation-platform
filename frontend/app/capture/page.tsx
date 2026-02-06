import AudioRecorder from '@/components/AudioRecorder';

export default function CapturePage() {
    return (
        <div className="max-w-2xl mx-auto py-10">
            <h1 className="text-3xl font-serif font-bold text-amber-900 mb-6 text-center">Capture Knowledge</h1>
            <p className="text-center text-stone-600 mb-8">
                Record a story, recipe, song, or tradition. Please request consent from the contributor before recording.
            </p>

            <AudioRecorder />

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                <p><strong>Note:</strong> By submitting this recording, you confirm that you have obtained necessary consent to share this cultural knowledge.</p>
            </div>
        </div>
    );
}
