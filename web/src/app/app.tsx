import { AppLayout } from './app-layout';
import { AppRoutes } from './app-routes';
import { useWorkspace, WorkspaceProvider } from './workspace';
import { ClusterProvider } from './cluster/cluster-data-access';
import { SolanaProvider } from './solana/solana-provider';

export function App() {
  // useWorkspace()
  return (
    <ClusterProvider>
      <SolanaProvider>
        <WorkspaceProvider>
          <AppLayout>
            <AppRoutes />
          </AppLayout>
        </WorkspaceProvider>
      </SolanaProvider>
    </ClusterProvider>
  );
}
