'use client';

import { useState } from 'react';
import { VoteType, MembershipTier, getVoteWeight } from '@/lib/schemas/dao';

interface VotingWidgetProps {
  proposalId: string;
  walletAddress?: string | null;
  membershipTier?: MembershipTier | null;
  hasVoted?: boolean;
  existingVote?: VoteType | null;
  onVoteSuccess?: () => void;
}

export default function VotingWidget({
  proposalId,
  walletAddress,
  membershipTier,
  hasVoted = false,
  existingVote = null,
  onVoteSuccess,
}: VotingWidgetProps) {
  const [selectedVote, setSelectedVote] = useState<VoteType | null>(existingVote);
  const [isVoting, setIsVoting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [comment, setComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);

  const voteWeight = membershipTier ? getVoteWeight(membershipTier) : 1;

  // Check if wallet is connected
  const isWalletConnected = !!walletAddress;

  // Handle vote selection
  const handleVoteSelect = (voteType: VoteType) => {
    if (hasVoted) return;
    setSelectedVote(voteType);
    setShowConfirmation(true);
    setError(null);
  };

  // Handle vote submission
  const handleSubmitVote = async () => {
    if (!selectedVote || !walletAddress) return;

    setIsVoting(true);
    setError(null);

    try {
      // In a real implementation, you would sign the vote with the wallet
      const signature = await signVote(proposalId, selectedVote, walletAddress);

      const response = await fetch('/api/dao/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId,
          voterWallet: walletAddress,
          voteType: selectedVote,
          signature,
          comment: comment.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cast vote');
      }

      setSuccess(true);
      setShowConfirmation(false);

      // Call success callback after a short delay
      setTimeout(() => {
        if (onVoteSuccess) {
          onVoteSuccess();
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to cast vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  // Mock wallet signature function (replace with actual wallet integration)
  const signVote = async (
    proposalId: string,
    voteType: VoteType,
    wallet: string
  ): Promise<string> => {
    // In production, use actual wallet signing
    // For now, return a mock signature
    const message = `Vote ${voteType} on proposal ${proposalId}`;
    const mockSignature = btoa(message + wallet + Date.now());
    return mockSignature;
  };

  // Connect wallet handler (placeholder)
  const handleConnectWallet = () => {
    // Implement wallet connection logic
    alert('Wallet connection feature coming soon!');
  };

  // Get vote button styling
  const getVoteButtonStyle = (voteType: VoteType) => {
    const isSelected = selectedVote === voteType;
    const isDisabled = hasVoted || isVoting;

    const baseStyle = 'flex-1 py-4 px-6 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    if (isSelected) {
      switch (voteType) {
        case 'for':
          return `${baseStyle} bg-green-600 text-white hover:bg-green-700`;
        case 'against':
          return `${baseStyle} bg-red-600 text-white hover:bg-red-700`;
        case 'abstain':
          return `${baseStyle} bg-gray-600 text-white hover:bg-gray-700`;
      }
    }

    return `${baseStyle} bg-white border-2 ${
      isDisabled ? 'border-gray-300' : 'border-gray-300 hover:border-gray-400'
    } text-gray-700`;
  };

  // Success state
  if (success) {
    return (
      <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <svg
            className="w-16 h-16 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-green-900 mb-2">Vote Recorded!</h3>
        <p className="text-green-700 mb-1">
          Your vote has been successfully recorded with a weight of {voteWeight}x
        </p>
        <p className="text-green-600 text-sm">Thank you for participating in DAO governance!</p>
      </div>
    );
  }

  // Already voted state
  if (hasVoted && existingVote) {
    return (
      <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-blue-900 mb-1">You've Already Voted</h3>
            <p className="text-blue-700">
              Your vote: <span className="font-semibold capitalize">{existingVote}</span> (Weight: {voteWeight}x)
            </p>
          </div>
          <svg
            className="w-12 h-12 text-blue-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    );
  }

  // Wallet not connected state
  if (!isWalletConnected) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-8 text-center">
        <h3 className="text-xl font-bold text-yellow-900 mb-3">Connect Your Wallet to Vote</h3>
        <p className="text-yellow-700 mb-6">
          You need to connect your wallet to participate in DAO governance
        </p>
        <button
          onClick={handleConnectWallet}
          className="px-6 py-3 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  // Confirmation modal
  if (showConfirmation && selectedVote) {
    return (
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Your Vote</h3>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-700">Your Vote:</span>
            <span className="font-bold text-gray-900 capitalize">{selectedVote}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-700">Vote Weight:</span>
            <span className="font-bold text-gray-900">{voteWeight}x</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Membership Tier:</span>
            <span className="font-bold text-gray-900">{membershipTier}</span>
          </div>
        </div>

        {/* Optional comment */}
        <div className="mb-4">
          <button
            onClick={() => setShowCommentBox(!showCommentBox)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showCommentBox ? 'Hide' : 'Add'} comment (optional)
          </button>
          {showCommentBox && (
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts on this proposal..."
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              maxLength={2000}
            />
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleSubmitVote}
            disabled={isVoting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isVoting ? 'Submitting...' : 'Confirm Vote'}
          </button>
          <button
            onClick={() => {
              setShowConfirmation(false);
              setSelectedVote(null);
              setComment('');
              setShowCommentBox(false);
            }}
            disabled={isVoting}
            className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Main voting interface
  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Cast Your Vote</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Your vote weight:</span>
          <span className="font-bold text-blue-600">{voteWeight}x</span>
          <span className="text-gray-400">|</span>
          <span>Tier: {membershipTier}</span>
        </div>
      </div>

      <div className="flex space-x-3 mb-4">
        <button
          onClick={() => handleVoteSelect('for')}
          disabled={isVoting || hasVoted}
          className={getVoteButtonStyle('for')}
        >
          <div className="flex flex-col items-center">
            <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>For</span>
          </div>
        </button>

        <button
          onClick={() => handleVoteSelect('against')}
          disabled={isVoting || hasVoted}
          className={getVoteButtonStyle('against')}
        >
          <div className="flex flex-col items-center">
            <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>Against</span>
          </div>
        </button>

        <button
          onClick={() => handleVoteSelect('abstain')}
          disabled={isVoting || hasVoted}
          className={getVoteButtonStyle('abstain')}
        >
          <div className="flex flex-col items-center">
            <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
            <span>Abstain</span>
          </div>
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Select your vote to proceed to confirmation
      </p>
    </div>
  );
}
