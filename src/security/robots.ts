/**
 * ProofGraph Robots.txt Parser & Compliance Engine
 */

export interface RobotsRule {
  userAgent: string;
  disallow: string[];
  allow: string[];
  crawlDelay?: number;
}

export class RobotsParser {
  private rules: RobotsRule[] = [];

  constructor(robotsTxtContent?: string) {
    if (robotsTxtContent) {
      this.parse(robotsTxtContent);
    }
  }

  public parse(content: string): void {
    const lines = content.split(/\r?\n/);
    let currentUserAgent = '*';
    let currentDisallows: string[] = [];
    let currentAllows: string[] = [];
    let currentDelay: number | undefined;

    for (const rawLine of lines) {
      const line = rawLine.replace(/#.*$/, '').trim();
      if (!line) continue;

      const [key, ...rest] = line.split(':');
      const directive = key.trim().toLowerCase();
      const value = rest.join(':').trim();

      if (directive === 'user-agent') {
        if (currentDisallows.length > 0 || currentAllows.length > 0) {
          this.rules.push({
            userAgent: currentUserAgent,
            disallow: currentDisallows,
            allow: currentAllows,
            crawlDelay: currentDelay,
          });
          currentDisallows = [];
          currentAllows = [];
          currentDelay = undefined;
        }
        currentUserAgent = value.toLowerCase();
      } else if (directive === 'disallow') {
        if (value) currentDisallows.push(value);
      } else if (directive === 'allow') {
        if (value) currentAllows.push(value);
      } else if (directive === 'crawl-delay') {
        currentDelay = parseFloat(value) || undefined;
      }
    }

    if (currentDisallows.length > 0 || currentAllows.length > 0) {
      this.rules.push({
        userAgent: currentUserAgent,
        disallow: currentDisallows,
        allow: currentAllows,
        crawlDelay: currentDelay,
      });
    }
  }

  public isAllowed(pathname: string, userAgent = 'ProofGraph-Bot'): boolean {
    const ua = userAgent.toLowerCase();
    const matchingRule =
      this.rules.find(r => r.userAgent === ua) ||
      this.rules.find(r => r.userAgent === '*');

    if (!matchingRule) return true;

    // Check allow first
    for (const allowPath of matchingRule.allow) {
      if (pathname.startsWith(allowPath)) return true;
    }

    // Check disallow
    for (const disallowPath of matchingRule.disallow) {
      if (pathname.startsWith(disallowPath)) return false;
    }

    return true;
  }
}
