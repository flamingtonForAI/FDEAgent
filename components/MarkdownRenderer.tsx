import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

// Parse inline markdown: bold, italic, inline code, links
function parseInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Pattern: **bold**, *italic*, `code`, [text](url)
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // Add preceding text
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // **bold**
      nodes.push(<strong key={key++} className="md-bold">{match[2]}</strong>);
    } else if (match[3]) {
      // *italic*
      nodes.push(<em key={key++} className="md-italic">{match[4]}</em>);
    } else if (match[5]) {
      // `inline code`
      nodes.push(<code key={key++} className="md-inline-code">{match[6]}</code>);
    } else if (match[7]) {
      // [text](url) — only allow safe protocols
      const href = match[9];
      const isSafe = /^https?:\/\//i.test(href) || /^mailto:/i.test(href);
      if (isSafe) {
        nodes.push(
          <a key={key++} className="md-link" href={href} target="_blank" rel="noopener noreferrer">
            {match[8]}
          </a>
        );
      } else {
        nodes.push(<span key={key++}>{match[8]}</span>);
      }
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.trimStart().startsWith('```')) {
      const lang = line.trimStart().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push(
        <pre key={key++} className="md-code-block">
          <code data-lang={lang || undefined}>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3;
      const Tag = `h${level}` as const;
      blocks.push(
        <Tag key={key++} className={`md-h${level}`}>
          {parseInline(headingMatch[2])}
        </Tag>
      );
      i++;
      continue;
    }

    // Unordered list
    if (/^[\s]*[-*]\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[\s]*[-*]\s+/.test(lines[i])) {
        const itemText = lines[i].replace(/^[\s]*[-*]\s+/, '');
        items.push(<li key={items.length}>{parseInline(itemText)}</li>);
        i++;
      }
      blocks.push(<ul key={key++} className="md-ul">{items}</ul>);
      continue;
    }

    // Ordered list
    if (/^[\s]*\d+\.\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[\s]*\d+\.\s+/.test(lines[i])) {
        const itemText = lines[i].replace(/^[\s]*\d+\.\s+/, '');
        items.push(<li key={items.length}>{parseInline(itemText)}</li>);
        i++;
      }
      blocks.push(<ol key={key++} className="md-ol">{items}</ol>);
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph — collect consecutive non-empty, non-special lines
    const paraLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trimStart().startsWith('```') &&
      !/^#{1,3}\s+/.test(lines[i]) &&
      !/^[\s]*[-*]\s+/.test(lines[i]) &&
      !/^[\s]*\d+\.\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key++} className="md-p">{parseInline(paraLines.join('\n'))}</p>
    );
  }

  return <div className="markdown-content">{blocks}</div>;
}
