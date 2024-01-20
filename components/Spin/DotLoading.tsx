import React, { CSSProperties } from 'react'
import { isNumber } from 'lodash-es'

export interface DotProps {
  size?: CSSProperties['fontSize']
}

export default function DotLoading(props: DotProps) {
  const dotStyle = {
    width: props.size,
    height: props.size
  }

  const sizeNumber = props.size ? parseInt(String(props.size)) : 0

  return (
    <div
      className="spin-dot-list "
      style={{
        height: props.size,
        width: isNumber(sizeNumber) && sizeNumber > 0 ? sizeNumber * 7 : ''
      }}
    >
      {[...new Array(5)].map((_, index) => {
        return <div key={index} className="spin-dot-list " style={dotStyle} />
      })}
    </div>
  )
}
