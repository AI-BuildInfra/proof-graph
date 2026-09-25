/**
 * ProofGraph Schema.org Structured Data Generator & Validator
 * Produces compliant JSON-LD grounded purely in verified facts
 */
import { Entity } from '../types/index.js';
export declare class SchemaOrgGenerator {
    static generateOrganization(entity: Entity): Record<string, any>;
    static generateSoftwareApplication(entity: Entity): Record<string, any>;
    static generateService(entity: Entity): Record<string, any>;
    static generateArticle(entity: Entity): Record<string, any>;
    static generateForEntity(entity: Entity): Record<string, any>;
}
