"use client"

/**
 * SubtaskList Component
 *
 * Manages subtasks for an issue
 * - Add new subtasks
 * - Toggle subtask completion
 * - Delete subtasks
 * - Progress indicator
 */

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

interface Subtask {
  id: string
  title: string
  completed: boolean
  order: number
}

interface SubtaskListProps {
  issueId: string
  initialSubtasks?: Subtask[]
}

export function SubtaskList({ issueId, initialSubtasks = [] }: SubtaskListProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialSubtasks)
  const [newSubtask, setNewSubtask] = useState("")
  const [loading, setLoading] = useState(false)

  const completedCount = subtasks.filter((s) => s.completed).length
  const totalCount = subtasks.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtask.trim()) return

    try {
      setLoading(true)

      // In a real implementation, this would call a Supabase function
      // For now, we'll just add it to local state
      const newTask: Subtask = {
        id: `temp-${Date.now()}`,
        title: newSubtask.trim(),
        completed: false,
        order: subtasks.length,
      }

      setSubtasks([...subtasks, newTask])
      setNewSubtask("")
    } catch (error) {
      console.error("Failed to add subtask:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSubtask = async (id: string) => {
    try {
      setSubtasks(
        subtasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      )
    } catch (error) {
      console.error("Failed to toggle subtask:", error)
    }
  }

  const handleDeleteSubtask = async (id: string) => {
    try {
      setSubtasks(subtasks.filter((task) => task.id !== id))
    } catch (error) {
      console.error("Failed to delete subtask:", error)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Subtasks</h3>
        {totalCount > 0 && (
          <span className="text-sm text-gray-600">
            {completedCount} of {totalCount} completed
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="mb-4">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Add Subtask Form */}
      <form onSubmit={handleAddSubtask} className="mb-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Add a subtask..."
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !newSubtask.trim()}>
            {loading ? <Spinner size="sm" /> : "Add"}
          </Button>
        </div>
      </form>

      {/* Subtask List */}
      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors group"
          >
            {/* Checkbox */}
            <button
              onClick={() => handleToggleSubtask(subtask.id)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                subtask.completed
                  ? "bg-green-500 border-green-500"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              aria-label={subtask.completed ? "Mark as incomplete" : "Mark as complete"}
            >
              {subtask.completed && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="white"
                  className="w-3 h-3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              )}
            </button>

            {/* Title */}
            <span
              className={`flex-1 text-sm ${
                subtask.completed
                  ? "line-through text-gray-500"
                  : "text-gray-900"
              }`}
            >
              {subtask.title}
            </span>

            {/* Delete Button */}
            <button
              onClick={() => handleDeleteSubtask(subtask.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600"
              aria-label="Delete subtask"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {subtasks.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No subtasks yet. Add one above to get started.
        </div>
      )}
    </Card>
  )
}
