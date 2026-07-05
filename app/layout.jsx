import './globals.css';

export const metadata = {
  title: 'Tanoto Foundation \u00b7 TFID Portfolio Assessment',
  description: 'TFID Portfolio Review \u2014 6-Factor Strategic Assessment, Maturity, Level of Change, Pathway to Scale.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
