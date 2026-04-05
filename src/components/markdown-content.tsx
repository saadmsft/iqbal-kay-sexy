"use client";

import React from "react";

/**
 * Renders a markdown string as styled HTML.
 * Supports: headings (##), bold (**), italic (*), inline code (`),
 * bullet lists (- ), numbered lists (1. ), and line breaks.
 */
export function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let listType: "ul" | "ol" | null = null;

  const flushList = () => {
    if (listItems.length > 0 && listType) {
      const Tag = listType;
      elements.push(
        <Tag
          key={`list-${elements.length}`}
          className={
            listType === "ul"
              ? "list-disc list-inside space-y-1 ml-1"
              : "list-decimal list-inside space-y-1 ml-1"
          }
        >
          {listItems}
        </Tag>
      );
      listItems = [];
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines
    if (line.trim() === "") {
      flushList();
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,3})\s+(.*)/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const className =
        level === 1
          ? "text-base font-bold text-foreground mt-4 mb-1.5"
          : level === 2
          ? "text-sm font-semibold text-foreground mt-3 mb-1"
          : "text-sm font-medium text-foreground mt-2 mb-0.5";
      elements.push(
        <p key={i} className={className}>
          {renderInline(text)}
        </p>
      );
      continue;
    }

    // Unordered list items (- or * )
    const ulMatch = line.match(/^\s*[-*]\s+(.*)/);
    if (ulMatch) {
      if (listType !== "ul") {
        flushList();
        listType = "ul";
      }
      listItems.push(<li key={i}>{renderInline(ulMatch[1])}</li>);
      continue;
    }

    // Ordered list items (1. 2. etc.)
    const olMatch = line.match(/^\s*\d+\.\s+(.*)/);
    if (olMatch) {
      if (listType !== "ol") {
        flushList();
        listType = "ol";
      }
      listItems.push(<li key={i}>{renderInline(olMatch[1])}</li>);
      continue;
    }

    // Normal paragraph
    flushList();
    elements.push(
      <p key={i} className="mb-1">
        {renderInline(line)}
      </p>
    );
  }

  flushList();

  return <div className="space-y-1">{elements}</div>;
}

/** Parse inline markdown: **bold**, *italic*, `code` */
function renderInline(text: string): React.ReactNode {
  // Split by markdown patterns and render spans
  const parts: React.ReactNode[] = [];
  // Regex to find **bold**, *italic*, and `code`
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // **bold**
      parts.push(
        <strong key={match.index} className="font-semibold text-foreground">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // *italic*
      parts.push(
        <em key={match.index} className="italic">
          {match[3]}
        </em>
      );
    } else if (match[4]) {
      // `code`
      parts.push(
        <code
          key={match.index}
          className="rounded bg-accent/50 px-1 py-0.5 text-xs font-mono text-primary"
        >
          {match[4]}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : parts;
}
