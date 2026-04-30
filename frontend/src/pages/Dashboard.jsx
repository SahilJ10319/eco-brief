export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Latest Briefings</h2>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors">
          Trigger Pipeline
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-slate-800 border border-slate-700">
          <p className="text-slate-400 text-sm">Dashboard scaffolded successfully.</p>
        </div>
      </div>
    </div>
  );
}
