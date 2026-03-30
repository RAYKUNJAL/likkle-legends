'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle, GitBranch, Calendar } from 'lucide-react';

interface Deployment {
  id: string;
  timestamp: string;
  status: 'success' | 'in-progress' | 'failed';
  version: string;
  files: number;
  branch: string;
}

export function AdminDeploymentPanel() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBranch, setNewBranch] = useState('main');
  const [deploying, setDeploying] = useState(false);

  useEffect(() => {
    fetchDeployments();
    const interval = setInterval(fetchDeployments, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDeployments = async () => {
    try {
      const response = await fetch('/api/deployments');
      const data = await response.json();
      if (data.success) {
        setDeployments(data.deployments);
      }
    } catch (error) {
      console.error('Failed to fetch deployments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeploying(true);

    try {
      const response = await fetch('/api/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch: newBranch,
          version: `v${new Date().getFullYear()}.${new Date().getMonth() + 1}.${new Date().getDate()}`,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewBranch('main');
        await fetchDeployments();
      }
    } catch (error) {
      console.error('Deployment failed:', error);
    } finally {
      setDeploying(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'in-progress':
        return <Loader2 className="text-blue-500 animate-spin" size={20} />;
      case 'failed':
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Deployment Dashboard</h2>

      {/* Deployment Form */}
      <form onSubmit={handleDeploy} className="mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-bold mb-2">Branch</label>
            <input
              type="text"
              value={newBranch}
              onChange={(e) => setNewBranch(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter branch name"
            />
          </div>
          <button
            type="submit"
            disabled={deploying}
            className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {deploying ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Deploying...
              </>
            ) : (
              'Deploy'
            )}
          </button>
        </div>
      </form>

      {/* Deployments List */}
      <div>
        <h3 className="text-lg font-bold mb-4">Recent Deployments</h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : deployments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No deployments yet
          </div>
        ) : (
          <div className="space-y-3">
            {deployments.map((deployment) => (
              <div
                key={deployment.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4 flex-1">
                  {getStatusIcon(deployment.status)}
                  <div className="flex-1">
                    <div className="font-bold flex items-center gap-2">
                      <GitBranch size={16} />
                      {deployment.branch}
                      <span className="text-sm font-normal text-gray-500">
                        ({deployment.version})
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Calendar size={14} />
                      {new Date(deployment.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold capitalize text-sm">
                    {deployment.status === 'in-progress' ? 'Deploying...' : deployment.status}
                  </div>
                  <div className="text-xs text-gray-500">
                    {deployment.files} files
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {deployments.length}
          </div>
          <div className="text-sm text-gray-500">Total Deployments</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500">
            {deployments.filter((d) => d.status === 'success').length}
          </div>
          <div className="text-sm text-gray-500">Successful</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-500">
            {deployments.filter((d) => d.status === 'failed').length}
          </div>
          <div className="text-sm text-gray-500">Failed</div>
        </div>
      </div>
    </div>
  );
}
