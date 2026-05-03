export default function AudioPlayer({ url }) {
  if (!url) return null;
  return (
    <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-700 shadow-inner">
      <audio controls className="w-full h-10 outline-none">
        <source src={url} type="audio/mpeg" />
        your browser does not support the audio element.
      </audio>
    </div>
  );
}
