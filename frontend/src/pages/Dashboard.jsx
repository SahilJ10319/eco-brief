import Button from '../components/Button';
import Card from '../components/Card';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-100">Latest Briefings</h2>
        <Button variant="primary">Trigger Pipeline</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <div className="flex flex-col h-full justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-eco-400 tracking-wider uppercase mb-2 block">System Status</span>
              <h3 className="text-lg font-medium text-slate-200 mb-1">Pipeline Active</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                The ingestion orchestrator is standing by. All services are linked and ready for inference.
              </p>
            </div>
            <Button variant="secondary" className="w-full">View Logs</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
