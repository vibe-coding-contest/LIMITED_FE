import { NextRequest, NextResponse } from "next/server"

/**
 * AI Description Generation API
 *
 * Generates structured issue descriptions using AI based on the title
 * and optional context provided.
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/ai/generate-description', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     title: 'Add user authentication',
 *     context: 'Using NextAuth.js with Google provider'
 *   })
 * })
 * const data = await response.json()
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    const { title, context } = await request.json()

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    // TODO: Replace with actual AI integration (OpenAI, Anthropic, etc.)
    // For now, generate a template-based description
    const description = generateTemplateDescription(title, context)

    return NextResponse.json({
      description,
      success: true,
    })
  } catch (error) {
    console.error("AI generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate description" },
      { status: 500 }
    )
  }
}

/**
 * Template-based description generator
 * Replace this with actual AI integration when available
 */
function generateTemplateDescription(title: string, context?: string): string {
  const sections = []

  // Overview
  sections.push("## Overview")
  sections.push(`This issue tracks the implementation of: ${title}`)
  if (context) {
    sections.push(`\n**Context:** ${context}`)
  }

  // Acceptance Criteria
  sections.push("\n## Acceptance Criteria")
  sections.push("- [ ] Feature is implemented according to specifications")
  sections.push("- [ ] Unit tests are written and passing")
  sections.push("- [ ] Documentation is updated")
  sections.push("- [ ] Code review is completed")

  // Technical Details
  sections.push("\n## Technical Details")
  sections.push("*To be filled in during implementation*")

  // Tasks
  sections.push("\n## Tasks")
  sections.push("- [ ] Research and design")
  sections.push("- [ ] Implementation")
  sections.push("- [ ] Testing")
  sections.push("- [ ] Documentation")

  return sections.join("\n")
}

/**
 * Example AI integration with OpenAI (commented out)
 *
 * Uncomment and configure when ready to use actual AI
 */
/*
async function generateAIDescription(
  title: string,
  context?: string
): Promise<string> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const prompt = `Generate a detailed issue description for a software project.

Title: ${title}
${context ? `Context: ${context}` : ""}

Please provide a structured description with the following sections:
1. Overview - Brief summary of what needs to be done
2. Acceptance Criteria - Specific, testable requirements
3. Technical Details - Any relevant technical considerations
4. Tasks - Step-by-step breakdown

Format the response in Markdown.`

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that generates clear, structured issue descriptions for software development projects.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  })

  return completion.choices[0]?.message?.content || ""
}
*/
