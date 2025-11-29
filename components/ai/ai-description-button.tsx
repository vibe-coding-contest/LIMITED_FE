"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { useAI } from "@/hooks/use-ai"
import { useToast } from "@/hooks/use-toast"

interface AIDescriptionButtonProps {
  title: string
  context?: string
  onDescriptionGenerated: (description: string) => void
  disabled?: boolean
}

export function AIDescriptionButton({
  title,
  context,
  onDescriptionGenerated,
  disabled,
}: AIDescriptionButtonProps) {
  const { generateDescription, isGenerating } = useAI()
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title before generating a description.",
        variant: "destructive",
      })
      return
    }

    try {
      const description = await generateDescription({ title, context })
      onDescriptionGenerated(description)

      toast({
        title: "Description generated",
        description: "AI has generated a description for your issue.",
      })
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate description. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleGenerate}
      disabled={disabled || isGenerating || !title.trim()}
      className="gap-2"
    >
      <Sparkles className="h-4 w-4" />
      {isGenerating ? "Generating..." : "Generate with AI"}
    </Button>
  )
}
