'use client'

import React, { ReactElement, useCallback, useEffect, useState } from 'react'
import { Text } from '@radix-ui/themes'
import cs from 'classnames'
import { debounce } from 'lodash-es'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import DotLoading from './DotLoading'
import { SpinProps } from './interface'
import './index.scss'

export function isEmptyReactNode(node: any): boolean {
  return !node && (node === null || node === undefined || node === '' || node === false)
}

const Spin = (props: SpinProps, ref: any) => {
  const {
    style,
    className,
    children,
    loading: propLoading = true,
    size = '4',
    icon,
    element,
    tip,
    dot,
    delay,
    block = false,
    ...rest
  } = props

  const [loading, setLoading] = useState<boolean>(delay ? false : propLoading)
  const debouncedSetLoading = useCallback(debounce(setLoading, delay), [delay])

  const _usedLoading = delay ? loading : propLoading

  useEffect(() => {
    delay && debouncedSetLoading(propLoading)
    return () => {
      debouncedSetLoading && debouncedSetLoading.cancel()
    }
  }, [debouncedSetLoading, delay, propLoading])

  const loadingIcon = (
    <span className="" style={{ color: 'var(--accent-9)' }}>
      {icon
        ? React.cloneElement(icon as ReactElement, {
            style: {
              fontSize: size
            }
          })
        : element ||
          (dot ? (
            <DotLoading size={size} />
          ) : (
            <Text size={size}>
              <AiOutlineLoading3Quarters className="animate-spin" />
            </Text>
          ))}
    </span>
  )

  return (
    <div
      ref={ref}
      className={cs(
        {
          block,
          'inline-block': !block,
          'spin-loading': _usedLoading,
          'text-center': tip && !children
        },
        className
      )}
      style={style}
      {...rest}
    >
      {isEmptyReactNode(children) ? (
        <>
          {loadingIcon}
          {tip ? (
            <Text as="div" mt="2" weight="medium" size="4" style={{ color: 'var(--accent-9)' }}>
              {tip}
            </Text>
          ) : null}
        </>
      ) : (
        <>
          <div className="relative spin-chidren">{children}</div>
          {_usedLoading && (
            <div className="spin-loading-layer" style={{ fontSize: size }}>
              <span className="spin-loading-layer-inner">
                {loadingIcon}
                {tip ? (
                  <Text
                    as="div"
                    mt="2"
                    weight="medium"
                    size="4"
                    style={{ color: 'var(--accent-9)' }}
                  >
                    {tip}
                  </Text>
                ) : null}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const SpinComponent = React.forwardRef<unknown, SpinProps>(Spin)

SpinComponent.displayName = 'Spin'

export default SpinComponent
