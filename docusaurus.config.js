// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github')
const darkCodeTheme = require('prism-react-renderer/themes/dracula')

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'OpsChain documentation',
  tagline:
    'Connect, automate, and orchestrate people, processes, and tools across your on-premise and cloud platforms.',
  url: 'https://docs.opschain.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'OpsChain',
        logo: {
          alt: 'OpsChain logo',
          src: 'img/logo.svg',
        },
        items: [],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Links',
            items: [
              {
                label: 'LimePoint',
                to: 'https://www.limepoint.com/',
              },
              {
                label: 'OpsChain',
                to: 'https://opschain.io/',
              },
              {
                label: 'Blog',
                to: 'https://www.limepoint.com/blog/tag/opschain',
              },
            ],
          },
          {},
          {
            title: 'Other',
            items: [
              {
                html: '<a class=footer__link-item href=/files/LICENCE.md download=LICENCE.md target=_blank>OpsChain licence</a>',
              },
              {
                html: '<a class=footer__link-item href=/files/THIRD-PARTY-SOFTWARE.txt download=THIRD-PARTY-SOFTWARE.txt target=_blank>Third party software licences</a>',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} LimePoint Pty Ltd. All rights reserved.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
  plugins: [[require.resolve('@easyops-cn/docusaurus-search-local'), { hashed: true }]],
}

module.exports = config
