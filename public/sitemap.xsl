<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html>
      <head>
        <title>Sitemap</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #1a1a1a; }
          h1 { font-size: 20px; margin-bottom: 12px; }
          ul { padding-left: 18px; }
          li { margin: 6px 0; }
          a { color: #0a5ad6; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .count { color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Sitemap</h1>
        <div class="count">
          <xsl:text>Total URLs: </xsl:text>
          <xsl:value-of select="count(sitemap:urlset/sitemap:url)" />
        </div>
        <ul>
          <xsl:for-each select="sitemap:urlset/sitemap:url">
            <li>
              <a>
                <xsl:attribute name="href">
                  <xsl:value-of select="sitemap:loc" />
                </xsl:attribute>
                <xsl:value-of select="sitemap:loc" />
              </a>
            </li>
          </xsl:for-each>
        </ul>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
