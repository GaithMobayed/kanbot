import { Search } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  'aria-label'?: string
  containerClassName?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  'aria-label': ariaLabel,
  containerClassName = '',
}: SearchInputProps) {
  return (
    <div className={['relative', containerClassName].join(' ')}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={[
          'h-input w-full rounded-md border border-border bg-surface pl-9 pr-3',
          'font-sans text-body text-text-primary placeholder:text-text-secondary',
          'focus:border-primary focus:outline-none',
        ].join(' ')}
      />
    </div>
  )
}
