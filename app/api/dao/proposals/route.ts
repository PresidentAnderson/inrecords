import { NextRequest, NextResponse } from 'next/server';
import { proposalCreateSchema, proposalFilterSchema } from '@/lib/schemas/dao';
import {
  createProposal,
  getProposals,
  submitProposal,
  startVoting,
} from '@/lib/supabase/dao';
import { notifyNewProposal } from '@/lib/discord/notifications';

/**
 * POST /api/dao/proposals
 * Create a new proposal
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = proposalCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const proposalData = validationResult.data;

    // Create proposal in database
    const proposal = await createProposal(proposalData);

    // Submit proposal for voting (skips draft state for now)
    const submittedProposal = await submitProposal(proposal.id, proposalData.createdBy);

    // Send Discord notification
    try {
      await notifyNewProposal(submittedProposal);
    } catch (discordError) {
      console.error('Failed to send Discord notification:', discordError);
      // Don't fail the request if Discord notification fails
    }

    return NextResponse.json(
      {
        success: true,
        proposal: submittedProposal,
        message: 'Proposal created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating proposal:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create proposal' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/dao/proposals
 * Get list of proposals with filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const filters = {
      status: searchParams.get('status') || undefined,
      proposalType: searchParams.get('proposalType') || undefined,
      createdBy: searchParams.get('createdBy') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') || 'newest',
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
    };

    // Validate filters
    const validationResult = proposalFilterSchema.safeParse(filters);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid filters', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Get proposals from database
    const result = await getProposals(validationResult.data);

    return NextResponse.json({
      success: true,
      proposals: result.proposals,
      total: result.total,
      limit: validationResult.data.limit,
      offset: validationResult.data.offset,
    });
  } catch (error: any) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch proposals' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/dao/proposals
 * Update proposal status (admin functions)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { proposalId, action } = body;

    if (!proposalId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: proposalId, action' },
        { status: 400 }
      );
    }

    // Handle different actions
    switch (action) {
      case 'start_voting':
        const activeProposal = await startVoting(proposalId);
        return NextResponse.json({
          success: true,
          proposal: activeProposal,
          message: 'Voting started successfully',
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Error updating proposal:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update proposal' },
      { status: 500 }
    );
  }
}
