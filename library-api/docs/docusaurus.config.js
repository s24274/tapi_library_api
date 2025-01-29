const config = {
  title: 'Library API Documentation',
  tagline: 'Documentation for Library Management System',
  url: 'http://localhost:3000',
  baseUrl: '/',
  organizationName: 'your-org',
  projectName: 'library-api',

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Library API',
      items: [
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: '/api-docs',
          label: 'API Reference',
          position: 'left',
        },
        {
          href: '/graphql',
          label: 'GraphQL Playground',
          position: 'left',
        },
        {
          href: 'https://github.com/yourusername/library-api',
          label: 'GitHub',
          position: 'right',
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
              label: 'Getting Started',
              to: '/intro',
            },
            {
              label: 'API Reference',
              to: '/api-docs',
            },
          ],
        },
      ],
    },
  },
};

module.exports = config; 