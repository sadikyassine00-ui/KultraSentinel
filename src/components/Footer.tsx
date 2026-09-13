'use client';

import React from 'react';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="relative w-full border-t border-[#1E293B] bg-[#0a0b1dff] py-14 px-4 sm:px-6 z-10">
      <div className="max-w-[1140px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#1E293B]/60">
          {/* Brand & Concise Positioning Statement */}
          <div className="md:col-span-5 flex flex-col items-start gap-4">
            <a href="#" className="flex items-center group outline-none" aria-label="Kultra Home">
              <Image
                src="/assets/logos/kultraLogo-trimmed.png"
                alt="Kultra"
                width={135}
                height={28}
                className="h-[28px] w-auto object-contain transition-opacity duration-180 group-hover:opacity-90"
              />
            </a>

            <p className="text-[0.875rem] text-[#94A3B8] max-w-[340px] leading-relaxed">
              Real-time Google Merchant Center telemetry
            </p>

            {/* System Status: Clean typography */}
            <div className="inline-flex items-center px-3 py-1.5 rounded-[4px] bg-[#0F1522] border border-[#1E293B]">
              <span className="text-[0.75rem] font-medium text-[#94A3B8]">
                Merchant API v1 Telemetry: Operational
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <h4 className="text-[0.8125rem] font-semibold text-[#FDF4D2]">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-[0.8125rem] text-[#94A3B8]">
              <li>
                <a href="#features" className="hover:text-[#FDF4D2] transition-colors duration-180">
                  Features
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-[#FDF4D2] transition-colors duration-180">
                  Architecture
                </a>
              </li>
              <li>
                <a href="#diagnostics" className="hover:text-[#FDF4D2] transition-colors duration-180">
                  Diagnostics
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-[#FDF4D2] transition-colors duration-180">
                  Pricing
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-[#FDF4D2] transition-colors duration-180">
                  Portal Login
                </a>
              </li>
              <li>
                <a href="mailto:support@usekultra.com" className="hover:text-[#FDF4D2] transition-colors duration-180">
                  Contact & Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <h4 className="text-[0.8125rem] font-semibold text-[#FDF4D2]">
              Legal & Compliance
            </h4>
            <ul className="space-y-2.5 text-[0.8125rem] text-[#94A3B8]">
              <li>
                <a href="#privacy" className="hover:text-[#FDF4D2] transition-colors duration-180">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-[#FDF4D2] transition-colors duration-180">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#beta" className="hover:text-[#FF788D] transition-colors duration-180 font-medium">
                  Apply for Pilot Access
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Metadata Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[0.75rem] text-[#94A3B8]">
          <p>© {new Date().getFullYear()} Kultra. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[#94A3B8]">
            <span>Google Merchant API v1</span>
            <span className="text-[#1E293B]">|</span>
            <span>Cloud Pub/Sub Push</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
