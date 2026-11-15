import { Bullet, Heading, Page, Para } from '../components/Page';
import { useT } from '../i18n';

export default function TermsScreen() {
  const t = useT();
  return (
    <Page title={t('terms_title')}>
      <Para>{t('updated')}</Para>
      <Heading>{t('terms_h1')}</Heading>
      <Para>{t('terms_p1')}</Para>
      <Heading>{t('terms_h2')}</Heading>
      <Para>{t('terms_p2')}</Para>
      <Heading>{t('terms_h3')}</Heading>
      <Para>{t('terms_p3')}</Para>
      <Heading>{t('terms_h4')}</Heading>
      <Para>{t('terms_p4')}</Para>
      <Heading>{t('terms_h5')}</Heading>
      <Bullet>{t('terms_b1')}</Bullet>
      <Bullet>{t('terms_b2')}</Bullet>
      <Heading>{t('terms_h6')}</Heading>
      <Para>{t('terms_p5')}</Para>
      <Heading>{t('terms_h7')}</Heading>
      <Para>{t('terms_p6')}</Para>
    </Page>
  );
}
