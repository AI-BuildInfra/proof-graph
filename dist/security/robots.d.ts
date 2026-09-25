/**
 * ProofGraph Robots.txt Parser & Compliance Engine
 */
export interface RobotsRule {
    userAgent: string;
    disallow: string[];
    allow: string[];
    crawlDelay?: number;
}
export declare class RobotsParser {
    private rules;
    constructor(robotsTxtContent?: string);
    parse(content: string): void;
    isAllowed(pathname: string, userAgent?: string): boolean;
}
