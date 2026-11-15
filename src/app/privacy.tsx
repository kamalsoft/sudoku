import { Bullet, Heading, Page, Para } from '../components/Page';

export default function PrivacyScreen() {
  return (
    <Page title="Privacy">
      <Para>Last updated 14 November 2026.</Para>

      <Heading>What we collect</Heading>
      <Para>
        Nothing personal. Sudoku has no accounts and no sign-in. The only personal detail is the player name you
        type in Settings, which is kept on your device.
      </Para>

      <Heading>Where your data lives</Heading>
      <Bullet>Games, stats, badges, player profiles and settings are stored on this device only.</Bullet>
      <Bullet>On the web, they are kept in your browser&apos;s storage. Clearing the site&apos;s data deletes them.</Bullet>
      <Bullet>Nothing is sent to us or to anyone else. There are no ads, no analytics and no tracking.</Bullet>

      <Heading>Children</Heading>
      <Para>
        Sudoku is made for children, with a grown-up in mind. It does not ask for, collect or share a child&apos;s
        personal information. Parent lock keeps Settings and the parent summary behind a grown-up&apos;s sum.
      </Para>

      <Heading>Web hosting</Heading>
      <Para>
        The web version is served by GitHub Pages. Like any website, the host may keep standard server logs, such as
        the time of a visit. The app does not add to them.
      </Para>

      <Heading>Deleting your data</Heading>
      <Bullet>Settings, then Players, then Delete player removes one player&apos;s games, stats and settings.</Bullet>
      <Bullet>Clearing the site&apos;s data in your browser removes everything on the web.</Bullet>
      <Bullet>Uninstalling the app removes everything on a phone.</Bullet>

      <Heading>Questions</Heading>
      <Para>Ask on the project&apos;s GitHub page. Changes to this page appear in the app.</Para>
    </Page>
  );
}
