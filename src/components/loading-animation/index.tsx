import lottie from 'lottie-web'
import * as React from 'react'

export type LoadingState = 'loading' | 'completed' | 'error'
// export type LoadingAnimationColor = 'default' | 'red'
interface IProps {
  currentState: LoadingState
  // color?: LoadingAnimationColor
  className?: string
}
export const LoadingAnimation: React.FC<IProps> = ({
  currentState,
  // color = 'default',
  className,
}) => {
  const container = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const animations: Record<LoadingState, string> = {
      loading: '/assets/loading-animation.json',
      completed: '/assets/check-animation.json',
      error: '/assets/cross-animation.json',
    }

    if (!container.current) return
    if (typeof window === 'undefined') return

    const animationPlayer = lottie.loadAnimation({
      container: container.current,
      renderer: 'svg',
      autoplay: true,
      loop: currentState === 'loading',
      path: animations[currentState],
    })

    return () => {
      animationPlayer.destroy()
    }
  }, [container, currentState])

  if (className) {
    return <div ref={container} className={className} />
  }

  return <div ref={container} />
}
