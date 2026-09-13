'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Users,
  AlertOctagon,
  ShieldCheck,
  Search,
  ExternalLink,
  Mail,
  RefreshCw,
  LogOut,
  CheckCircle2,
  Clock,
  ChevronDown,
  Activity,
  DollarSign,
} from 'lucide-react';
import { Lead, TelemetryEvent } from '@/lib/db';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name?: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryEvent[]>([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    pendingLeads: 0,
    approvedLeads: 0,
    revenueProtected: '$148,500',
    activeHealth: '99.98%',
  });

  const [activeTab, setActiveTab] = useState<'leads' | 'telemetry'>('leads');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Authenticate session
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/admin/login');
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch {
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  // Fetch leads and telemetry
  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [leadsRes, telemetryRes] = await Promise.all([
        fetch(`/api/admin/leads?status=${encodeURIComponent(statusFilter)}&search=${encodeURIComponent(searchQuery)}`),
        fetch('/api/admin/telemetry'),
      ]);

      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setLeads(data.leads || []);
      }

      if (telemetryRes.ok) {
        const data = await telemetryRes.json();
        if (data.stats) {
          setStats({
            totalLeads: data.stats.totalLeads,
            pendingLeads: data.stats.pendingLeads,
            approvedLeads: data.stats.approvedLeads,
            revenueProtected: data.stats.revenueProtected,
            activeHealth: data.stats.activeHealth,
          });
          setTelemetry(data.stats.recentEvents || []);
        }
      }
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
    } finally {
      setRefreshing(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const handleStatusChange = async (id: number, newStatus: Lead['status']) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        setLeads((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update lead status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0b1dff] text-[#FDF4D2] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[0.875rem] text-[#94A3B8]">
          <RefreshCw className="w-4 h-4 animate-spin text-[#FF788D]" />
          <span>Verifying administrator credentials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b1dff] text-[#FDF4D2] flex flex-col selection:bg-[#FF788D]/25 selection:text-[#FDF4D2]">
      {/* Top Mission Control Bar */}
      <header className="sticky top-0 z-40 bg-[#0F1522]/95 backdrop-blur-md border-b border-[#1E293B]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 h-[64px] flex items-center justify-between gap-4">
          {/* Brand & System Status */}
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center" aria-label="Return to live site">
              <Image
                src="/assets/logos/kultraLogo-trimmed.png"
                alt="Kultra"
                width={120}
                height={26}
                className="h-6 w-auto object-contain"
              />
            </a>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#1E293B]">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="text-[0.75rem] font-semibold text-[#10B981]">
                Mission Control Live
              </span>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="p-1.5 rounded-[4px] bg-[#141C2B] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#FDF4D2] border border-[#1E293B] transition-colors"
              title="Refresh Data"
              aria-label="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <div className="hidden md:flex flex-col text-right">
              <span className="text-[0.8125rem] font-medium text-[#FDF4D2] leading-tight">
                {user?.email || 'admin@kultra.ai'}
              </span>
              <span className="text-[0.7rem] text-[#94A3B8] uppercase tracking-wider">
                {user?.role || 'Administrator'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="py-1.5 px-3 rounded-[4px] bg-[#141C2B] hover:bg-[#1E293B] text-[#FF788D] hover:text-[#FF8FA2] border border-[#FF788D]/30 font-medium text-[0.8rem] transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-8">
        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-8">
          <div className="rounded-[4px] bg-[#0F1522] border border-[#1E293B] p-4">
            <span className="text-[0.75rem] font-medium text-[#94A3B8] block">Total Pilot Submissions</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[1.65rem] font-bold text-[#FDF4D2] leading-none">{stats.totalLeads}</span>
              <span className="text-[0.75rem] text-[#10B981] font-semibold">Live in Neon</span>
            </div>
          </div>

          <div className="rounded-[4px] bg-[#0F1522] border border-[#1E293B] p-4">
            <span className="text-[0.75rem] font-medium text-[#94A3B8] block">Pending Review</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[1.65rem] font-bold text-[#FF788D] leading-none">{stats.pendingLeads}</span>
              <span className="text-[0.75rem] text-[#FF788D]">Awaiting triage</span>
            </div>
          </div>

          <div className="rounded-[4px] bg-[#0F1522] border border-[#1E293B] p-4">
            <span className="text-[0.75rem] font-medium text-[#94A3B8] block">Approved Pilot Fleets</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[1.65rem] font-bold text-[#10B981] leading-none">{stats.approvedLeads}</span>
              <span className="text-[0.75rem] text-[#94A3B8]">Connected GMC</span>
            </div>
          </div>

          <div className="rounded-[4px] bg-[#0F1522] border border-[#1E293B] p-4">
            <span className="text-[0.75rem] font-medium text-[#94A3B8] block">Ad Revenue Protected</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[1.65rem] font-bold text-[#10B981] leading-none">{stats.revenueProtected}</span>
              <span className="text-[0.75rem] text-[#94A3B8]">30d baseline</span>
            </div>
          </div>

          <div className="col-span-2 lg:col-span-1 rounded-[4px] bg-[#0F1522] border border-[#1E293B] p-4">
            <span className="text-[0.75rem] font-medium text-[#94A3B8] block">Telemetry Engine SLA</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[1.65rem] font-bold text-[#FDF4D2] leading-none">{stats.activeHealth}</span>
              <span className="text-[0.75rem] text-[#10B981]">Pub/Sub stream</span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-[#1E293B] mb-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('leads')}
              className={`pb-3 text-[0.9rem] font-semibold transition-colors relative ${
                activeTab === 'leads'
                  ? 'text-[#FDF4D2] after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#FF788D]'
                  : 'text-[#94A3B8] hover:text-[#FDF4D2]'
              }`}
            >
              Pilot Submissions ({leads.length})
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`pb-3 text-[0.9rem] font-semibold transition-colors relative ${
                activeTab === 'telemetry'
                  ? 'text-[#FDF4D2] after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#FF788D]'
                  : 'text-[#94A3B8] hover:text-[#FDF4D2]'
              }`}
            >
              Telemetry Stream ({telemetry.length})
            </button>
          </div>

          <div className="text-[0.75rem] text-[#64748B] hidden sm:block">
            Database: <span className="text-[#10B981]">Neon Postgres (Connected)</span>
          </div>
        </div>

        {/* Tab 1: Form Submissions */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0F1522] border border-[#1E293B] p-3 rounded-[4px]">
              {/* Search */}
              <div className="relative flex-1 max-w-[340px]">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by email or website..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-[3px] bg-[#0a0b1dff] border border-[#1E293B] text-[0.825rem] text-[#FDF4D2] placeholder-[#64748B] focus:outline-none focus:border-[#FF788D]"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-[0.78rem]">
                {['all', 'pending', 'approved', 'contacted', 'rejected'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-[3px] capitalize font-medium transition-colors ${
                      statusFilter === st
                        ? 'bg-[#FF788D] text-[#0a0b1dff] font-bold'
                        : 'bg-[#141C2B] text-[#94A3B8] hover:text-[#FDF4D2] border border-[#1E293B]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-[4px] border border-[#1E293B] bg-[#0F1522] overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[780px]">
                <thead>
                  <tr className="border-b border-[#1E293B] bg-[#141C2B]/50 text-[0.75rem] font-semibold text-[#94A3B8]">
                    <th className="py-3 px-4">Applicant & Account</th>
                    <th className="py-3 px-4">Store Website</th>
                    <th className="py-3 px-4">Catalog Size</th>
                    <th className="py-3 px-4">Submission Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B] text-[0.825rem]">
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#94A3B8]">
                        No submissions found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-[#141C2B]/30 transition-colors">
                        <td className="py-3.5 px-4 align-middle">
                          <div className="font-semibold text-[#FDF4D2]">{lead.email}</div>
                          <span
                            className={`inline-block text-[0.7rem] font-medium px-2 py-0.5 rounded-[2px] mt-1 border ${
                              lead.account_type === 'agency'
                                ? 'bg-[#FF788D]/10 text-[#FF788D] border-[#FF788D]/25'
                                : 'bg-[#141C2B] text-[#94A3B8] border-[#1E293B]'
                            }`}
                          >
                            {lead.account_type === 'agency' ? 'PPC Agency' : 'Direct Merchant'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 align-middle">
                          <a
                            href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#FDF4D2] hover:text-[#FF788D] transition-colors"
                          >
                            <span>{lead.website}</span>
                            <ExternalLink className="w-3 h-3 text-[#64748B]" />
                          </a>
                        </td>

                        <td className="py-3.5 px-4 align-middle text-[#94A3B8]">
                          {lead.catalog_size || 'Unspecified'}
                        </td>

                        <td className="py-3.5 px-4 align-middle text-[#94A3B8]">
                          {new Date(lead.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>

                        <td className="py-3.5 px-4 align-middle">
                          <select
                            value={lead.status}
                            disabled={updatingId === lead.id}
                            onChange={(e) =>
                              handleStatusChange(lead.id, e.target.value as Lead['status'])
                            }
                            className={`px-2 py-1 rounded-[2px] text-[0.75rem] font-bold border focus:outline-none cursor-pointer ${
                              lead.status === 'approved'
                                ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                                : lead.status === 'contacted'
                                ? 'bg-[#4285F4]/15 text-[#4285F4] border-[#4285F4]/30'
                                : lead.status === 'rejected'
                                ? 'bg-[#FF788D]/15 text-[#FF788D] border-[#FF788D]/30'
                                : 'bg-[#FBBC05]/15 text-[#FBBC05] border-[#FBBC05]/30'
                            }`}
                          >
                            <option value="pending" className="bg-[#0F1522] text-[#FDF4D2]">Pending</option>
                            <option value="contacted" className="bg-[#0F1522] text-[#FDF4D2]">Contacted</option>
                            <option value="approved" className="bg-[#0F1522] text-[#FDF4D2]">Approved</option>
                            <option value="rejected" className="bg-[#0F1522] text-[#FDF4D2]">Rejected</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 align-middle text-right">
                          <a
                            href={`mailto:${lead.email}?subject=Kultra%20Sentinel%20Pilot%20Onboarding&body=Hi%20there,%0A%0AWe%20received%20your%20pilot%20application%20for%20${encodeURIComponent(lead.website)}.`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#141C2B] hover:bg-[#1E293B] border border-[#1E293B] text-[0.75rem] text-[#FDF4D2] hover:text-[#FF788D] transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Contact</span>
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Telemetry Stream */}
        {activeTab === 'telemetry' && (
          <div className="space-y-4">
            <div className="rounded-[4px] border border-[#1E293B] bg-[#0F1522] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[1.05rem] font-bold text-[#FDF4D2]">
                    Pub/Sub Ingestion Stream
                  </h3>
                  <p className="text-[0.78rem] text-[#94A3B8]">
                    Real-time crawler disassembly signals and Shopify 1-click remediation actions.
                  </p>
                </div>
                <span className="text-[0.75rem] font-semibold text-[#10B981] px-2 py-0.5 rounded-[2px] bg-[#10B981]/10 border border-[#10B981]/25">
                  QoS 1 Push Subscription
                </span>
              </div>

              <div className="space-y-3">
                {telemetry.map((event) => (
                  <div
                    key={event.id}
                    className="p-3.5 rounded-[3px] bg-[#0a0b1dff] border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[0.725rem] font-bold px-2 py-0.5 rounded-[2px] ${
                            event.event_type === 'crawler_disapproval'
                              ? 'bg-[#FF788D]/15 text-[#FF788D] border border-[#FF788D]/30'
                              : 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                          }`}
                        >
                          {event.event_type}
                        </span>
                        {event.sku && (
                          <code className="text-[0.8rem] text-[#FDF4D2] bg-[#141C2B] px-1.5 py-0.5 rounded-[2px]">
                            {event.sku}
                          </code>
                        )}
                      </div>
                      <p className="text-[0.78rem] text-[#94A3B8] mt-1.5 font-mono">
                        {JSON.stringify(event.details)}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      {event.revenue_impact > 0 && (
                        <div className="text-[0.825rem] font-bold text-[#FF788D]">
                          ${event.revenue_impact.toLocaleString()} at risk
                        </div>
                      )}
                      <div className="text-[0.7rem] text-[#64748B]">
                        {new Date(event.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
