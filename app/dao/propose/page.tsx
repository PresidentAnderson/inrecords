'use client';

/**
 * inRECORD DAO Governance System - Proposal Creation Page
 * Phase 2: Form for creating new DAO proposals
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ProposalType } from '../../../lib/types/dao';
import { createProposal } from '../../../lib/supabase/dao';
import { notifyProposalCreated } from '../../../lib/discord/notifications';

export default function ProposePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    proposal_type: 'funding' as ProposalType,
    funding_goal: '',
    voting_duration: '7', // days
    created_by: '' // wallet address
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    if (!formData.created_by.trim()) {
      setError('Wallet address is required');
      return;
    }

    if (formData.proposal_type === 'funding' && !formData.funding_goal) {
      setError('Funding goal is required for funding proposals');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate voting end date
      const votingEndsAt = new Date();
      votingEndsAt.setDate(votingEndsAt.getDate() + parseInt(formData.voting_duration));

      // Create proposal
      const { data, error: createError } = await createProposal({
        title: formData.title.trim(),
        description: formData.description.trim(),
        proposal_type: formData.proposal_type,
        funding_goal: formData.funding_goal ? parseFloat(formData.funding_goal) : undefined,
        created_by: formData.created_by.trim(),
        voting_ends_at: votingEndsAt.toISOString()
      });

      if (createError || !data) {
        throw new Error(createError?.message || 'Failed to create proposal');
      }

      // Send Discord notification
      await notifyProposalCreated(data);

      // Redirect to proposal detail page
      router.push(`/dao/proposals/${data.id}`);
    } catch (err: any) {
      console.error('Error creating proposal:', err);
      setError(err.message || 'Failed to create proposal. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-midnight to-black text-white">
      <div className="max-w-4xl mx-auto p-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dao"
            className="text-aurora hover:underline mb-4 inline-block"
          >
            ← Back to DAO
          </Link>
          <h1 className="text-5xl font-playfair mb-4">Create Proposal</h1>
          <p className="text-gray-300 text-lg">
            Submit a new proposal for the inRECORD DAO community to vote on. All proposals are publicly visible and require community approval.
          </p>
        </div>

        {/* Guidelines */}
        <div className="mb-8 p-6 rounded-2xl bg-aurora/10 border border-aurora/30">
          <h2 className="text-xl font-semibold mb-3 text-aurora">Proposal Guidelines</h2>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start">
              <span className="text-aurora mr-2">•</span>
              <span>Be clear and specific about what you're proposing</span>
            </li>
            <li className="flex items-start">
              <span className="text-aurora mr-2">•</span>
              <span>Include detailed implementation plans for funding requests</span>
            </li>
            <li className="flex items-start">
              <span className="text-aurora mr-2">•</span>
              <span>Consider community feedback before submitting</span>
            </li>
            <li className="flex items-start">
              <span className="text-aurora mr-2">•</span>
              <span>Proposals require simple majority (51%+) to pass</span>
            </li>
            <li className="flex items-start">
              <span className="text-aurora mr-2">•</span>
              <span>Voting weight is determined by token tier (1x-5x)</span>
            </li>
          </ul>
        </div>

        {/* Proposal Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Wallet Address */}
          <div>
            <label htmlFor="created_by" className="block text-sm font-semibold mb-2">
              Your Wallet Address <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="created_by"
              name="created_by"
              value={formData.created_by}
              onChange={handleInputChange}
              placeholder="0x... or yourname.eth"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora transition"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Your wallet address will be publicly visible as the proposal creator
            </p>
          </div>

          {/* Proposal Type */}
          <div>
            <label htmlFor="proposal_type" className="block text-sm font-semibold mb-2">
              Proposal Type <span className="text-red-400">*</span>
            </label>
            <select
              id="proposal_type"
              name="proposal_type"
              value={formData.proposal_type}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-aurora transition"
              required
            >
              <option value="funding">💰 Funding Request</option>
              <option value="governance">⚖️ Governance Change</option>
              <option value="partnership">🤝 Partnership Proposal</option>
              <option value="creative">🎨 Creative Initiative</option>
              <option value="technical">🔧 Technical Upgrade</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold mb-2">
              Proposal Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Fund Vinyl Pressing for New Album"
              maxLength={200}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora transition"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold mb-2">
              Detailed Description <span className="text-red-400">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide a detailed explanation of your proposal, including objectives, implementation plan, timeline, and expected outcomes..."
              rows={8}
              maxLength={5000}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora transition resize-vertical"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              {formData.description.length}/5000 characters
            </p>
          </div>

          {/* Funding Goal (conditional) */}
          {formData.proposal_type === 'funding' && (
            <div>
              <label htmlFor="funding_goal" className="block text-sm font-semibold mb-2">
                Funding Goal (USD) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  id="funding_goal"
                  name="funding_goal"
                  value={formData.funding_goal}
                  onChange={handleInputChange}
                  placeholder="10000"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora transition"
                  required={formData.proposal_type === 'funding'}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Amount requested from the DAO treasury
              </p>
            </div>
          )}

          {/* Voting Duration */}
          <div>
            <label htmlFor="voting_duration" className="block text-sm font-semibold mb-2">
              Voting Duration <span className="text-red-400">*</span>
            </label>
            <select
              id="voting_duration"
              name="voting_duration"
              value={formData.voting_duration}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-aurora transition"
              required
            >
              <option value="3">3 days</option>
              <option value="5">5 days</option>
              <option value="7">7 days (recommended)</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              How long the community has to vote on this proposal
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
              {error}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 bg-aurora text-black rounded-lg hover:opacity-80 transition font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Proposal...' : 'Submit Proposal'}
            </button>
            <Link
              href="/dao"
              className="px-8 py-4 border-2 border-white/20 text-white rounded-lg hover:bg-white/10 transition font-semibold text-center"
            >
              Cancel
            </Link>
          </div>

          {/* Terms Notice */}
          <p className="text-xs text-gray-400 text-center">
            By submitting a proposal, you agree that it will be publicly visible and subject to community voting.
            Proposals cannot be edited once submitted, but can be cancelled by the creator.
          </p>
        </form>

        {/* Help Section */}
        <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
          <div className="space-y-3 text-sm text-gray-300">
            <p>
              <strong>Not sure how to write a proposal?</strong> Check out our{' '}
              <Link href="/dao/guide" className="text-aurora hover:underline">
                proposal writing guide
              </Link>{' '}
              for examples and best practices.
            </p>
            <p>
              <strong>Want feedback before submitting?</strong> Share your draft in the{' '}
              <a
                href="https://discord.gg/inrecord"
                target="_blank"
                rel="noopener noreferrer"
                className="text-aurora hover:underline"
              >
                Discord community forum
              </a>
              .
            </p>
            <p>
              <strong>Questions about voting mechanics?</strong> Read our{' '}
              <Link href="/dao/faq" className="text-aurora hover:underline">
                DAO FAQ
              </Link>{' '}
              to learn more about weighted voting and governance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
