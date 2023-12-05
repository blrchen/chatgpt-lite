import { CSSProperties, ReactNode } from 'react'

/**
 * @title Spin
 */
export interface SpinProps {
  style?: CSSProperties
  className?: string | string[]
  children?: ReactNode
  /**
   * Whether is loading status (Only works when `Spin` has children))
   */
  loading?: boolean
  /**
   * The size of loading icon
   */
  size?: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  /**
   * Customize icon which will be rotated automatically.
   */
  icon?: ReactNode
  /**
   * Customize element which won't be rotated automatically, such as image/gif.
   */
  element?: ReactNode
  /**
   * Customize description content when Spin has children
   */
  tip?: string | ReactNode
  /**
   * Specifies a delay(ms) for loading state
   */
  delay?: number
  /**
   *  Whether to use dot type animation
   */
  dot?: boolean
  /**
   * @en Whether it is a block-level element
   */
  block?: boolean
}
