'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  proposalCreateSchema,
  ProposalCreate,
  ProposalTypeEnum,
  FundingCurrencyEnum,
  getDefaultVotingEndDate,
} from '@/lib/schemas/dao';

interface ProposalFormProps {
  walletAddress: string;
  linkedSessionId?: string | null;
  onSuccess?: (proposalId: string) => void;
  onCancel?: () => void;
}

export default function ProposalForm({
  walletAddress,
  linkedSessionId,
  onSuccess,
  onCancel,
}: ProposalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<ProposalCreate>({
    resolver: zodResolver(proposalCreateSchema),
    defaultValues: {
      createdBy: walletAddress,
      fundingCurrency: 'USD',
      quorumRequired: 10,
      approvalThreshold: 51,
      votingEndsAt: getDefaultVotingEndDate(7),
      linkedSessionId: linkedSessionId || undefined,
    },
  });

  const formData = watch();
  const proposalType = watch('proposalType');
  const fundingGoal = watch('fundingGoal');

  // Handle form submission
  const onSubmit = async (data: ProposalCreate) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/dao/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create proposal');
      }

      const result = await response.json();

      if (onSuccess) {
        onSuccess(result.proposal.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create proposal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle tag input
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 10 && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags);
  };

  // Preview modal
  if (showPreview) {
    return (
      <div className="bg-white rounded-lg p-8 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Proposal Preview</h2>

        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              {formData.proposalType}
            </span>
            {formData.fundingGoal && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                Funding: {formData.fundingCurrency} {formData.fundingGoal?.toLocaleString()}
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">{formData.title}</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{formData.description}</p>
        </div>

        {tags.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded-md">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Voting Configuration</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Voting Period:</span>
              <span className="ml-2 font-medium">
                {Math.ceil(
                  (new Date(formData.votingEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                )}{' '}
                days
              </span>
            </div>
            <div>
              <span className="text-gray-600">Quorum Required:</span>
              <span className="ml-2 font-medium">{formData.quorumRequired}%</span>
            </div>
            <div>
              <span className="text-gray-600">Approval Threshold:</span>
              <span className="ml-2 font-medium">{formData.approvalThreshold}%</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
          </button>
          <button
            onClick={() => setShowPreview(false)}
            disabled={isSubmitting}
            className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-colors"
          >
            Back to Edit
          </button>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <form onSubmit={handleSubmit(() => setShowPreview(true))} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
          Proposal Title *
        </label>
        <input
          {...register('title')}
          type="text"
          id="title"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter a clear and concise title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Proposal Type */}
      <div>
        <label htmlFor="proposalType" className="block text-sm font-semibold text-gray-700 mb-2">
          Proposal Type *
        </label>
        <select
          {...register('proposalType')}
          id="proposalType"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a type</option>
          {ProposalTypeEnum.options.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.proposalType && (
          <p className="mt-1 text-sm text-red-600">{errors.proposalType.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Provide a detailed description of your proposal. Include the problem, solution, and expected impact."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Minimum 50 characters. Current: {formData.description?.length || 0}
        </p>
      </div>

      {/* Funding Section */}
      {(proposalType === 'Studio Funding' ||
        proposalType === 'Equipment Purchase' ||
        proposalType === 'Artist Grant') && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Funding Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Funding Goal */}
            <div>
              <label htmlFor="fundingGoal" className="block text-sm font-semibold text-gray-700 mb-2">
                Funding Goal
              </label>
              <input
                {...register('fundingGoal', { valueAsNumber: true })}
                type="number"
                id="fundingGoal"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
              {errors.fundingGoal && (
                <p className="mt-1 text-sm text-red-600">{errors.fundingGoal.message}</p>
              )}
            </div>

            {/* Currency */}
            <div>
              <label htmlFor="fundingCurrency" className="block text-sm font-semibold text-gray-700 mb-2">
                Currency
              </label>
              <select
                {...register('fundingCurrency')}
                id="fundingCurrency"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {FundingCurrencyEnum.options.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Voting Configuration */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Voting Configuration</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Voting Period */}
          <div>
            <label htmlFor="votingEndsAt" className="block text-sm font-semibold text-gray-700 mb-2">
              Voting Ends
            </label>
            <input
              {...register('votingEndsAt', { valueAsDate: true })}
              type="datetime-local"
              id="votingEndsAt"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.votingEndsAt && (
              <p className="mt-1 text-sm text-red-600">{errors.votingEndsAt.message}</p>
            )}
          </div>

          {/* Quorum */}
          <div>
            <label htmlFor="quorumRequired" className="block text-sm font-semibold text-gray-700 mb-2">
              Quorum (%)
            </label>
            <input
              {...register('quorumRequired', { valueAsNumber: true })}
              type="number"
              id="quorumRequired"
              min="1"
              max="100"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.quorumRequired && (
              <p className="mt-1 text-sm text-red-600">{errors.quorumRequired.message}</p>
            )}
          </div>

          {/* Approval Threshold */}
          <div>
            <label htmlFor="approvalThreshold" className="block text-sm font-semibold text-gray-700 mb-2">
              Approval (%)
            </label>
            <input
              {...register('approvalThreshold', { valueAsNumber: true })}
              type="number"
              id="approvalThreshold"
              min="1"
              max="100"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.approvalThreshold && (
              <p className="mt-1 text-sm text-red-600">{errors.approvalThreshold.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 mb-2">
          Tags (Optional)
        </label>
        <div className="flex space-x-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add tags (press Enter)"
            maxLength={50}
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-md flex items-center space-x-2"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Add up to 10 tags to help categorize your proposal
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex space-x-3 pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Preview Proposal
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
