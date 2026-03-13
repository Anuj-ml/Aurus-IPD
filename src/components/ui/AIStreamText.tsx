interface AIStreamTextProps {
  text: string;
  isStreaming: boolean;
  placeholder?: string;
}

export default function AIStreamText({ text, isStreaming, placeholder }: AIStreamTextProps) {
  if (!text && !isStreaming) {
    return (
      <div 
        className="p-4 rounded-r text-sm leading-relaxed italic border-l-[3px] border-transparent"
        style={{ color: 'var(--text-3)' }}
      >
        {placeholder || 'Waiting for AI response...'}
      </div>
    );
  }

  return (
    <div 
      className="p-4 rounded-r text-sm leading-relaxed"
      style={{ 
        backgroundColor: 'var(--surface-2)', 
        borderLeft: '3px solid var(--accent)',
        color: 'var(--text-1)'
      }}
    >
      <span className="whitespace-pre-wrap">{text}</span>
      {isStreaming && (
        <span 
          className="inline-block w-[4px] h-[1em] ml-1 align-middle animate-pulse"
          style={{ backgroundColor: 'var(--accent)' }}
        />
      )}
    </div>
  );
}
