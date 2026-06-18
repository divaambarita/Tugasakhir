import React, { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const CustomButton = forwardRef(
  (
    { className, variant, size, asChild = false, isLoading = false, ...props },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        className={className}
        variant={variant}
        size={size}
        disabled={isLoading}
        asChild={asChild}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {isLoading ? 'Loading' : props.children}
      </Button>
    )
  }
)

CustomButton.displayName = 'CustomButton'

export default CustomButton