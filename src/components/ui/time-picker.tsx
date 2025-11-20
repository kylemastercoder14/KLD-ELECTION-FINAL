"use client";

import { Clock8Icon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ComponentProps } from "react";

interface TimePickerProps extends ComponentProps<"input"> {
  icon?: React.ReactNode;
}

export const TimePicker = ({
  icon = <Clock8Icon className="size-4" />,
  id = "time-picker",
  value,
  onChange,
  disabled,
  defaultValue,
  step = "1",
  className,
  ...props
}: TimePickerProps) => {
  return (
    <div className="w-full max-w-xs space-y-2">
      <div className="relative">
        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
          {icon}
        </div>

        <Input
          type="time"
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          defaultValue={defaultValue}
          step={step}
          className={`peer bg-background appearance-none pl-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};
