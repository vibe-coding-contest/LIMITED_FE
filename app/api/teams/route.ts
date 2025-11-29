import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Teams API
 *
 * POST /api/teams - Create a new team
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/teams', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'Authorization': 'Bearer {access_token}'
 *   },
 *   body: JSON.stringify({
 *     name: '팀 이름',
 *     description: '팀 설명' // optional
 *   })
 * })
 * const data = await response.json()
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid or missing access token" },
        { status: 401 }
      )
    }

    // Parse request body
    const { name, description } = await request.json()

    // Validate required fields
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Team name is required and must be a string" },
        { status: 400 }
      )
    }

    // Validate name length
    if (name.length < 2 || name.length > 50) {
      return NextResponse.json(
        { error: "Team name must be between 2 and 50 characters" },
        { status: 400 }
      )
    }

    // Validate description length if provided
    if (description && typeof description === "string" && description.length > 500) {
      return NextResponse.json(
        { error: "Description must not exceed 500 characters" },
        { status: 400 }
      )
    }

    // Create team
    const { data: team, error: createError } = await supabase
      .from("teams")
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        owner_id: user.id,
      })
      .select()
      .single()

    if (createError) {
      console.error("Team creation error:", createError)
      return NextResponse.json(
        { error: "Failed to create team", details: createError.message },
        { status: 500 }
      )
    }

    // Add creator as team owner
    const { error: memberError } = await supabase
      .from("team_members")
      .insert({
        team_id: team.id,
        user_id: user.id,
        role: "owner",
      })

    if (memberError) {
      console.error("Team member creation error:", memberError)
      // Rollback team creation if adding member fails
      await supabase.from("teams").delete().eq("id", team.id)

      return NextResponse.json(
        { error: "Failed to add team owner", details: memberError.message },
        { status: 500 }
      )
    }

    // Return created team with role
    return NextResponse.json(
      {
        ...team,
        role: "owner",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Unexpected error in team creation:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
