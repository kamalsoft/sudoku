import { Bullet, Heading, Page, Para } from '../components/Page';
import { useT } from '../i18n';

export default function PrivacyScreen() {
  const t = useT();
  return (
    <Page title={t('privacy_title')}>
      <Para>{t('updated')}</Para>
      <Heading>{t('priv_h1')}</Heading>
      <Para>{t('priv_p1')}</Para>
      <Heading>{t('priv_h2')}</Heading>
      <Bullet>{t('priv_b1')}</Bullet>
      <Bullet>{t('priv_b2')}</Bullet>
      <Bullet>{t('priv_b3')}</Bullet>
      <Heading>{t('priv_h3')}</Heading>
      <Para>{t('priv_p2')}</Para>
      <Heading>{t('priv_h4')}</Heading>
      <Para>{t('priv_p3')}</Para>
      <Heading>{t('priv_h5')}</Heading>
      <Bullet>{t('priv_b4')}</Bullet>
      <Bullet>{t('priv_b5')}</Bullet>
      <Bullet>{t('priv_b6')}</Bullet>
      <Heading>{t('priv_h6')}</Heading>
      <Para>{t('priv_p4')}</Para>
    </Page>
  );
}
