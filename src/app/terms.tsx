import { Bullet, Heading, Page, Para } from '../components/Page';

export default function TermsScreen() {
  return (
    <Page title="Terms">
      <Para>Last updated 14 November 2026.</Para>

      <Heading>Using Sudoku</Heading>
      <Para>
        By using Sudoku you agree to these terms. Sudoku is for personal, family and friends use. It is free, has no
        ads, and is not sold.
      </Para>

      <Heading>No commercial use</Heading>
      <Para>
        You may not sell the app, charge for it, or use it in a commercial product. It is not a commercial product,
        and it does not replicate any commercial product.
      </Para>

      <Heading>Provided as it is</Heading>
      <Para>
        The app is provided as it is, without warranties of any kind. Puzzles, stats and saved progress are kept on
        your device, and we cannot recover them if they are lost. Back up what matters to you.
      </Para>

      <Heading>Grown-ups and children</Heading>
      <Para>
        A grown-up should supervise children using the app and decide what settings suit them. Parent lock and
        Kid-safe mode are there to help.
      </Para>

      <Heading>Acceptable use</Heading>
      <Bullet>Do not try to break, copy or resell the app.</Bullet>
      <Bullet>Do not use the app to harm anyone.</Bullet>

      <Heading>Ownership</Heading>
      <Para>
        The code and artwork belong to the developer, kamalsoft. Sudoku is a classic puzzle. No code has been copied
        from any commercial game.
      </Para>

      <Heading>Changes and questions</Heading>
      <Para>
        These terms may change. The newest version is shown in the app. Ask questions on the project&apos;s GitHub page.
      </Para>
    </Page>
  );
}
