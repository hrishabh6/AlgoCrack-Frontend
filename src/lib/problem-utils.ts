
export interface ProblemContent {
  description: string;
  examples: Array<{
    id: string;
    title: string;
    rawText?: string;
    text: string;
    inputText: string;
    outputText: string;
    explanation?: string;
    img?: string; // Potential future support
  }>;
  constraints: string[];
}

export function parseProblemDescription(content: string): ProblemContent {
  if (!content) {
    return { description: "", examples: [], constraints: [] };
  }

  // 1. Extract Constraints
  // Look for "Constraints:" at the start of a line or after a newline
  // Pattern: **Constraints:** or Constraints:
  const constraintsRegex = /(?:\*\*|__)?Constraints:(?:\*\*|__)?/i;
  const constraintsSplit = content.split(constraintsRegex);
  
  let mainContent = content;
  let constraintsBlock = "";

  if (constraintsSplit.length > 1) {
    // The last part is likely constraints
    mainContent = constraintsSplit[0];
    constraintsBlock = constraintsSplit.slice(1).join("Constraints:"); // rejoin if multiple (unlikely)
  }

  // Parse constraints lines
  // Usually bullet points: - point or * point or <li>
  // We'll clean up HTML tags if any and split by newlines that start with list markers
  const constraints = constraintsBlock
    .split(/\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.replace(/^(?:-|\*|<li>)\s*/, "").replace(/<\/li>$/, "").trim()) // Remove list markers
    .filter(line => line.length > 0);


  // 2. Extract Examples
  // Pattern: **Example \d:** or Example \d:
  const exampleRegex = /(?:\*\*|__)?Example \d+:(?:\*\*|__)?/gi;
  
  // Find all matches to get titles
  const titles = mainContent.match(exampleRegex) || [];
  
  // Split content by examples
  const parts = mainContent.split(exampleRegex);
  
  // The first part is the actual problem description
  const description = parts[0].trim();
  
  const examples: ProblemContent['examples'] = [];

  // Subsequent parts are example content
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i].trim();
    const title = titles[i - 1] ? titles[i - 1].replace(/[*_]/g, "").trim() : `Example ${i}`;
    
    // Extract Input, Output, Explanation
    // Pattern: **Input:** or Input:
    // We try to parsing these structured fields.
    // However, sometimes it's inline like `Input: ...`
    
    let inputText = "";
    let outputText = "";
    let explanation = "";
    
    // Simple parsing strategy:
    // Find "Input:", "Output:", "Explanation:"
    
    const inputMatch = part.match(/(?:\*\*|__)?Input:(?:\*\*|__)?\s*([\s\S]*?)(?=(?:\*\*|__)?Output:(?:\*\*|__)?|$)/i);
    const outputMatch = part.match(/(?:\*\*|__)?Output:(?:\*\*|__)?\s*([\s\S]*?)(?=(?:\*\*|__)?Explanation:(?:\*\*|__)?|$)/i);
    const explanationMatch = part.match(/(?:\*\*|__)?Explanation:(?:\*\*|__)?\s*([\s\S]*?)(?=$)/i);

    if (inputMatch) inputText = inputMatch[1].trim();
    if (outputMatch) outputText = outputMatch[1].trim();
    if (explanationMatch) explanation = explanationMatch[1].trim();

    // Fallback if structured parsing fails (e.g. compact format)
    // If we couldn't extract structure, we might just put the whole raw text in explanation or input?
    // But for now let's assume standard format
    
    // Cleaning up potential code blocks in input/output if desired, 
    // but often we want to keep them to render with markdown
    
    examples.push({
      id: `example-${i}`,
      title,
      text: part,
      inputText,
      outputText,
      explanation
    });
  }

  return {
    description,
    examples,
    constraints
  };
}
