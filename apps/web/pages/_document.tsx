import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  // Get the base path from environment or default to empty string
  const basePath = process.env.NODE_ENV === 'production' ? '/property-portal' : ''

  return (
    <Html lang="en">
      <Head>
        {/* Add base tag for GitHub Pages */}
        <base href={`${basePath}/`} />
      </Head>
      <body>
        <Main />
        <NextScript />

        {/* Script for GitHub Pages SPA routing */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  // Single Page Apps for GitHub Pages
                  // MIT License
                  // https://github.com/rafgraph/spa-github-pages
                  var pathSegmentsToKeep = 1;

                  var l = window.location;
                  if (l.search[1] === '/') {
                    var decoded = l.search.slice(1).split('&').map(function(s) { 
                      return s.replace(/~and~/g, '&')
                    }).join('?');
                    window.history.replaceState(null, null,
                      l.pathname.slice(0, -1) + decoded + l.hash
                    );
                  }

                  var gitHubPages = /github\\.io/.test(l.hostname);
                  if (gitHubPages) {
                    pathSegmentsToKeep = 2;
                  }

                  l.replace(
                    l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
                    l.pathname.split('/').slice(0, pathSegmentsToKeep).join('/') + '/?/' +
                    l.pathname.slice(1).split('/').slice(pathSegmentsToKeep - 1).join('/').replace(/&/g, '~and~') +
                    (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
                    l.hash
                  );
                })();
              `,
            }}
          />
        )}
      </body>
    </Html>
  )
}
