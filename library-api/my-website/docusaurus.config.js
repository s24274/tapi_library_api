// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Library API Documentation',
  tagline: 'Dokumentacja systemu zarządzania biblioteką',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'http://localhost:3001',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'library', // Usually your GitHub org/user name.
  projectName: 'library-api', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
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
          sidebarPath: './sidebars.js',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Library API',
        logo: {
          alt: 'Library Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Dokumentacja',
          },
          {
            type: 'doc',
            docId: 'api/rest',
            position: 'left',
            label: 'REST API',
          },
          {
            type: 'doc',
            docId: 'api/graphql',
            position: 'left',
            label: 'GraphQL API',
          },
          {
            href: 'http://localhost:3000/api-docs',
            label: 'Swagger UI',
            position: 'right',
            target: '_blank'
          },
          {
            href: 'http://localhost:3000/graphql',
            label: 'GraphQL Playground',
            position: 'right',
            target: '_blank'
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Wprowadzenie',
                to: '/intro',
              },
              {
                label: 'REST API',
                to: '/api/rest',
              },
              {
                label: 'GraphQL API',
                to: '/api/graphql',
              },
            ],
          },
          {
            title: 'API',
            items: [
              {
                label: 'Swagger UI',
                href: 'http://localhost:3000/api-docs',
                target: '_blank'
              },
              {
                label: 'GraphQL Playground',
                href: 'http://localhost:3000/graphql',
                target: '_blank'
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Library API. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
