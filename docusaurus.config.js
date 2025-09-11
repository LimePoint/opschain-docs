// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer').themes.github
const darkCodeTheme = require('prism-react-renderer').themes.dracula

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'OpsChain documentation',
  tagline:
    'Connect, automate, and orchestrate people, processes, and tools across your on-premise and cloud platforms.',
  url: 'https://docs.opschain.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  onBrokenMarkdownLinks: 'throw',
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
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'OpsChain',
        logo: {
          alt: 'OpsChain logo',
          src: 'img/logo.png',
        },
        items: [
          // {
          //   label: 'OpsChain overview',
          //   to: '/docs/',
          // },
          {
            label: 'OpsChain CLI download',
            href: 'https://github.com/LimePoint/opschain/releases',
          },
          {
            label: 'OpsChain API reference',
            href: 'pathname:///api-docs/',
          },
          {
            type: 'docsVersionDropdown',
            position: 'right',
            dropdownActiveClassDisabled: true,
          },
        ],
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
                to: 'https://opschain.io/blog',
              },
            ],
          },
          {},
          {
            title: 'Other',
            items: [
              {
                label: 'OpsChain licence',
                to: '/docs/licence',
              },
              {
                html: '<a class=footer__link-item href=/files/THIRD-PARTY-SOFTWARE.txt download=THIRD-PARTY-SOFTWARE.txt target=_blank>Third party software licences</a>',
              },
              {
                label: 'LimePoint EULA',
                to: 'https://opschain.io/eula',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} LimePoint Pty Ltd. All rights reserved.<br />Use of this website is governed by the <a style=color:inherit href=https://opschain.io/eula>LimePoint EULA</a>.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['ruby', 'bash', 'docker', 'yaml', 'json'],
      },
    }),
  plugins: [[require.resolve('@easyops-cn/docusaurus-search-local'), { hashed: true }]],
}

module.exports = config
