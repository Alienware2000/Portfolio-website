// The hub upload rules, ported from benmp-prm (src/lib/phone.ts, src/lib/hub/ingest.ts,
// src/lib/hub/seed.ts). The preview and the "save" both call validateRows, the same way
// the real wizard and its submit route share one pure module.

/** Branch identity: case, spacing and Excel's invisible characters don't count. */
export function normalizeChurchKey(raw) {
  return raw.replace(/\u200B|\u200C|\u200D|\u2060|\uFEFF/g, "").trim().replace(/\s+/g, " ").toUpperCase();
}

/** Name identity for re-upload matching: case and spacing only, never punctuation. */
export function normalizeNameKey(raw) {
  return (raw ?? "").trim().replace(/\s+/g, " ").toUpperCase();
}

/** At least two real words (Decision 0018). */
export function validateName(name) {
  if (name === "") return "Name is missing.";
  const words = name.split(/\s+/).filter((w) => /\p{L}/u.test(w));
  if (words.length < 2) return 'Needs at least two names, for example "Ama Mensah".';
  return null;
}

/** The shapes office sheets use for one country: +cc..., cc+nsn, bare nsn, 0+nsn. */
function normalizePhoneForCallingCode(raw, cc, nsnLengths) {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("+")) {
    const digits = trimmed.slice(1).replace(/\D/g, "");
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  }
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith(cc) && nsnLengths.includes(digits.length - cc.length)) return `+${digits}`;
  if (!digits.startsWith("0") && nsnLengths.includes(digits.length)) return `+${cc}${digits}`;
  if (digits.startsWith("0") && nsnLengths.includes(digits.length - 1)) return `+${cc}${digits.slice(1)}`;
  return null;
}

/** The Ghana reader: what every WhatsApp number went through before Decision 0027. */
export const normalizeGhanaPhone = (raw) => normalizePhoneForCallingCode(raw, "233", [9]);

// A small stand-in for libphonenumber's isValid(), used only when the hub has no single
// country (Decision 0034): calling code -> valid national number lengths.
const PLANS = { 1: [10], 27: [9], 31: [9], 33: [9], 39: [9, 10], 44: [10], 49: [10, 11], 233: [9], 234: [10], 254: [9], 256: [9], 258: [9], 265: [9] };

function validInternational(digits) {
  if (digits.length < 8 || digits.length > 15) return null;
  for (const len of [3, 2, 1]) {
    const lengths = PLANS[digits.slice(0, len)];
    if (lengths) return lengths.includes(digits.length - len) ? `+${digits}` : null;
  }
  return null;
}

/** WhatsApp numbers read in the hub's own country (Decision 0027). */
export function normalizeWhatsappPhone(raw, callingCode) {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("+")) {
    const digits = trimmed.slice(1).replace(/\D/g, "");
    if (!callingCode) return validInternational(digits);
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  }
  let digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
    if (!callingCode) return validInternational(digits);
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  }
  if (callingCode) {
    // Excel stripped the "+" from a number that already carries the code.
    if (digits.startsWith(callingCode) && digits.length - callingCode.length >= 7 && digits.length <= 15) return `+${digits}`;
    // Local trunk form "0...": drop the 0, prepend the hub's country.
    if (digits.startsWith("0")) {
      const nsn = digits.slice(1);
      return nsn.length >= 7 && nsn.length <= 10 ? `+${callingCode}${nsn}` : null;
    }
    // Excel dropped the leading 0.
    if (digits.length >= 7 && digits.length <= 10) return `+${callingCode}${digits}`;
  }
  if (!callingCode) return digits.startsWith("0") ? null : validInternational(digits);
  return digits.length >= 8 && digits.length <= 15 && !digits.startsWith("0") ? `+${digits}` : null;
}

export function whatsappFormatHint(callingCode) {
  if (!callingCode) return "Include the country code, e.g. +44 7911 123456.";
  return `Use the local form (0…) or +${callingCode} followed by the number.`;
}

/** How the hub's country reads a WhatsApp cell. `ghanaRule` replays the pre-0027 bug. */
export function readWhatsapp(raw, country) {
  return country.ghanaRule ? normalizeGhanaPhone(raw) : normalizeWhatsappPhone(raw, country.cc);
}

/**
 * Every rule the wizard applies, deterministic and total: each row comes back with its
 * issues, in order. Mirrors validateCandidates for a region without MoMo or pledges.
 */
export function validateRows(rows, ctx) {
  const byKey = new Map(ctx.churches.map((c) => [normalizeChurchKey(c), c]));
  const firstRowForPerson = new Map();
  const firstRowUpdating = new Map();

  return rows.map((row) => {
    const issues = [];
    const nameProblem = validateName(row.name);
    if (nameProblem) issues.push({ field: "name", message: nameProblem });

    let e164 = null;
    if (row.whatsappPhone === "") {
      issues.push({ field: "whatsappPhone", message: "WhatsApp number is missing." });
    } else {
      e164 = readWhatsapp(row.whatsappPhone, ctx.country);
      if (!e164) {
        issues.push({
          field: "whatsappPhone",
          message: ctx.country.ghanaRule
            ? "Not a valid WhatsApp number. Use 0244123456 or +233 244 123 456."
            : `Not a valid WhatsApp number. ${whatsappFormatHint(ctx.country.cc)}`,
        });
      }
    }

    // A person is a name AND a number (Decision 0028).
    if (!nameProblem) {
      const key = `${normalizeNameKey(row.name)}|${e164 ?? row.whatsappPhone.replace(/\s+/g, "")}`;
      const first = firstRowForPerson.get(key);
      if (first !== undefined) issues.push({ field: "name", message: `Same name and WhatsApp number as row ${first} of this file.` });
      else firstRowForPerson.set(key, row.rowIndex);
    }

    // Own hub's number: an edit of that partner. Another hub's: blocked.
    let updatesPartnerId = null;
    const held = e164 ? ctx.existingPhones[e164] : null;
    if (held && held.hubId !== ctx.hubId) {
      issues.push({ field: "whatsappPhone", message: `This number is already in the system for ${held.hubLabel}.` });
    } else if (held) {
      const sameName = ctx.existingPartners.some((p) => p.partnerId === held.partnerId && p.nameKey === normalizeNameKey(row.name));
      if (sameName) {
        const first = firstRowUpdating.get(held.partnerId);
        if (first !== undefined) issues.push({ field: "name", message: `Row ${first} of this file is already this same person.` });
        else {
          firstRowUpdating.set(held.partnerId, row.rowIndex);
          updatesPartnerId = held.partnerId;
        }
      }
    }

    let churchName = null;
    if (row.church === "") issues.push({ field: "church", message: "Church is missing." });
    else {
      churchName = byKey.get(normalizeChurchKey(row.church)) ?? null;
      if (!churchName) issues.push({ field: "church", message: "Not on this hub's church list. Pick the church from the dropdown." });
    }

    return { ...row, e164, churchName, updatesPartnerId, issues };
  });
}

/** Mask the middle digits of anything phone-shaped: "0999 123 456" -> "0999 ••• 456". */
export function maskPhone(raw) {
  const total = (raw.match(/\d/g) ?? []).length;
  if (total < 8) return raw;
  let seen = 0;
  return raw.replace(/\d/g, (d) => {
    seen += 1;
    return seen > 4 && seen <= total - 3 ? "•" : d;
  });
}

/** "+265999123456" -> "+265 999 ••• 456", grouped after the calling code. */
export function formatE164(e164, cc) {
  const digits = e164.slice(1);
  const code = cc && digits.startsWith(cc) ? cc : [3, 2, 1].map((n) => digits.slice(0, n)).find((c) => PLANS[c]) ?? digits.slice(0, 3);
  const nsn = digits.slice(code.length);
  const middle = nsn.slice(3, -3).replace(/\d/g, "•");
  return `+${code} ${nsn.slice(0, 3)} ${middle} ${nsn.slice(-3)}`;
}
