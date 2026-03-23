import React from 'react';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { TIER_FEATURES, TIER_LABELS } from '../lib/tiers';
import { Check, Star, Shield, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const TIERS = ['community', 'cloud', 'enterprise'] as const;

const FEATURE_KEYS: Record<string, string[]> = {
  community: ['projects', 'export', 'ai', 'collaboration', 'support'],
  cloud: ['projects', 'export', 'ai', 'collaboration', 'support'],
  enterprise: ['projects', 'export', 'ai', 'collaboration', 'sso', 'audit', 'support'],
};

const FAQ_KEYS = ['byok', 'selfHost', 'trial'] as const;

const PricingPage: React.FC = () => {
  const { t } = useAppTranslation('pricing');
  const [openFaq, setOpenFaq] = React.useState<string | null>(null);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1
          className="text-display"
          style={{ color: 'var(--color-text-primary)', marginBottom: 12 }}
        >
          {t('title')}
        </h1>
        <p
          className="text-subheading"
          style={{ color: 'var(--color-text-secondary)', maxWidth: 520, margin: '0 auto' }}
        >
          {t('subtitle')}
        </p>
      </div>

      {/* Pricing Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
          marginBottom: 64,
        }}
      >
        {TIERS.map((tier) => {
          const isPopular = tier === 'cloud';
          return (
            <div
              key={tier}
              style={{
                position: 'relative',
                borderRadius: 12,
                border: isPopular
                  ? '2px solid var(--color-accent)'
                  : '1px solid var(--color-border)',
                background: 'var(--color-bg-elevated)',
                padding: 32,
                display: 'flex',
                flexDirection: 'column',
                ...(isPopular
                  ? { boxShadow: '0 0 24px rgba(212, 166, 86, 0.12)' }
                  : {}),
              }}
            >
              {/* Popular badge */}
              {isPopular && (
                <div
                  style={{
                    position: 'absolute',
                    top: -13,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--color-accent)',
                    color: '#000',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '4px 16px',
                    borderRadius: 20,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Star size={12} style={{ display: 'inline', verticalAlign: -1, marginRight: 4 }} />
                  {t('cloud.popular')}
                </div>
              )}

              {/* Tier icon */}
              <div style={{ marginBottom: 16 }}>
                {tier === 'enterprise' ? (
                  <Shield size={28} style={{ color: 'var(--color-accent)' }} />
                ) : tier === 'cloud' ? (
                  <Star size={28} style={{ color: 'var(--color-accent)' }} />
                ) : (
                  <Check size={28} style={{ color: 'var(--color-accent)' }} />
                )}
              </div>

              {/* Name & price */}
              <h2
                className="text-heading"
                style={{ color: 'var(--color-text-primary)', marginBottom: 4 }}
              >
                {t(`${tier}.name`)}
              </h2>
              <div style={{ marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 36,
                    fontWeight: 800,
                    color: 'var(--color-text-primary)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {t(`${tier}.price`)}
                </span>
                {tier === 'cloud' && (
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
                    {t('cloud.priceUnit')}
                  </span>
                )}
              </div>
              <p
                className="text-small"
                style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}
              >
                {t(`${tier}.priceNote`)}
              </p>
              <p
                style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: 14,
                  lineHeight: 1.6,
                  marginBottom: 24,
                  minHeight: 44,
                }}
              >
                {t(`${tier}.description`)}
              </p>

              {/* Features */}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                {FEATURE_KEYS[tier].map((fk) => (
                  <li
                    key={fk}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      marginBottom: 12,
                      fontSize: 14,
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    <Check
                      size={16}
                      style={{
                        color: 'var(--color-accent)',
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    />
                    <span>{t(`${tier}.features.${fk}`)}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                style={{
                  marginTop: 24,
                  width: '100%',
                  padding: '12px 0',
                  borderRadius: 8,
                  border: isPopular ? 'none' : '1px solid var(--color-border)',
                  background: isPopular ? 'var(--color-accent)' : 'transparent',
                  color: isPopular ? '#000' : 'var(--color-text-primary)',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  if (!isPopular) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      'var(--color-border-hover)';
                    (e.currentTarget as HTMLButtonElement).style.background =
                      'var(--color-bg-hover)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isPopular) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      'var(--color-border)';
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  }
                }}
              >
                {t(`${tier}.cta`)}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <h2
          className="text-heading"
          style={{
            color: 'var(--color-text-primary)',
            textAlign: 'center',
            marginBottom: 32,
          }}
        >
          <HelpCircle
            size={20}
            style={{ display: 'inline', verticalAlign: -3, marginRight: 8, color: 'var(--color-accent)' }}
          />
          {t('faq.title')}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQ_KEYS.map((fk) => {
            const isOpen = openFaq === fk;
            return (
              <div
                key={fk}
                style={{
                  borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-elevated)',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : fk)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 20px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-primary)',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'start',
                  }}
                >
                  {t(`faq.${fk}.q`)}
                  {isOpen ? (
                    <ChevronUp size={16} style={{ flexShrink: 0, color: 'var(--color-text-muted)' }} />
                  ) : (
                    <ChevronDown size={16} style={{ flexShrink: 0, color: 'var(--color-text-muted)' }} />
                  )}
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: '0 20px 16px',
                      fontSize: 14,
                      lineHeight: 1.7,
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {t(`faq.${fk}.a`)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
