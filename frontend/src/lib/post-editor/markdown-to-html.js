import { escapeHtml } from '@/lib/post-editor/rich-text-utils';

function formatInlineMarkdown(text) {
  let escaped = escapeHtml(text);
  escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
  escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return escaped;
}

function parseInlineNodes(text) {
  if (!text) return [];
  const nodes = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({ type: 'text', text: text.slice(lastIndex, match.index) });
    }
    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push({ type: 'text', text: token.slice(1, -1), marks: [{ type: 'code' }] });
    } else if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push({ type: 'text', text: token.slice(2, -2), marks: [{ type: 'bold' }] });
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push({ type: 'text', text: text.slice(lastIndex) });
  }

  return nodes;
}

function parseTableBlock(lines) {
  if (lines.length < 2) return null;
  const parseRow = (row) =>
    row
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => cell.trim());

  const headers = parseRow(lines[0]);
  const separator = parseRow(lines[1]);
  if (headers.length === 0 || !separator.every((cell) => /^:?-{2,}:?$/.test(cell))) {
    return null;
  }

  const headHtml = `<thead><tr>${headers.map((h) => `<th>${formatInlineMarkdown(h)}</th>`).join('')}</tr></thead>`;
  const bodyRows = lines.slice(2).map((line) => {
    const cells = parseRow(line);
    return `<tr>${headers.map((_, i) => `<td>${formatInlineMarkdown(cells[i] ?? '')}</td>`).join('')}</tr>`;
  });
  const bodyHtml = bodyRows.length > 0 ? `<tbody>${bodyRows.join('')}</tbody>` : '';
  return `<table>${headHtml}${bodyHtml}</table>`;
}

function parseTableNodes(lines) {
  if (lines.length < 2) return null;
  const parseRow = (row) =>
    row
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => cell.trim());

  const headers = parseRow(lines[0]);
  const separator = parseRow(lines[1]);
  if (headers.length === 0 || !separator.every((cell) => /^:?-{2,}:?$/.test(cell))) {
    return null;
  }

  const makeCell = (cellType, text) => ({
    type: cellType,
    content: [{ type: 'paragraph', content: parseInlineNodes(text) }],
  });

  const rows = [
    { type: 'tableRow', content: headers.map((h) => makeCell('tableHeader', h)) },
    ...lines.slice(2).map((line) => {
      const cells = parseRow(line);
      return { type: 'tableRow', content: headers.map((_, i) => makeCell('tableCell', cells[i] ?? '')) };
    }),
  ];

  return { type: 'table', content: rows };
}

/**
 * AI가 제안한 마크다운 문자열에 코드 블록, Mermaid, 수식 블록, 표, 제목 등이 포함된 경우
 * Tiptap JSON 노드 배열로 변환해 에디터가 즉시 CodeBlockNodeView/MathBlock 등으로 렌더링하게 한다.
 * 단순 평문(블록 문법 없음)이면 null을 반환한다.
 *
 * @param {string} markdown AI 응답 마크다운
 * @returns {object[] | null} Tiptap JSON 노드 배열 또는 null
 */
export function markdownToTiptapContent(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return null;
  }

  const hasBlockSyntax = /(^|\n)\s*(```|\$\$|#{1,3}\s|\|.*\|)/m.test(markdown);
  if (!hasBlockSyntax) {
    return null;
  }

  const normalized = markdown.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  const nodes = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // 1. 코드 펜스 (```lang ... ```)
    const fenceMatch = trimmedLine.match(/^```([a-zA-Z0-9_+-]*)\s*$/);
    if (fenceMatch) {
      const lang = (fenceMatch[1] || 'plaintext').toLowerCase();
      i += 1;
      const codeLines = [];
      while (i < lines.length && !/^```\s*$/.test(lines[i].trim())) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      const codeText = codeLines.join('\n');
      nodes.push({
        type: 'codeBlock',
        attrs: { language: lang },
        content: codeText ? [{ type: 'text', text: codeText }] : [],
      });
      continue;
    }

    // 2. 독립 수식 블록 ($$ ... $$)
    if (trimmedLine.startsWith('$$')) {
      const singleLineMatch = trimmedLine.match(/^\$\$(.+)\$\$$/);
      if (singleLineMatch) {
        const latex = singleLineMatch[1].trim();
        nodes.push({
          type: 'mathBlock',
          content: latex ? [{ type: 'text', text: latex }] : [],
        });
        i += 1;
        continue;
      }
      i += 1;
      const mathLines = [];
      while (i < lines.length && !lines[i].trim().startsWith('$$')) {
        mathLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      const latex = mathLines.join('\n').trim();
      nodes.push({
        type: 'mathBlock',
        content: latex ? [{ type: 'text', text: latex }] : [],
      });
      continue;
    }

    // 3. 마크다운 표
    if (trimmedLine.startsWith('|') && i + 1 < lines.length && lines[i + 1].trim().startsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i += 1;
      }
      const tableNode = parseTableNodes(tableLines);
      if (tableNode) {
        nodes.push(tableNode);
        continue;
      }
      tableLines.forEach((row) => {
        nodes.push({ type: 'paragraph', content: parseInlineNodes(row) });
      });
      continue;
    }

    // 4. 제목 (#, ##, ###)
    const headingMatch = trimmedLine.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      nodes.push({
        type: 'heading',
        attrs: { level: headingMatch[1].length },
        content: parseInlineNodes(headingMatch[2].trim()),
      });
      i += 1;
      continue;
    }

    // 5. 빈 줄 건너뛰기
    if (!trimmedLine) {
      i += 1;
      continue;
    }

    // 6. 일반 문단
    nodes.push({ type: 'paragraph', content: parseInlineNodes(line) });
    i += 1;
  }

  return nodes.length > 0 ? nodes : null;
}

/**
 * AI가 제안한 마크다운 문자열에 코드 블록, Mermaid, 수식 블록, 표, 제목 등이 포함된 경우
 * Tiptap 에디터가 노드로 인식할 수 있는 HTML로 변환한다.
 * 단순 평문(블록 문법 없음)이면 null을 반환한다.
 *
 * @param {string} markdown AI 응답 마크다운
 * @returns {string | null} 변환된 HTML 또는 null
 */
export function markdownToTiptapHtml(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return null;
  }

  const hasBlockSyntax = /(^|\n)(```|\$\$|#{1,3}\s|\|.*\|)/m.test(markdown);
  if (!hasBlockSyntax) {
    return null;
  }

  const normalized = markdown.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  const htmlParts = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 1. 코드 펜스 (```lang ... ```)
    const fenceMatch = line.match(/^```([a-zA-Z0-9_+-]*)\s*$/);
    if (fenceMatch) {
      const lang = (fenceMatch[1] || 'plaintext').toLowerCase();
      i += 1;
      const codeLines = [];
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      htmlParts.push(
        `<pre><code class="language-${escapeHtml(lang)}">${escapeHtml(codeLines.join('\n'))}</code></pre>`,
      );
      continue;
    }

    // 2. 독립 수식 블록 ($$ ... $$)
    if (line.trim().startsWith('$$')) {
      const singleLineMatch = line.trim().match(/^\$\$(.+)\$\$$/);
      if (singleLineMatch) {
        htmlParts.push(
          `<div data-type="math-block"><pre><code>${escapeHtml(singleLineMatch[1].trim())}</code></pre></div>`,
        );
        i += 1;
        continue;
      }
      i += 1;
      const mathLines = [];
      while (i < lines.length && !lines[i].trim().startsWith('$$')) {
        mathLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      htmlParts.push(
        `<div data-type="math-block"><pre><code>${escapeHtml(mathLines.join('\n').trim())}</code></pre></div>`,
      );
      continue;
    }

    // 3. 마크다운 표
    if (line.trim().startsWith('|') && i + 1 < lines.length && lines[i + 1].trim().startsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i += 1;
      }
      const tableHtml = parseTableBlock(tableLines);
      if (tableHtml) {
        htmlParts.push(tableHtml);
        continue;
      }
      tableLines.forEach((row) => htmlParts.push(`<p>${formatInlineMarkdown(row)}</p>`));
      continue;
    }

    // 4. 제목 (#, ##, ###)
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      htmlParts.push(`<h${level}>${formatInlineMarkdown(headingMatch[2].trim())}</h${level}>`);
      i += 1;
      continue;
    }

    // 5. 빈 줄 건너뛰기
    if (!line.trim()) {
      i += 1;
      continue;
    }

    // 6. 일반 문단
    htmlParts.push(`<p>${formatInlineMarkdown(line)}</p>`);
    i += 1;
  }

  return htmlParts.length > 0 ? htmlParts.join('') : null;
}
