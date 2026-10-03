// MOCK DATA for the problems right rail. There is no backend for these yet.
// TODO(backend): replace each export with an API call and delete this file.
//   - friends check-in  → needs a friends/follow model in AuthService or a new social endpoint
//   - trending companies → needs company tags per problem (ProblemService `company` column is free text today)

export const MOCK_FRIENDS_CHECKED_IN = 0;

export interface MockCompany {
  name: string;
  problemCount: number;
}

export const MOCK_TRENDING_COMPANIES: MockCompany[] = [
  { name: "Amazon", problemCount: 412 },
  { name: "Google", problemCount: 388 },
  { name: "Meta", problemCount: 276 },
  { name: "Microsoft", problemCount: 251 },
  { name: "Bloomberg", problemCount: 198 },
  { name: "Apple", problemCount: 163 },
  { name: "Uber", problemCount: 121 },
  { name: "Adobe", problemCount: 104 },
  { name: "Oracle", problemCount: 97 },
  { name: "LinkedIn", problemCount: 88 },
  { name: "TikTok", problemCount: 81 },
  { name: "Salesforce", problemCount: 74 },
  { name: "Goldman Sachs", problemCount: 66 },
  { name: "Walmart Labs", problemCount: 58 },
  { name: "Flipkart", problemCount: 52 },
  { name: "Atlassian", problemCount: 47 },
  { name: "Netflix", problemCount: 39 },
  { name: "Airbnb", problemCount: 34 },
  { name: "Stripe", problemCount: 29 },
  { name: "Visa", problemCount: 25 },
];
