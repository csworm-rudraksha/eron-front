import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, User, Mail, Phone, Building, MapPin, Target, Award, DollarSign, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const LeadForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(id ? true : false);
  const isEditing = Boolean(id);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm();

  const sources = [
    { value: 'website', label: 'Website' },
    { value: 'facebook_ads', label: 'Facebook Ads' },
    { value: 'google_ads', label: 'Google Ads' },
    { value: 'referral', label: 'Referral' },
    { value: 'events', label: 'Events' },
    { value: 'other', label: 'Other' }
  ];

  const statuses = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'lost', label: 'Lost' },
    { value: 'won', label: 'Won' }
  ];

  // Load lead data if editing
  useEffect(() => {
    if (isEditing) {
      loadLead();
    }
  }, [id]);

  const loadLead = async () => {
    try {
      const response = await axios.get(`/api/leads/${id}`);
      const lead = response.data.lead;
      
      // Set form values
      Object.keys(lead).forEach(key => {
        if (key !== 'id' && key !== 'user_id' && key !== 'created_at' && key !== 'updated_at') {
          setValue(key, lead[key]);
        }
      });
    } catch (error) {
      console.error('Error loading lead:', error);
      toast.error('Failed to load lead');
      navigate('/dashboard');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEditing) {
        await axios.put(`/api/leads/${id}`, data);
        toast.success('Lead updated successfully');
      } else {
        await axios.post('/api/leads', data);
        toast.success('Lead created successfully');
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving lead:', error);
      const message = error.response?.data?.message || 'Failed to save lead';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Lead' : 'Add New Lead'}
          </h1>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="mr-2" size={20} />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                    First Name *
                  </label>
                  <input
                    id="first_name"
                    type="text"
                    className="input mt-1"
                    placeholder="Enter first name"
                    {...register('first_name', {
                      required: 'First name is required'
                    })}
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-danger-600">{errors.first_name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                    Last Name *
                  </label>
                  <input
                    id="last_name"
                    type="text"
                    className="input mt-1"
                    placeholder="Enter last name"
                    {...register('last_name', {
                      required: 'Last name is required'
                    })}
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-danger-600">{errors.last_name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <div className="mt-1 relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      id="email"
                      type="email"
                      className="input pl-10"
                      placeholder="Enter email address"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <div className="mt-1 relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      id="phone"
                      type="tel"
                      className="input pl-10"
                      placeholder="Enter phone number"
                      {...register('phone')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="mr-2" size={20} />
                Company Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    Company
                  </label>
                  <input
                    id="company"
                    type="text"
                    className="input mt-1"
                    placeholder="Enter company name"
                    {...register('company')}
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <div className="mt-1 relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      id="city"
                      type="text"
                      className="input pl-10"
                      placeholder="Enter city"
                      {...register('city')}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <input
                    id="state"
                    type="text"
                    className="input mt-1"
                    placeholder="Enter state"
                    {...register('state')}
                  />
                </div>
              </div>
            </div>

            {/* Lead Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="mr-2" size={20} />
                Lead Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                    Source *
                  </label>
                  <select
                    id="source"
                    className="input mt-1"
                    {...register('source', {
                      required: 'Source is required'
                    })}
                  >
                    <option value="">Select source</option>
                    {sources.map(source => (
                      <option key={source.value} value={source.value}>
                        {source.label}
                      </option>
                    ))}
                  </select>
                  {errors.source && (
                    <p className="mt-1 text-sm text-danger-600">{errors.source.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    className="input mt-1"
                    {...register('status')}
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="score" className="block text-sm font-medium text-gray-700">
                    Score (0-100)
                  </label>
                  <div className="mt-1 relative">
                    <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      id="score"
                      type="number"
                      min="0"
                      max="100"
                      className="input pl-10"
                      placeholder="Enter score"
                      {...register('score', {
                        min: {
                          value: 0,
                          message: 'Score must be at least 0'
                        },
                        max: {
                          value: 100,
                          message: 'Score must be at most 100'
                        }
                      })}
                    />
                  </div>
                  {errors.score && (
                    <p className="mt-1 text-sm text-danger-600">{errors.score.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lead_value" className="block text-sm font-medium text-gray-700">
                    Lead Value ($)
                  </label>
                  <div className="mt-1 relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      id="lead_value"
                      type="number"
                      min="0"
                      step="0.01"
                      className="input pl-10"
                      placeholder="Enter lead value"
                      {...register('lead_value', {
                        min: {
                          value: 0,
                          message: 'Lead value must be positive'
                        }
                      })}
                    />
                  </div>
                  {errors.lead_value && (
                    <p className="mt-1 text-sm text-danger-600">{errors.lead_value.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      {...register('is_qualified')}
                    />
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <CheckCircle className="mr-1" size={16} />
                      Qualified Lead
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center space-x-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save size={16} />
                )}
                <span>{isEditing ? 'Update Lead' : 'Create Lead'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeadForm;
