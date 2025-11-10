/**
 * Treasury Transactions API Route
 * GET /api/treasury/transactions - List transactions with filters
 * POST /api/treasury/transactions - Create new transaction (admin only)
 *
 * Supports filtering by type, currency, date range, and pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getTreasuryHistory,
  recordTransaction,
  validateTransaction,
  TransactionType,
} from '@/lib/supabase/treasury';

// GET - List transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const transactionType = searchParams.get('type') as TransactionType | null;
    const currency = searchParams.get('currency');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Validate pagination parameters
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        { error: 'Offset must be non-negative' },
        { status: 400 }
      );
    }

    // Fetch transactions
    const { data, error } = await getTreasuryHistory({
      transaction_type: transactionType || undefined,
      currency: currency || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      limit,
      offset,
    });

    if (error) {
      console.error('Error fetching treasury transactions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch transactions', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      transactions: data,
      pagination: {
        limit,
        offset,
        count: data?.length || 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Exception in treasury transactions GET endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST - Create new transaction (admin only)
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Extract transaction data
    const {
      transaction_type,
      amount,
      currency,
      proposal_id,
      contributor_wallet,
      recipient_wallet,
      transaction_hash,
      description,
      created_by,
    } = body;

    // Create transaction object
    const transaction = {
      transaction_type,
      amount: parseFloat(amount),
      currency: currency || 'ETH',
      proposal_id,
      contributor_wallet,
      recipient_wallet,
      transaction_hash,
      description,
      created_by,
    };

    // Validate transaction
    const validation = validateTransaction(transaction);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Invalid transaction data',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // TODO: Add authentication check
    // For now, we'll accept any request, but in production you should verify
    // that the user has admin privileges before allowing transaction creation

    // Record transaction
    const { data, error } = await recordTransaction(transaction);

    if (error) {
      console.error('Error recording transaction:', error);
      return NextResponse.json(
        { error: 'Failed to record transaction', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Transaction recorded successfully',
        transaction: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Exception in treasury transactions POST endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Enable dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;
