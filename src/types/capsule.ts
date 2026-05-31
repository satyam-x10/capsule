export interface Capsule {
  id: string;
  sectionId: number;
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
  sectionId: number;
  category: string;
  note: string;
  savedDate: string; // Formatting like "May 27, 2026" or YYYY-MM-DD
}
