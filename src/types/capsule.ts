export interface Capsule {
  id: string;
  category: string;
  title: string;
  shortDescription: string;
  content: string;
  takeaway: string;
  readTime: string;
  date: string; // ISO date string in YYYY-MM-DD format
}

export interface Revision {
  capsuleId: string;
  capsuleTitle: string;
  category: string;
  note: string;
  savedDate: string; // Formatting like "May 27, 2026" or YYYY-MM-DD
}
