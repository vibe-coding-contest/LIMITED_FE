/**
 * SimpleChart Component
 *
 * CSS-based chart visualization without external libraries
 * Supports bar charts and progress indicators
 */

import React from "react"

interface ChartData {
  label: string
  value: number
  color?: string
}

interface SimpleChartProps {
  data: ChartData[]
  type?: "bar" | "progress"
  maxValue?: number
  height?: number
  className?: string
}

export function SimpleChart({
  data,
  type = "bar",
  maxValue,
  height = 200,
  className = "",
}: SimpleChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value))

  if (type === "progress") {
    return (
      <div className={`space-y-4 ${className}`}>
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">{item.label}</span>
              <span className="text-gray-500">{item.value}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(item.value / max) * 100}%`,
                  backgroundColor: item.color || "#3b82f6",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div
        className="flex items-end justify-between gap-2"
        style={{ height: `${height}px` }}
      >
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="flex-1 flex items-end w-full">
              <div
                className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80"
                style={{
                  height: `${(item.value / max) * 100}%`,
                  backgroundColor: item.color || "#3b82f6",
                  minHeight: item.value > 0 ? "4px" : "0px",
                }}
                title={`${item.label}: ${item.value}`}
              />
            </div>
            <div className="text-xs text-gray-600 text-center truncate w-full">
              {item.label}
            </div>
            <div className="text-sm font-medium text-gray-900">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface PieChartProps {
  data: ChartData[]
  size?: number
  className?: string
}

export function SimplePieChart({
  data,
  size = 120,
  className = "",
}: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let currentAngle = 0

  const segments = data.map((item) => {
    const percentage = (item.value / total) * 100
    const angle = (item.value / total) * 360
    const segment = {
      ...item,
      percentage,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
    }
    currentAngle += angle
    return segment
  })

  return (
    <div className={`flex items-center gap-6 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100">
          {segments.map((segment, index) => {
            const largeArcFlag = segment.percentage > 50 ? 1 : 0
            const startX =
              50 + 50 * Math.cos((segment.startAngle * Math.PI) / 180)
            const startY =
              50 + 50 * Math.sin((segment.startAngle * Math.PI) / 180)
            const endX = 50 + 50 * Math.cos((segment.endAngle * Math.PI) / 180)
            const endY = 50 + 50 * Math.sin((segment.endAngle * Math.PI) / 180)

            const pathData = [
              `M 50 50`,
              `L ${startX} ${startY}`,
              `A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              `Z`,
            ].join(" ")

            return (
              <path
                key={index}
                d={pathData}
                fill={segment.color || `hsl(${index * 60}, 70%, 50%)`}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              >
                <title>{`${segment.label}: ${segment.value} (${segment.percentage.toFixed(1)}%)`}</title>
              </path>
            )
          })}
        </svg>
      </div>

      <div className="flex-1 space-y-2">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor:
                  segment.color || `hsl(${index * 60}, 70%, 50%)`,
              }}
            />
            <span className="text-sm text-gray-700 flex-1">
              {segment.label}
            </span>
            <span className="text-sm font-medium text-gray-900">
              {segment.value}
            </span>
            <span className="text-xs text-gray-500">
              ({segment.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
