import { NextRequest, NextResponse } from 'next/server';
import { voteSchema } from '@/lib/schemas/dao';
import { castVote, canMemberVote, getVote } from '@/lib/supabase/dao';

/**
 * POST /api/dao/vote
 * Cast a vote on a proposal
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = voteSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const voteData = validationResult.data;

    // Check if member can vote
    const canVote = await canMemberVote(voteData.voterWallet, voteData.proposalId);
    if (!canVote) {
      return NextResponse.json(
        {
          error: 'You are not eligible to vote on this proposal',
          reason:
            'You may have already voted, voting period may have ended, or you may not be an active member',
        },
        { status: 403 }
      );
    }

    // TODO: In production, verify the wallet signature here
    // const isValidSignature = await verifyWalletSignature(
    //   voteData.voterWallet,
    //   voteData.signature,
    //   voteData.proposalId
    // );
    // if (!isValidSignature) {
    //   return NextResponse.json(
    //     { error: 'Invalid wallet signature' },
    //     { status: 401 }
    //   );
    // }

    // Cast the vote
    const vote = await castVote(voteData);

    return NextResponse.json(
      {
        success: true,
        vote: {
          id: vote.id,
          proposal_id: vote.proposal_id,
          vote_type: vote.vote_type,
          vote_weight: vote.vote_weight,
          voted_at: vote.voted_at,
        },
        message: 'Vote recorded successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error casting vote:', error);

    // Handle specific errors
    if (error.code === '23505') {
      // Unique constraint violation - already voted
      return NextResponse.json(
        { error: 'You have already voted on this proposal' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to cast vote' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/dao/vote
 * Get vote information for a specific proposal and voter
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const proposalId = searchParams.get('proposalId');
    const voterWallet = searchParams.get('voterWallet');

    if (!proposalId || !voterWallet) {
      return NextResponse.json(
        { error: 'Missing required parameters: proposalId, voterWallet' },
        { status: 400 }
      );
    }

    // Get the vote
    const vote = await getVote(proposalId, voterWallet);

    if (!vote) {
      return NextResponse.json(
        { hasVoted: false, vote: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      hasVoted: true,
      vote: {
        id: vote.id,
        vote_type: vote.vote_type,
        vote_weight: vote.vote_weight,
        voted_at: vote.voted_at,
        comment: vote.comment,
      },
    });
  } catch (error: any) {
    console.error('Error fetching vote:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch vote' },
      { status: 500 }
    );
  }
}
