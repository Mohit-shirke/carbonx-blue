'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function ProgressBar() {
  const pathname  = usePathname()
  const [prog, setProg] = useState(0)
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true); setProg(30)
    const t1 = setTimeout(() => setProg(70),  100)
    const t2 = setTimeout(() => setProg(100), 300)
    const t3 = setTimeout(() => { setShow(false); setProg(0) }, 600)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [pathname])

  if (!show) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[999] h-0.5 bg-transparent">
      <div
        className="h-full bg-primary-500 transition-all duration-300 ease-out"
        style={{ width:`${prog}%` }}/>
    </div>
  )
}
