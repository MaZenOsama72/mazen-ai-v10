import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Copy, Check, Code, AlertCircle } from 'lucide-react';

interface MermaidDiagramProps {
  chart: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

    mermaid.initialize({
      startOnLoad: false,
      theme: document.documentElement.classList.contains('light') ? 'neutral' : 'dark',
      securityLevel: 'loose',
      fontFamily: 'Inter, sans-serif',
    });

    mermaid
      .render(uniqueId, chart)
      .then(({ svg }) => {
        if (isMounted) {
          setSvgContent(svg);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('Mermaid rendering error:', err);
          setError('Failed to render diagram syntax.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [chart]);

  const handleCopy = () => {
    navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-white/15 light:border-black/15 bg-[#12151d] light:bg-[#f8fafc] shadow-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#181c27] light:bg-[#e2e8f0] border-b border-white/10 light:border-black/10 text-xs font-mono text-[#8b93a7] light:text-[#475569]">
        <div className="flex items-center gap-1.5 font-semibold text-amber-400 light:text-amber-700">
          <span className="w-2 h-2 rounded-full bg-amber-400 light:bg-amber-600" />
          <span>Mermaid Diagram</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-1 hover:text-[#edeef2] light:hover:text-[#0f172a] transition-colors"
            title="Toggle Source Code"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showCode ? 'View Diagram' : 'View Code'}</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 hover:text-[#edeef2] light:hover:text-[#0f172a] transition-colors"
            title="Copy Diagram Code"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 light:text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-x-auto flex justify-center items-center min-h-[120px]">
        {showCode ? (
          <pre className="w-full text-xs font-mono p-3 bg-[#0d1017] light:bg-[#1e293b] text-slate-200 rounded-lg overflow-x-auto">
            {chart}
          </pre>
        ) : error ? (
          <div className="flex items-center gap-2 text-amber-400 light:text-amber-700 text-xs py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error} Rendering raw code...</span>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="mermaid-svg-wrapper max-w-full overflow-x-auto text-center"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>
    </div>
  );
};
