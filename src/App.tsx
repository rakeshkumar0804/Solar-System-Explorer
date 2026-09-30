import { Component, lazy, Suspense, useState } from 'react';
import type { ReactNode } from 'react';
import SolarExplorer from './explorer/SolarExplorer';

const DeepSpaceExplorer = lazy(() => import('./explorer/deep/DeepSpaceExplorer'));

class DeepSpaceBoundary extends Component<{ children: ReactNode; onReturn: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main className="chapter-loading"><p>Deep Space could not be loaded.</p><button onClick={this.props.onReturn}>Return to Solar System</button></main>;
    return this.props.children;
  }
}

export default function App() {
  const [deepSpace, setDeepSpace] = useState(false);
  const returnToSolar = () => setDeepSpace(false);
  return <>
    <SolarExplorer active={!deepSpace} onDeepSpace={() => setDeepSpace(true)} />
    {deepSpace && <DeepSpaceBoundary onReturn={returnToSolar}>
      <Suspense fallback={<main className="chapter-loading" aria-busy="true"><span className="loading-ring" /><p>Opening Deep Space…</p><button onClick={returnToSolar}>Return to Solar System</button></main>}>
        <DeepSpaceExplorer onReturn={returnToSolar} />
      </Suspense>
    </DeepSpaceBoundary>}
  </>;
}
