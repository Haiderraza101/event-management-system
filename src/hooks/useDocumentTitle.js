import { useEffect } from 'react'

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Eventide` : 'Eventide'
  }, [title])
}

export default useDocumentTitle
