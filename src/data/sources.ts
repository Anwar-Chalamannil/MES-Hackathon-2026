import type { Source } from '../engine/types';

/**
 * Where researched records come from. `evidence` says how well we saw it:
 * - read_directly: the page itself was opened and read.
 * - search_snippet: only seen in a search result excerpt (not verified).
 * - third_party: from a source that is not the provider and not Qatar-specific.
 * Classification rules (enforced by data.test.ts): "researched" and "high confidence" need read_directly.
 */
export const sources: Source[] = [
  { id: 'jollibee-menu', url: 'https://jollibee.qa/menu', title: 'Jollibee Qatar menu', accessed: '2026-11-05', evidence: 'read_directly' },
  { id: 'talabat-terms', url: 'https://www.talabat.com/qatar/terms', title: 'Talabat Qatar terms (talabat pro)', accessed: '2026-11-05', evidence: 'read_directly' },
  { id: 'dukhan-rafeeq-tc-pdf', url: 'https://www.dukhanbank.com/sites/default/files/2026/pdfs/RafeeqTC-2026-02-24.pdf', title: 'Dukhan Bank x Rafeeq offer terms (17 Feb to 19 Mar 2026)', accessed: '2026-11-05', evidence: 'read_directly' },
  { id: 'dukhan-rafeeq-pro', url: 'https://www.dukhanbank.com/rafeeq-pro-campaign', title: 'Dukhan Bank Rafeeq Pro campaign', accessed: '2026-11-05', evidence: 'read_directly' },
  { id: 'keeta-launch-iamqatar', url: 'https://iamqatar.qa/pages/feed-post/keeta-officially-launches-in-qatar-offering-free-delivery-and-200-qar-in-vouchers-to-all-new-users/', title: 'Keeta launches in Qatar (Aug 2025)', accessed: '2026-11-05', evidence: 'read_directly' },
  { id: 'ananinja-faq', url: 'https://ananinja.com/qa/ar/faq', title: 'Ninja FAQ (Arabic)', accessed: '2026-11-05', evidence: 'read_directly' },
  { id: 'wellcare-home', url: 'https://www.wellcareonline.com/', title: 'Wellcare Pharmacy online store', accessed: '2026-11-05', evidence: 'read_directly' },
  { id: 'snoonu-plus-qatarliving', url: 'https://www.qatarliving.com/en/article/snoonu-launches-version-55-one-app-endless-possibilities', title: 'Snoonu 5.5 launch (Qatar Living)', accessed: '2026-11-05', evidence: 'search_snippet' },
  { id: 'carrefour-snippet', url: 'https://www.carrefourqatar.com/mafqat/en/helpcenter/topics/262?articleId=4025', title: 'Carrefour Qatar help centre and product pages', accessed: '2026-11-05', evidence: 'search_snippet' },
  { id: 'lulu-mastercard-snippet', url: 'https://gcc.luluhypermarket.com/en-qa/terms-and-conditions/mastercard-qa/', title: 'LuLu Mastercard terms (Qatar)', accessed: '2026-11-05', evidence: 'search_snippet' },
  { id: 'mox-keeta-pdf', url: 'https://mox.com/static/New_to_Keeta_MEO.pdf', title: 'Mox x Keeta new user offer (not Qatar)', accessed: '2026-11-05', evidence: 'third_party' },
];
