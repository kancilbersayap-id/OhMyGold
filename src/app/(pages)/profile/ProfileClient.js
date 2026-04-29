'use client';

import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import MyAssetsClient from './MyAssetsTab';
import SettingsTab from './SettingsTab';

const TAB_OPTIONS = [
  { value: 'my-assets', label: 'My Assets' },
  { value: 'settings', label: 'Settings' },
];

export default function ProfileClient({ initialHoldings, userId, email }) {
  const [tab, setTab] = useState('my-assets');
  const [addTrigger, setAddTrigger] = useState(0);

  const headerAction =
    tab === 'my-assets' ? (
      <Button onClick={() => setAddTrigger((t) => t + 1)}>Add gold holdings</Button>
    ) : null;

  return (
    <>
      <PageHeader
        title="Profile"
        description="Your account information and gold holdings"
        action={headerAction}
      />
      <Tabs tabs={TAB_OPTIONS} value={tab} onChange={setTab} />
      {tab === 'my-assets' && (
        <MyAssetsClient
          initialData={initialHoldings}
          userId={userId}
          hideHeader
          addTrigger={addTrigger}
        />
      )}
      {tab === 'settings' && <SettingsTab initialEmail={email} />}
    </>
  );
}
