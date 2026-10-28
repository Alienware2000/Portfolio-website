// Invented demo data. Every name, branch and number here is fictional; numbers are
// masked on screen. Countries and calling codes are real (src/lib/hub/calling-codes.ts).

export const HUB_ID = "hub-malawi";

export const CHURCHES = [
  "Cedar Hill Assembly",
  "Grace Covenant Chapel",
  "Harvest Point Church",
  "Hope City Church",
  "Mount Zion Fellowship",
  "Victory Tabernacle",
];

export const FILE_NAME = "malawi-partners-oct.xlsx";
export const SHEET_NAME = "Partners";

// Column titles are deliberately unhelpful: "Cell" is the WhatsApp column.
export const SHEET = [
  ["#", "Full name", "Cell", "Local church", "Joined"],
  ["1", "Chisomo Kalua", "0888 412 907", "Grace Covenant Chapel", "Mar 2025"],
  ["2", "Mphatso Msiska", "0999 123 456", "Hope City Church", "Apr 2025"],
  ["3", "Tiwonge", "265 991 550 218", "Victory Tabernacle", "Apr 2025"],
  ["4", "Kondwani Nyasulu", "999 304 771", "Cedar Hill Assembly", "Jun 2025"],
  ["5", "Ulemu Chirwa", "+265 884 220 613", "  cedar hill  ASSEMBLY", "Jul 2025"],
  ["6", "Yamikani Chisale", "0995 618 220", "Mt Zion Fellowship", "Aug 2025"],
  ["7", "Thokozani Makoni", "0997 402 115", "Harvest Point Church", "Sep 2025"],
];

// Ulemu is already this hub's partner (same name, same number: an update, Decision 0028).
// Thokozani's number belongs to another hub, so that row is blocked.
export const EXISTING_PARTNERS = [{ partnerId: "p-ulemu", nameKey: "ULEMU CHIRWA" }];
export const EXISTING_PHONES = {
  "+265884220613": { hubId: HUB_ID, partnerId: "p-ulemu" },
  "+265997402115": { hubId: "hub-mozambique", hubLabel: "Mozambique" },
};

/** The hub's country decides how a local number is read (Decision 0027). */
export const COUNTRIES = [
  { key: "malawi", label: "Malawi", hubLabel: "Malawi", region: "Africa", cc: "265" },
  { key: "kenya", label: "Kenya", hubLabel: "Kenya", region: "Africa", cc: "254" },
  { key: "uganda", label: "Uganda", hubLabel: "Uganda", region: "Africa", cc: "256" },
  { key: "europe", label: "Europe (no single country)", hubLabel: "Europe hub", region: "Europe", cc: null },
  { key: "ghana", label: "Old rule: read as Ghana", hubLabel: "Malawi", region: "Africa", cc: "233", ghanaRule: true },
];

export const LEADER = "Rev. Thandiwe Kaluwa";
export const BASE_PARTNERS = 142;

// Office console, Admins tab (Decision 0036): the nine blocks in the office's order.
export const BLOCKS = [
  { label: "UD GH", hubs: 31, signedIn: 27, partners: 6812, branches: 412, cash: 301, giving: 18422000 },
  { label: "UJ", hubs: 26, signedIn: 19, partners: 3904, branches: 233, cash: 160, giving: 9641550 },
  { label: "RSC", hubs: 14, signedIn: 14, partners: 1276, branches: 41, cash: 41, giving: 3120000 },
  { label: "UD AF", hubs: 33, signedIn: 25, partners: 2935, branches: 188, cash: 97, giving: 4186000, region: "africa" },
  { label: "UD EU", hubs: 7, signedIn: 7, partners: 1118, branches: 64, cash: 38, giving: 2290400 },
  { label: "UD NA" },
  { label: "Eschatos Int", hubs: 20, signedIn: 11, partners: 362, branches: 37, cash: 12, giving: 531000 },
  { label: "UI" },
  { label: "First Love" },
];

// A slice of the UD AF hubs, alphabetical as the office sees them.
export const AFRICA_HUBS = [
  { label: "Benin", admin: "S. Agbeko", last: "21 Oct 2026", partners: 88, branches: 5, cash: 5, giving: 112000 },
  { label: "Burundi", admin: "J. Nduwimana", last: "19 Oct 2026", partners: 131, branches: 7, cash: 4, giving: 154500 },
  { label: "Kenya", admin: "M. Kiprono", last: "24 Oct 2026", partners: 204, branches: 9, cash: 9, giving: 318000 },
  { label: "Malawi", admin: "Thandiwe Kaluwa", last: "26 Oct 2026", partners: null, branches: 6, cash: 3, giving: 176500 },
  { label: "Mozambique", admin: "No name on record", last: null, partners: 57, branches: 4, cash: 0, giving: 0 },
  { label: "Nigeria", admin: "F. Akinola", last: "25 Oct 2026", partners: 316, branches: 12, cash: 10, giving: 402250 },
  { label: "Rwanda", admin: "C. Uwase", last: "12 Oct 2026", partners: 96, branches: 5, cash: 5, giving: 98000 },
  { label: "Tanzania", admin: "E. Mushi", last: "23 Oct 2026", partners: 143, branches: 8, cash: 6, giving: 187300 },
  { label: "Uganda", admin: "P. Mugisha", last: "18 Oct 2026", partners: 172, branches: 8, cash: 7, giving: 205600 },
];
