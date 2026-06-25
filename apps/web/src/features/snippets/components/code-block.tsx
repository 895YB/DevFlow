import { useEffect, useRef, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-dart';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-graphql';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-powershell';
import 'prismjs/components/prism-docker';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language: string;
  className?: string;
}

const LANGUAGE_MAP: Record<string, string> = {
  csharp: 'csharp',
  cpp: 'cpp',
  plaintext: 'plain',
};

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  const prismLang = LANGUAGE_MAP[language] ?? language;

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('group relative rounded-lg border border-border bg-muted/30', className)}>
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="text-xs font-medium text-muted-foreground">{language}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm">
        <code ref={codeRef} className={`language-${prismLang}`}>
          {code}
        </code>
      </pre>
    </div>
  );
}
