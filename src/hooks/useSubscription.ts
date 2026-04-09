'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface SubscriptionState {
  plan: 'free' | 'pro' | 'event';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  isActive: boolean;
  isPro: boolean;
  isEvent: boolean;
  loading: boolean;
}

export function useSubscription(tenantId: string | undefined): SubscriptionState {
  const [state, setState] = useState<SubscriptionState>({
    plan: 'free',
    status: 'active',
    isActive: false,
    isPro: false,
    isEvent: false,
    loading: true,
  });

  useEffect(() => {
    if (!tenantId) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    async function fetchSubscription() {
      const { data } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('tenant_id', tenantId)
        .single();

      if (data) {
        const plan = data.plan as 'free' | 'pro' | 'event';
        const status = data.status as 'active' | 'canceled' | 'past_due' | 'trialing';
        const isActive = status === 'active' || status === 'trialing';

        setState({
          plan,
          status,
          isActive,
          isPro: isActive && (plan === 'pro' || plan === 'event'),
          isEvent: isActive && plan === 'event',
          loading: false,
        });
      } else {
        setState({
          plan: 'free',
          status: 'active',
          isActive: false,
          isPro: false,
          isEvent: false,
          loading: false,
        });
      }
    }

    fetchSubscription();
  }, [tenantId]);

  return state;
}
