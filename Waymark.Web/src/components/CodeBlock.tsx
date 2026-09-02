export type CodeExample = {
  label: string
  language: string
  code: string
}

export function CodeBlock({ example }: { example: CodeExample }) {
  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-block-label">{example.label}</span>
        <span className="code-block-lang">{example.language}</span>
      </div>
      <pre>
        <code>{example.code}</code>
      </pre>
    </div>
  )
}
