import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface TemplatePreviewProps {
  template: string;
}

function TemplatePreview({ template }: TemplatePreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(template).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div>
      <div className="template-preview">
        <ReactMarkdown>{template}</ReactMarkdown>
      </div>

      <button className="btn btn-primary copy-button" onClick={handleCopy}>
        {copied ? '✓ Copied to Clipboard!' : '📋 Copy Template'}
      </button>
    </div>
  );
}

export default TemplatePreview;
