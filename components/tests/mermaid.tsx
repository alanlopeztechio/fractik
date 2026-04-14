"use client";
import { useEffect, useRef, useState, useId } from "react";
import mermaid from "mermaid";
import { useTheme } from "next-themes";

interface MermaidProps {
  chart: string;
}

const Mermaid = ({ chart }: MermaidProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();

  const reactId = useId().replace(/:/g, "");
  const renderId = `mermaid-svg-${reactId}`;

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: resolvedTheme === "dark" ? "dark" : "default",
      securityLevel: "loose",
    });

    const renderChart = async () => {
      if (!containerRef.current || !chart.trim()) return;

      try {
        setError(null);

        const { svg, bindFunctions } = await mermaid.render(renderId, chart);

        if (containerRef.current) {
          containerRef.current.innerHTML = svg;

          if (bindFunctions) {
            bindFunctions(containerRef.current);
          }
        }
      } catch (err) {
        console.error("Mermaid render error:", err);
        setError(`Error en sintaxis del diagrama ${err}`);

        const badge = document.getElementById(`d${renderId}`);
        if (badge) badge.remove();
      }
    };

    renderChart();

    return () => {
      const existing = document.getElementById(renderId);
      if (existing) existing.remove();
    };
  }, [chart, resolvedTheme, renderId]);

  return (
    <div className="w-full overflow-x-auto p-4 flex flex-col items-center">
      {error && <p className="text-destructive text-xs font-mono">{error}</p>}
      <div
        ref={containerRef}
        className={`mermaid-container flex justify-center w-full transition-opacity duration-300 ${
          error ? "opacity-0 h-0" : "opacity-100 min-h-[100px]"
        }`}
      />
    </div>
  );
};

export default Mermaid;
