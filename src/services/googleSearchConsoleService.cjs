/**
 * Google Search Console API Service
 * Handles read-only integration with Google Search Console
 * All credentials stored securely server-side only
 */

const { google } = require('googleapis');
const fs = require('fs');

class GoogleSearchConsoleService {
  constructor() {
    this.auth = null;
    this.webmasters = null;
    this.initialized = false;
    this.cache = new Map();
    this.cacheExpiry = 3600000; // 1 hour
  }

  async initialize() {
    try {
      const credentialsJson = process.env.GSC_SERVICE_ACCOUNT_JSON;
      
      if (!credentialsJson) {
        console.warn('[GSC] GSC_SERVICE_ACCOUNT_JSON not configured - Google Search Console API disabled');
        return false;
      }

      try {
        const credentials = JSON.parse(credentialsJson);
        
        this.auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
        });

        this.webmasters = google.webmasters({
          version: 'v3',
          auth: this.auth,
        });

        console.log('[GSC] Successfully initialized with Service Account');
        this.initialized = true;
        return true;
      } catch (parseError) {
        console.error('[GSC] Invalid credentials JSON format:', parseError.message);
        return false;
      }
    } catch (error) {
      console.error('[GSC] Initialization error:', error.message);
      return false;
    }
  }

  /**
   * Get cached data or fetch fresh data
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      console.log(`[GSC] Cache hit: ${key}`);
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.cacheExpiry,
    });
  }

  /**
   * List verified properties
   */
  async listSites() {
    try {
      if (!this.initialized) {
        return { error: 'GSC not initialized', sites: [] };
      }

      const cacheKey = 'gsc_sites';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const response = await this.webmasters.sites.list();
      const sites = response.data.siteEntry || [];
      
      const result = {
        sites: sites.map(site => ({
          url: site.siteUrl,
          permissionLevel: site.permissionLevel,
          verified: site.permissionLevel !== 'siteUnverifiedUser',
        })),
      };

      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('[GSC] Error listing sites:', error.message);
      
      if (error.status === 401) {
        return { error: 'Authentication failed - check Service Account credentials', sites: [] };
      }
      if (error.status === 403) {
        return { error: 'Permission denied - Service Account not added to Search Console', sites: [] };
      }
      
      return { error: error.message, sites: [] };
    }
  }

  /**
   * Get search analytics data
   */
  async getSearchAnalytics(siteUrl, options = {}) {
    try {
      if (!this.initialized) {
        return { error: 'GSC not initialized', data: [] };
      }

      const {
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate = new Date().toISOString().split('T')[0],
        page = null,
        rowLimit = 25000,
      } = options;

      const cacheKey = `gsc_analytics_${siteUrl}_${startDate}_${endDate}_${page || 'all'}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const requestBody = {
        startDate,
        endDate,
        dimensions: ['query', 'page', 'country', 'device'],
        rowLimit,
      };

      if (page) {
        requestBody.dimensionFilterGroups = [
          {
            filters: [
              {
                dimension: 'page',
                operator: 'EQUALS',
                value: page,
              },
            ],
          },
        ];
      }

      const response = await this.webmasters.searchanalytics.query({
        siteUrl,
        requestBody,
      });

      const rows = response.data.rows || [];
      
      const data = rows.map(row => ({
        query: row.keys[0] || 'unknown',
        page: row.keys[1] || 'unknown',
        country: row.keys[2] || 'all',
        device: row.keys[3] || 'all',
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr ? (row.ctr * 100).toFixed(2) : 0,
        position: row.position ? row.position.toFixed(1) : 0,
      }));

      const result = { data, rowCount: rows.length };
      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('[GSC] Error fetching search analytics:', error.message);
      
      if (error.status === 401) {
        return { error: 'Authentication failed', data: [] };
      }
      if (error.status === 403) {
        return { error: 'Permission denied for this property', data: [] };
      }
      if (error.message.includes('not found')) {
        return { error: 'Search data not available yet - property may be new', data: [] };
      }
      
      return { error: error.message, data: [] };
    }
  }

  /**
   * Get sitemaps
   */
  async getSitemaps(siteUrl) {
    try {
      if (!this.initialized) {
        return { error: 'GSC not initialized', sitemaps: [] };
      }

      const cacheKey = `gsc_sitemaps_${siteUrl}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const response = await this.webmasters.sitemaps.list({
        siteUrl,
      });

      const sitemaps = (response.data.sitemap || []).map(sm => ({
        path: sm.path,
        lastSubmitted: sm.lastSubmitted,
        lastDownloaded: sm.lastDownloaded,
        isPending: sm.isSitemapIndex === undefined ? false : !sm.lastDownloaded,
        isSitemapIndex: sm.isSitemapIndex || false,
        type: sm.type,
        warnings: sm.warnings || 0,
        errors: sm.errors || 0,
      }));

      const result = { sitemaps };
      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('[GSC] Error fetching sitemaps:', error.message);
      
      if (error.status === 401) {
        return { error: 'Authentication failed', sitemaps: [] };
      }
      if (error.status === 403) {
        return { error: 'Permission denied for this property', sitemaps: [] };
      }
      if (error.message.includes('not found')) {
        return { error: 'No sitemaps found - may not be submitted yet', sitemaps: [] };
      }
      
      return { error: error.message, sitemaps: [] };
    }
  }

  /**
   * Clear cache (for testing/manual refresh)
   */
  clearCache() {
    this.cache.clear();
    console.log('[GSC] Cache cleared');
  }
}

module.exports = GoogleSearchConsoleService;
