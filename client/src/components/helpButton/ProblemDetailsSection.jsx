import React from 'react';

const problemTypes = [
  { value: 'flat_tire', label: 'Flat Tire' },
  { value: 'dead_battery', label: 'Dead Battery' },
  { value: 'out_of_fuel', label: 'Out of Fuel' },
  { value: 'engine_problem', label: 'Engine Problem' },
  { value: 'locked_out', label: 'Locked Out' },
  { value: 'accident', label: 'Accident' },
  { value: 'towing_needed', label: 'Towing Needed' },
  { value: 'other', label: 'Other' }
];

const priorityLevels = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

export default function ProblemDetailsSection({
  problemType,
  description,
  priority,
  onChange
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Problem Details</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Problem Type <span className="text-red-500">*</span>
        </label>
        <select
          name="problemType"
          value={problemType}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          required
        >
          {problemTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          name="description"
          value={description}
          onChange={onChange}
          placeholder="Please describe your situation in detail..."
          rows="4"
          maxLength="1000"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">{description.length}/1000 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Priority Level
        </label>
        <select
          name="priority"
          value={priority}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {priorityLevels.map(level => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
