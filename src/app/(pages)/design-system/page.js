'use client';

import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Section from '@/components/ui/Section';
import Card from '@/components/ui/Card';
import CardGrid from '@/components/ui/CardGrid';
import DataRow from '@/components/ui/DataRow';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import { TextField, Select, DatePicker } from '@/components/ui/FormField';
import MetricCard from '@/components/ui/MetricCard';
import Toggle from '@/components/ui/Toggle';
import { formatDateIndonesian } from '@/utils/dateFormatter';
import styles from './design-system.module.css';

const metricChartData = [
  { label: '1',   value: 1 },
  { label: '2',   value: 2 },
  { label: '5',   value: 5 },
  { label: '10',  value: 10 },
  { label: '50',  value: 50 },
  { label: '100', value: 100 },
];

const colors = [
  { name: '--color-background', value: '#000000', label: 'Background' },
  { name: '--color-background-2', value: '#0a0a0a', label: 'Background 2' },
  { name: '--color-text', value: '#ededed', label: 'Text' },
  { name: '--color-text-muted', value: '#a1a1a1', label: 'Text Muted' },
  { name: '--color-primary', value: '#bd5200', label: 'Primary' },
  { name: '--color-secondary', value: '#0070f3', label: 'Secondary' },
  { name: '--color-accent', value: '#0096ff', label: 'Accent' },
  { name: '--color-border', value: '#1f1f1f', label: 'Border' },
  { name: '--color-success', value: '#22c55e', label: 'Success' },
  { name: '--color-danger', value: '#ef4444', label: 'Danger' },
  { name: '--color-chart-blue', value: '#52AEFF', label: 'Chart Blue' },
];

const spacingTokens = [
  { name: '--spacing-3xs', value: '4px' },
  { name: '--spacing-2xs', value: '14px' },
  { name: '--spacing-xs', value: '30px' },
  { name: '--spacing-sm', value: '52px' },
  { name: '--spacing-md', value: '80px' },
  { name: '--spacing-lg', value: '110px' },
  { name: '--spacing-xl', value: '8rem' },
];

const sampleColumns = [
  { key: 'token', label: 'Token' },
  { key: 'value', label: 'Value' },
  { key: 'usage', label: 'Usage' },
];

const radiusData = [
  { token: '--radius-none', value: '0', usage: 'No rounding (rounded-none)' },
  { token: '--radius-sm', value: '0.125rem (2px)', usage: 'Badges, tight borders (rounded-sm)' },
  { token: '--radius-md', value: '0.375rem (6px)', usage: 'Default — buttons, cards, inputs (rounded-md)' },
  { token: '--radius-lg', value: '0.5rem (8px)', usage: 'Popovers, prominent cards (rounded-lg)' },
  { token: '--radius-xl', value: '0.75rem (12px)', usage: 'Modals, hero cards (rounded-xl)' },
  { token: '--radius-2xl', value: '1rem (16px)', usage: 'Large containers (rounded-2xl)' },
  { token: '--radius-3xl', value: '1.5rem (24px)', usage: 'Extra large containers (rounded-3xl)' },
  { token: '--radius-full', value: '9999px', usage: 'Pills, avatars, fully rounded (rounded-full)' },
];

const icons = [
  {
    name: 'Grid',
    svg: (
      <svg className={styles.iconPreview} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    name: 'Wallet',
    svg: (
      <svg className={styles.iconPreview} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
      </svg>
    ),
  },
  {
    name: 'Dollar',
    svg: (
      <svg className={styles.iconPreview} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    name: 'News',
    svg: (
      <svg className={styles.iconPreview} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
        <path d="M18 14h-8" />
        <path d="M15 18h-5" />
        <path d="M10 6h8v4h-8V6z" />
      </svg>
    ),
  },
  {
    name: 'Activity',
    svg: (
      <svg className={styles.iconPreview} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    name: 'Palette',
    svg: (
      <svg className={styles.iconPreview} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r="2.5" />
        <path d="M17.5 10.5a2.5 2.5 0 0 1 0 5" />
        <circle cx="8.5" cy="13.5" r="2.5" />
        <circle cx="13.5" cy="17.5" r="2.5" />
        <path d="M6.5 10.5a2.5 2.5 0 0 0 0 5" />
      </svg>
    ),
  },
];

const demoTableColumns = [
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type' },
  { key: 'status', label: 'Status' },
];

const demoTableData = [
  { name: 'Antam 10g', type: 'Gold Bar', status: 'Active' },
  { name: 'Antam 5g', type: 'Gold Bar', status: 'Active' },
  { name: 'Antam 1g', type: 'Gold Bar', status: 'Sold' },
];

const dateFormatColumns = [
  { key: 'input', label: 'Input (YYYY-MM-DD)' },
  { key: 'output', label: 'Output (Indonesian)' },
];

const dateFormatData = [
  { input: '2026-04-18', output: formatDateIndonesian('2026-04-18') },
  { input: '2026-03-05', output: formatDateIndonesian('2026-03-05') },
  { input: '2026-12-25', output: formatDateIndonesian('2026-12-25') },
  { input: '2026-01-01', output: formatDateIndonesian('2026-01-01') },
];

export default function DesignSystemPage() {
  const [formDemo, setFormDemo] = useState({ name: '', brand: '', date: '' });
  const [toggleOn, setToggleOn] = useState(true);
  const [toggleOff, setToggleOff] = useState(false);

  return (
    <>
      <PageHeader
        title="Design System"
        description="Internal documentation of tokens, styles, and components"
      />

      {/* Colors */}
      <Section id="colors" title="Colors">
        <div className={styles.swatchGrid}>
          {colors.map((color) => (
            <div key={color.name} className={styles.swatch}>
              <div
                className={styles.swatchPreview}
                style={{ backgroundColor: color.value }}
              />
              <div className={styles.swatchInfo}>
                <div className={styles.swatchName}>{color.label}</div>
                <div className={styles.swatchValue}>{color.name}</div>
                <div className={styles.swatchValue}>{color.value}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Typography */}
      <Section id="typography" title="Typography">
        <div className={styles.typographySample}>
          <div className={styles.typographyLabel}>heading-1 — 48px / 600</div>
          <div className={styles.heading1}>The quick brown fox</div>
        </div>
        <div className={styles.typographySample}>
          <div className={styles.typographyLabel}>heading-3 — 32px / 600</div>
          <div className={styles.heading3}>The quick brown fox</div>
        </div>
        <div className={styles.typographySample}>
          <div className={styles.typographyLabel}>heading-2 — 14px / 500</div>
          <div className={styles.heading2}>The quick brown fox</div>
        </div>
        <div className={styles.typographySample}>
          <div className={styles.typographyLabel}>heading-5 — 14px / 400</div>
          <div className={styles.heading5}>The quick brown fox</div>
        </div>
        <div className={styles.typographySample}>
          <div className={styles.typographyLabel}>body — 16px / 400</div>
          <div className={styles.bodyText}>The quick brown fox jumps over the lazy dog.</div>
        </div>
        <div className={styles.typographySample}>
          <div className={styles.typographyLabel}>body-text — 12px / 400</div>
          <div className={styles.bodyTextSmall}>The quick brown fox jumps over the lazy dog.</div>
        </div>
        <div className={styles.typographySample}>
          <div className={styles.typographyLabel}>inline-text — 14px / 400</div>
          <div className={styles.inlineText}>The quick brown fox jumps over the lazy dog.</div>
        </div>
      </Section>

      {/* Spacing */}
      <Section id="spacing" title="Spacing">
        <div className={styles.spacingGrid}>
          {spacingTokens.map((token) => (
            <div key={token.name} className={styles.spacingRow}>
              <span className={styles.spacingLabel}>{token.name.replace('--spacing-', '')} ({token.value})</span>
              <div
                className={styles.spacingBar}
                style={{ width: token.value }}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Icons */}
      <Section id="icons" title="Icons">
        <div className={styles.iconGrid}>
          {icons.map((icon) => (
            <div key={icon.name} className={styles.iconCard}>
              {icon.svg}
              <span className={styles.iconName}>{icon.name}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Utilities */}
      <Section id="utilities" title="Utilities">
        <div className={styles.componentDemo}>
          <div className={styles.componentLabel}>Date Formatter (Indonesian)</div>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px', fontSize: '14px' }}>
            Format dates using Indonesian locale with day names and abbreviated months. Usage: <code style={{ background: 'var(--color-background-2)', padding: '2px 6px', borderRadius: '4px' }}>formatDateIndonesian(dateString)</code>
          </p>
          <Table columns={dateFormatColumns} data={dateFormatData} />
        </div>
      </Section>

      {/* Components */}
      <Section id="components" title="Components">
        {/* MetricCard */}
        <div id="comp-metric-card" className={styles.componentDemo}>
          <div className={styles.componentLabel}>MetricCard</div>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px', fontSize: '13px' }}>
            Metric card with label, value, and optional bar chart. Props: <code style={{ background: 'var(--color-background-2)', padding: '2px 6px', borderRadius: '4px' }}>label</code>, <code style={{ background: 'var(--color-background-2)', padding: '2px 6px', borderRadius: '4px' }}>value</code>, <code style={{ background: 'var(--color-background-2)', padding: '2px 6px', borderRadius: '4px' }}>info</code>, <code style={{ background: 'var(--color-background-2)', padding: '2px 6px', borderRadius: '4px' }}>data</code>, <code style={{ background: 'var(--color-background-2)', padding: '2px 6px', borderRadius: '4px' }}>barColor</code>, <code style={{ background: 'var(--color-background-2)', padding: '2px 6px', borderRadius: '4px' }}>barRadius</code>, <code style={{ background: 'var(--color-background-2)', padding: '2px 6px', borderRadius: '4px' }}>barWidth</code>, <code style={{ background: 'var(--color-background-2)', padding: '2px 6px', borderRadius: '4px' }}>chartHeight</code>. Bar color defaults to <code style={{ background: 'var(--color-background-2)', padding: '2px 6px', borderRadius: '4px' }}>--color-text</code>.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <MetricCard label="No chart" value="42" />
            <MetricCard label="With chart" value="1,234" data={metricChartData} />
            <MetricCard label="With info" value="2.938.000" data={metricChartData} info="Data sourced from Galeri24 daily scraper" />
          </div>
        </div>

        {/* Badge */}
        <div id="comp-badge" className={styles.componentDemo}>
          <div className={styles.componentLabel}>Badge</div>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px', fontSize: '13px' }}>
            Inline badge component with size S and three type variants: neutral, positive, and negative. Uses <code style={{ background: 'var(--color-background-2)', padding: '2px 6px', borderRadius: '4px' }}>--radius-sm</code> (2px) and semantic color tokens (<code style={{ background: 'var(--color-background-2)', padding: '2px 6px', borderRadius: '4px' }}>--color-success</code>, <code style={{ background: 'var(--color-background-2)', padding: '2px 6px', borderRadius: '4px' }}>--color-danger</code>).
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Badge type="neutral">Neutral</Badge>
            <Badge type="positive">Active</Badge>
            <Badge type="negative">Inactive</Badge>
            <Badge type="neutral">BETA</Badge>
            <Badge type="positive">Available</Badge>
            <Badge type="negative">Sold Out</Badge>
          </div>
        </div>

        {/* Button */}
        <div id="comp-button" className={styles.componentDemo}>
          <div className={styles.componentLabel}>Button</div>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px', fontSize: '13px' }}>
            Primary, secondary, and danger button variants.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="danger">Danger Button</Button>
          </div>
        </div>

        {/* Card */}
        <div id="comp-card" className={styles.componentDemo}>
          <div className={styles.componentLabel}>Card</div>
          <CardGrid>
            <Card title="Metric Label" value="1,234" description="Supporting text" />
            <Card title="Another Card" value="Rp 500,000" description="Per gram" />
            <Card title="Status" value="Active" description="Since Jan 2026" />
          </CardGrid>
        </div>

        {/* Table */}
        <div id="comp-table" className={styles.componentDemo}>
          <div className={styles.componentLabel}>Table (Default)</div>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '12px', fontSize: '13px' }}>
            All tables use the same component with consistent styling across the application. Cell padding is 14px vertical, 8px horizontal.
          </p>
          <Table columns={demoTableColumns} data={demoTableData} />
        </div>

        {/* Table with Date Column */}
        <div className={styles.componentDemo}>
          <div className={styles.componentLabel}>Table (with Date Format)</div>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '12px', fontSize: '13px' }}>
            Tables with dates use the Indonesian date format consistently.
          </p>
          <Table columns={dateFormatColumns} data={dateFormatData} />
        </div>

        {/* DataRow */}
        <div id="comp-data-row" className={styles.componentDemo}>
          <div className={styles.componentLabel}>DataRow</div>
          <DataRow label="Label" value="Value" />
          <DataRow label="Buy Price" value="Rp 1,125,000" />
          <DataRow label="Status" value="Active" />
        </div>

        {/* Toast */}
        <div id="comp-toast" className={styles.componentDemo}>
          <div className={styles.componentLabel}>Toast</div>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '12px', fontSize: '13px' }}>
            Auto-dismissing notification component. Automatically closes after 3 seconds (configurable).
          </p>
          <Toast message="Data successfully saved!" onDismiss={() => {}} />
        </div>

        {/* Modal */}
        <div id="comp-modal" className={styles.componentDemo}>
          <div className={styles.componentLabel}>Modal</div>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '12px', fontSize: '13px' }}>
            Dialog component with title, content, and action buttons. Supports variants: primary (default), secondary, and danger for confirm button.
          </p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
            Usage: <code style={{ background: 'var(--color-background-2)', padding: '2px 6px', borderRadius: '4px' }}>&lt;Modal isOpen title="Title" onConfirm={'{'}callback{'}'} /&gt;</code>
          </p>
        </div>

        {/* Form Fields */}
        <div id="comp-form-fields" className={styles.componentDemo}>
          <div className={styles.componentLabel}>Form Fields</div>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px', fontSize: '13px' }}>
            Input components: TextField, Select, and DatePicker with labels and placeholder support.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TextField
              label="Text Input"
              value={formDemo.name}
              onChange={(v) => setFormDemo({ ...formDemo, name: v })}
              placeholder="Enter text"
            />
            <Select
              label="Dropdown Select"
              value={formDemo.brand}
              onChange={(v) => setFormDemo({ ...formDemo, brand: v })}
              options={['Antam', 'Galeri 24', 'Pegadaian']}
            />
            <DatePicker
              label="Date Picker"
              value={formDemo.date}
              onChange={(v) => setFormDemo({ ...formDemo, date: v })}
            />
          </div>
        </div>

        {/* PageHeader */}
        <div id="comp-page-header" className={styles.componentDemo}>
          <div className={styles.componentLabel}>PageHeader</div>
          <PageHeader title="Sample Page Title" description="This is a sample description for the page header component." />
        </div>

        {/* Toggle */}
        <div id="comp-toggle" className={styles.componentDemo}>
          <div className={styles.componentLabel}>Toggle</div>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px', fontSize: '13px' }}>
            Switch component for binary state. Props: <code style={{ background: 'var(--color-background-2)', padding: '2px 6px', borderRadius: '4px' }}>checked</code>, <code style={{ background: 'var(--color-background-2)', padding: '2px 6px', borderRadius: '4px' }}>onChange</code>, <code style={{ background: 'var(--color-background-2)', padding: '2px 6px', borderRadius: '4px' }}>disabled</code>, <code style={{ background: 'var(--color-background-2)', padding: '2px 6px', borderRadius: '4px' }}>tooltip</code>, <code style={{ background: 'var(--color-background-2)', padding: '2px 6px', borderRadius: '4px' }}>ariaLabel</code>. Click to toggle; tooltip appears on hover when disabled.
          </p>
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <Toggle checked={toggleOff} onChange={setToggleOff} ariaLabel="Demo off" />
              <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Off (interactive)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <Toggle checked={toggleOn} onChange={setToggleOn} ariaLabel="Demo on" />
              <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>On (interactive)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <Toggle checked={false} disabled tooltip="Hover for tooltip" ariaLabel="Demo disabled" />
              <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Disabled (with tooltip)</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div id="comp-sidebar" className={styles.componentDemo}>
          <div className={styles.componentLabel}>Sidebar</div>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px', fontSize: '13px' }}>
            Layout component (<code style={{ background: 'var(--color-background-2)', padding: '2px 6px', borderRadius: '4px' }}>src/components/layout/Sidebar.js</code>). Fixed-position vertical nav, visible on the left of every page. Responsive: full (≥1024px), icon-only (768–1023px), drawer (&lt;768px).
          </p>
          <div className={styles.sidebarMock} aria-hidden="true">
            <div className={styles.sidebarMockHeader}>
              <div className={styles.sidebarMockLogo}>
                <div className={styles.sidebarMockLogoDot} />
                <span className={styles.sidebarMockLogoText}>OhMyGold</span>
              </div>
              <span className={styles.sidebarMockBadge}>beta</span>
            </div>
            <div className={styles.sidebarMockNav}>
              <div className={`${styles.sidebarMockItem} ${styles.sidebarMockItemActive}`}>
                <span className={styles.sidebarMockDot} /> Overview
              </div>
              <div className={styles.sidebarMockItem}>
                <span className={styles.sidebarMockDot} /> My Assets
              </div>
              <div className={styles.sidebarMockGroupTitle}>Simulation</div>
              <div className={styles.sidebarMockItem}>
                <span className={styles.sidebarMockDot} /> Sell Simulation
              </div>
              <div className={styles.sidebarMockItem}>
                <span className={styles.sidebarMockDot} /> Buy Simulation
              </div>
              <div className={styles.sidebarMockGroupTitle}>Pricing Trends</div>
              <div className={styles.sidebarMockItem}>
                <span className={styles.sidebarMockDot} /> Retail price
              </div>
            </div>
            <div className={styles.sidebarMockFooter}>
              <span className={styles.sidebarMockFooterLabel}>Dark</span>
              <Toggle checked={false} disabled tooltip="Disabled in beta" ariaLabel="Demo dark toggle" />
            </div>
          </div>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '12px', fontSize: '12px' }}>
            Composition: logo header, nav items (with active state), grouped sub-nav, footer with Toggle.
          </p>
        </div>

        {/* Border Radius */}
        <div id="comp-border-radius" className={styles.componentDemo}>
          <div className={styles.componentLabel}>Border Radius</div>
          <Table columns={sampleColumns} data={radiusData} />
        </div>
      </Section>
    </>
  );
}
