import React, { useState, useRef } from 'react';
import { usePersonas } from '../context/PersonaContext';
import type { Persona } from '../types';
import { Crepe } from '@milkdown/crepe';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';

// Milkdown/Crepe wrapper for persona markdown
const MilkdownEditorWrapper: React.FC<{
  content: string;
  editable?: boolean;
  crepeRef?: React.MutableRefObject<Crepe | null>;
}> = ({ content, editable = false, crepeRef }) => {
  useEditor(
    (root) => {
      const crepe = new Crepe({ root, defaultValue: content });
      crepe.setReadonly(!editable);
      if (crepeRef) crepeRef.current = crepe;
      return crepe;
    },
    [content, editable]
  );
  return <Milkdown />;
};

function PersonasDirectoryView() {
  const { personas, loading, error } = usePersonas();
  const [selected, setSelected] = useState<string | null>(null);
  const crepeRef = useRef<Crepe | null>(null);

  // Sort personas alphabetically by name
  const sorted = [...personas].sort((a, b) => a.name.localeCompare(b.name));
  const selectedPersona = sorted.find(p => p.name === selected) || sorted[0];

  // Compose markdown from persona fields (for now, just show the markdown as-is if available)
  // In a real app, you might want to store the raw markdown in Persona, or fetch it on select
  // Here, we just render a simple markdown summary for demo
  function personaToMarkdown(persona: Persona): string {
    let md = `# ${persona.name}\n\n`;
    md += `**Primary Focus:** ${persona.primaryFocus}\n\n`;
    if (persona.decisionFramework?.priorities?.length) {
      md += `**When choosing between options, prioritize:**\n`;
      persona.decisionFramework.priorities.forEach((p: string, i: number) => {
        md += `${i + 1}. ${p}\n`;
      });
      md += `\n`;
    }
    if (persona.decisionFramework?.defaultAssumptions?.length) {
      md += `**Default assumptions:**\n`;
      persona.decisionFramework.defaultAssumptions.forEach((a: string) => {
        md += `- ${a}\n`;
      });
      md += `\n`;
    }
    if (persona.codePatterns) {
      md += `## Code Patterns\n\n`;
      if (persona.codePatterns.alwaysImplement?.length) {
        md += `**Always implement:**\n`;
        persona.codePatterns.alwaysImplement.forEach((a: string) => {
          md += `- ${a}\n`;
        });
        md += `\n`;
      }
      if (persona.codePatterns.avoid?.length) {
        md += `**Avoid:**\n`;
        persona.codePatterns.avoid.forEach((a: string) => {
          md += `- ${a}\n`;
        });
        md += `\n`;
      }
    }
    if (persona.requirementsPatterns) {
      md += `## Requirements Patterns\n\n`;
      if (persona.requirementsPatterns.alwaysInclude?.length) {
        md += `**Always include:**\n`;
        persona.requirementsPatterns.alwaysInclude.forEach((a: string) => {
          md += `- ${a}\n`;
        });
        md += `\n`;
      }
      if (persona.requirementsPatterns.avoid?.length) {
        md += `**Avoid:**\n`;
        persona.requirementsPatterns.avoid.forEach((a: string) => {
          md += `- ${a}\n`;
        });
        md += `\n`;
      }
    }
    if (persona.domainContexts?.length) {
      md += `## Domain Context\n\n`;
      persona.domainContexts.forEach((ctx: { name: string; items: string[] }) => {
        md += `### ${ctx.name}\n\n`;
        ctx.items.forEach((item: string) => {
          md += `- ${item}\n`;
        });
        md += `\n`;
      });
    }
    if (persona.reviewChecklist) {
      md += `## Code Review\n\n`;
      if (persona.reviewChecklist.redFlags?.length) {
        md += `**Red flags:**\n\n`;
        persona.reviewChecklist.redFlags.forEach((r: string) => {
          md += `- ${r}\n`;
        });
        md += `\n`;
      }
      if (persona.reviewChecklist.greenFlags?.length) {
        md += `**Green flags:**\n\n`;
        persona.reviewChecklist.greenFlags.forEach((g: string) => {
          md += `- ${g}\n`;
        });
        md += `\n`;
      }
    }
    return md.trim() + '\n';
  }

  return (
    <div style={{ display: 'flex', gap: 32 }}>
      <div style={{ minWidth: 220, maxWidth: 300, borderRight: '1px solid #e5e7eb', paddingRight: 16 }}>
        <h2 className="text-xl font-bold mb-3">Personas</h2>
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {sorted.map(persona => (
            <li
              key={persona.name}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                background: persona.name === selectedPersona?.name ? '#e0e7ff' : undefined,
                color: persona.name === selectedPersona?.name ? '#1d4ed8' : undefined,
                fontWeight: persona.name === selectedPersona?.name ? 600 : 400,
                cursor: 'pointer',
                marginBottom: 2
              }}
              onClick={() => setSelected(persona.name)}
            >
              {persona.name}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {selectedPersona ? (
          <div className="milkdown-editor-outer site-font">
            <MilkdownProvider>
              <MilkdownEditorWrapper
                content={personaToMarkdown(selectedPersona)}
                editable={false}
                crepeRef={crepeRef}
              />
            </MilkdownProvider>
          </div>
        ) : (
          <div className="text-gray-400">Select a persona to view details.</div>
        )}
      </div>
    </div>
  );
}

export default PersonasDirectoryView;
