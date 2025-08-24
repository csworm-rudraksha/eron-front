import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Plus, 
  LogOut, 
  Search, 
  Filter, 
  RefreshCw,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // AG Grid column definitions
  const columnDefs = useMemo(() => [
    {
      headerName: 'Name',
      field: 'name',
      width: 200,
      cellRenderer: (params) => {
        const lead = params.data;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{`${lead.first_name} ${lead.last_name}`}</span>
            <span className="text-sm text-gray-500">{lead.email}</span>
          </div>
        );
      }
    },
    {
      headerName: 'Company',
      field: 'company',
      width: 150,
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals']
      }
    },
    {
      headerName: 'Phone',
      field: 'phone',
      width: 140
    },
    {
      headerName: 'Location',
      field: 'location',
      width: 150,
      cellRenderer: (params) => {
        const lead = params.data;
        return (
          <div className="flex flex-col">
            <span>{lead.city}</span>
            <span className="text-sm text-gray-500">{lead.state}</span>
          </div>
        );
      }
    },
    {
      headerName: 'Source',
      field: 'source',
      width: 120,
      cellRenderer: (params) => {
        const source = params.value;
        const sourceLabels = {
          website: 'Website',
          facebook_ads: 'Facebook Ads',
          google_ads: 'Google Ads',
          referral: 'Referral',
          events: 'Events',
          other: 'Other'
        };
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
            {sourceLabels[source] || source}
          </span>
        );
      }
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 120,
      cellRenderer: (params) => <StatusBadge status={params.value} />
    },
    {
      headerName: 'Score',
      field: 'score',
      width: 80,
      cellRenderer: (params) => (
        <span className={`font-medium ${params.value >= 70 ? 'text-success-600' : params.value >= 40 ? 'text-warning-600' : 'text-danger-600'}`}>
          {params.value}
        </span>
      )
    },
    {
      headerName: 'Value',
      field: 'lead_value',
      width: 100,
      cellRenderer: (params) => (
        <span className="font-medium">
          ${params.value?.toLocaleString() || '0'}
        </span>
      )
    },
    {
      headerName: 'Qualified',
      field: 'is_qualified',
      width: 100,
      cellRenderer: (params) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${params.value ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-600'}`}>
          {params.value ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      headerName: 'Created',
      field: 'created_at',
      width: 120,
      cellRenderer: (params) => {
        const date = new Date(params.value);
        return date.toLocaleDateString();
      }
    },
    {
      headerName: 'Actions',
      field: 'actions',
      width: 120,
      sortable: false,
      filter: false,
      cellRenderer: (params) => {
        const lead = params.data;
        return (
          <div className="flex space-x-1">
            <button
              onClick={() => handleViewLead(lead)}
              className="p-1 text-gray-600 hover:text-primary-600"
              title="View"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => handleEditLead(lead)}
              className="p-1 text-gray-600 hover:text-primary-600"
              title="Edit"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => handleDeleteLead(lead)}
              className="p-1 text-gray-600 hover:text-danger-600"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      }
    }
  ], []);

  // AG Grid default column definitions
  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100
  }), []);

  // Fetch leads
  const fetchLeads = useCallback(async (page = 1, limit = 20, searchFilters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (Object.keys(searchFilters).length > 0) {
        params.append('filters', JSON.stringify(searchFilters));
      }

      const response = await axios.get(`/api/leads?${params}`);
      setLeads(response.data.data);
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total,
        totalPages: response.data.totalPages
      });
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load leads on component mount
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Handle search
  const handleSearch = useCallback(() => {
    const searchFilters = {};
    if (searchTerm.trim()) {
      searchFilters.email = {
        operator: 'contains',
        value: searchTerm.trim()
      };
    }
    setFilters(searchFilters);
    fetchLeads(1, pagination.limit, searchFilters);
  }, [searchTerm, pagination.limit, fetchLeads]);

  // Handle pagination
  const handlePageChange = (newPage) => {
    fetchLeads(newPage, pagination.limit, filters);
  };

  // Handle lead actions
  const handleViewLead = (lead) => {
    // For now, just show lead details in console
    console.log('View lead:', lead);
    toast.success(`Viewing ${lead.first_name} ${lead.last_name}`);
  };

  const handleEditLead = (lead) => {
    navigate(`/leads/${lead.id}/edit`);
  };

  const handleDeleteLead = async (lead) => {
    if (window.confirm(`Are you sure you want to delete ${lead.first_name} ${lead.last_name}?`)) {
      try {
        await axios.delete(`/api/leads/${lead.id}`);
        toast.success('Lead deleted successfully');
        fetchLeads(pagination.page, pagination.limit, filters);
      } catch (error) {
        console.error('Error deleting lead:', error);
        toast.error('Failed to delete lead');
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading && leads.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Lead Management System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.first_name} {user?.last_name}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/leads/new')}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Lead</span>
            </button>
            <button
              onClick={() => fetchLeads(1, pagination.limit, filters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="input pl-10 pr-4"
              />
            </div>
            <button
              onClick={handleSearch}
              className="btn-secondary flex items-center space-x-2"
            >
              <Filter size={16} />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <div className="text-sm font-medium text-gray-600">Total Leads</div>
            <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm font-medium text-gray-600">New Leads</div>
            <div className="text-2xl font-bold text-blue-600">
              {leads.filter(lead => lead.status === 'new').length}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-sm font-medium text-gray-600">Qualified</div>
            <div className="text-2xl font-bold text-green-600">
              {leads.filter(lead => lead.is_qualified).length}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-sm font-medium text-gray-600">Total Value</div>
            <div className="text-2xl font-bold text-purple-600">
              ${leads.reduce((sum, lead) => sum + (lead.lead_value || 0), 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* AG Grid */}
        <div className="card">
          <div className="ag-theme-alpine w-full" style={{ height: '600px' }}>
            <AgGridReact
              columnDefs={columnDefs}
              rowData={leads}
              defaultColDef={defaultColDef}
              pagination={false}
              paginationPageSize={pagination.limit}
              rowSelection="single"
              animateRows={true}
              suppressRowClickSelection={true}
            />
          </div>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
