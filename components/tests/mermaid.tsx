"use client";
import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { useTheme } from "next-themes";

interface MermaidProps {
  chart: string;
}

const Mermaid = ({ chart }: MermaidProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2, 8)}`);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: resolvedTheme === "dark" ? "dark" : "default",
      securityLevel: "loose",
    });

    const renderChart = async () => {
      if (!ref.current || !chart.trim()) return;

      setError(null);
      ref.current.innerHTML = "";

      const existing = document.getElementById(idRef.current);
      if (existing) existing.remove();

      try {
        const { svg } = await mermaid.render(idRef.current, chart);
        if (ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (err) {
        console.error("Mermaid error:", err);
        setError("Error en sintaxis del diagrama");
      }
    };

    renderChart();
  }, [chart, resolvedTheme]);

  return (
    <div className="w-full overflow-x-auto p-4">
      {error ? (
        <p className="text-red-500 text-xs">{error}</p>
      ) : (
        <div
          ref={ref}
          className="mermaid-container flex justify-center w-full min-h-25"
        />
      )}
    </div>
  );
};

export default Mermaid;
