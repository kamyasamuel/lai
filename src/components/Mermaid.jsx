import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false, theme: 'dark' });

const Mermaid = ({ chart }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && chart) {
      try {
        mermaid.render('mermaid-graph-' + Math.random().toString(36).substring(2, 9), chart, (svg) => {
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        });
      } catch (e) {
        console.error("Mermaid render error:", e);
        if (ref.current) {
          ref.current.innerHTML = "Error rendering diagram.";
        }
      }
    }
  }, [chart]);

  return <div ref={ref} />;
};

export default Mermaid; 