import { Injectable } from '@nestjs/common';

@Injectable()
export class PiiShieldService {
  private readonly EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  private readonly PHONE_REGEX = /(?:\+90|0)?\s?[1-9]\d{2}\s?\d{3}\s?\d{2}\s?\d{2}/g;
  private readonly TC_KIMLIK_REGEX = /[1-9]\d{10}/g;
  private readonly CREDIT_CARD_REGEX = /(?:\d{4}[-\s]?){3}\d{4}/g;

  /**
   * Redacts PII from the given text and stores the original values in the provided piiVault.
   */
  redact(text: string, piiVault: Record<string, string>): string {
    if (!text) return text;

    let redactedText = text;
    let emailCount = Object.keys(piiVault).filter(k => k.startsWith('[REDACTED_EMAIL_')).length;
    let phoneCount = Object.keys(piiVault).filter(k => k.startsWith('[REDACTED_PHONE_')).length;
    let tcCount = Object.keys(piiVault).filter(k => k.startsWith('[REDACTED_TC_')).length;
    let ccCount = Object.keys(piiVault).filter(k => k.startsWith('[REDACTED_CC_')).length;

    // Redact Emails
    redactedText = redactedText.replace(this.EMAIL_REGEX, (match) => {
      emailCount++;
      const id = `[REDACTED_EMAIL_${emailCount}]`;
      piiVault[id] = match;
      return id;
    });

    // Redact Phones
    redactedText = redactedText.replace(this.PHONE_REGEX, (match) => {
      phoneCount++;
      const id = `[REDACTED_PHONE_${phoneCount}]`;
      piiVault[id] = match;
      return id;
    });

    // Redact TC Kimlik
    redactedText = redactedText.replace(this.TC_KIMLIK_REGEX, (match) => {
      tcCount++;
      const id = `[REDACTED_TC_${tcCount}]`;
      piiVault[id] = match;
      return id;
    });

    // Redact Credit Cards
    redactedText = redactedText.replace(this.CREDIT_CARD_REGEX, (match) => {
      ccCount++;
      const id = `[REDACTED_CC_${ccCount}]`;
      piiVault[id] = match;
      return id;
    });

    return redactedText;
  }

  /**
   * Restores redacted text using the piiVault mappings.
   */
  restore(text: string, piiVault: Record<string, string>): string {
    if (!text || !piiVault) return text;

    let restoredText = text;
    for (const [id, originalValue] of Object.entries(piiVault)) {
      // Escape the brackets in the id for the regex
      const safeId = id.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
      const regex = new RegExp(safeId, 'g');
      restoredText = restoredText.replace(regex, originalValue);
    }
    return restoredText;
  }
}
