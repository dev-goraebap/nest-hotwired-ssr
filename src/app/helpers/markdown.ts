import { readFileSync } from 'fs';
import { marked } from 'marked';
import { join } from 'path';

export function getMarkdownHtml(filename: string) {
  const markdown = readFileSync(
    join(process.cwd(), filename + '.md'),
    'utf-8',
  );
  return marked.parse(markdown);
}
