/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://bettercomponents.vercel.app',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: [
    '/api/*',
    '/admin/*',
    '/private/*',
    '/_next/*',
    '/404',
    '/500',
  ],
  changefreq: 'weekly', 
  priority: 0.7,        
  trailingSlash: false,
  sourceMap: false,
};