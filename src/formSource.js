export const userInputs = [
  {
    id: 1,
    label: "Email",
    type: "email",
    name: "email",
    placeholder: "john_doe@gmail.com",
  },
  {
    id: 2,
    label: "Password",
    type: "password",
    name: "password",
  },
  {
    id: 3,
    label: "Name",
    type: "text",
    name: "name",
    placeholder: "John"
  },
  {
    id: 4,
    label: "Confirmed",
    type: "checkbox",
    name: "isConfirmed",
  },
  {
    id: 5,
    label: "Admin",
    type: "checkbox",
    name: "isAdmin",
  },
];

export const classInputs = [
  {
    id: 1,
    label: "Name",
    type: "text",
    name: "name",
    placeholder: "Introduction to Programming",
  },
  {
    id: 2,
    label: "Description",
    type: "text",
    name: "description",
    placeholder: "Learn the basics of programming.",
  },
  {
    id: 3,
    label: "Price",
    type: "text",
    name: "price",
    placeholder: "Free",
  },
  {
    id: 4,
    label: "City",
    type: "text",
    name: "city",
    placeholder: "New York",
  },
  {
    id: 5,
    label: "Type",
    type: "select",
    name: "type",
    options: [
      { value: "Introductory Coding", label: "Introductory Coding" },
      { value: "Advanced Coding", label: "Advanced Coding" },
      { value: "Web Development", label: "Web Development" },
      { value: "Data Science", label: "Data Science" },
      { value: "Game Development", label: "Game Development" },
      { value: "STEM", label: "STEM" },
      { value: "Other", label: "Other" },
    ],
  },
  {
    id: 6,
    label: "Days Required",
    type: "number",
    name: "daysRequired",
    placeholder: "30",
  },
  {
    id: 7,
    label: "One Liner",
    type: "text",
    name: "oneLiner",
    placeholder: "Quick and easy programming course.",
  },
  {
    id: 8,
    label: "Supplies",
    type: "text",
    name: "supplies",
    placeholder: "Laptop, Internet",
  },
  {
    id: 9,
    label: "Teams",
    type: "select",
    name: "teams",
    options: [], // This will be populated dynamically
    isMulti: true,
  },
];

export const teamInputs = [
  {
    id: 1,
    label: "Name",
    type: "text",
    name: "name",
    placeholder: "Team A",
  },
  {
    id: 2,
    label: "Address",
    type: "text",
    name: "address",
    placeholder: "123 Main St, New York",
  },
];

export const teamMemberInputs = [
  {
    id: 1,
    label: "Name",
    type: "text",
    name: "name",
    placeholder: "Jane Doe",
  },
  {
    id: 2,
    label: "Months Available",
    type: "select",
    name: "monthsAvailable",
    options: Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: new Date(0, i).toLocaleString('default', { month: 'long' }),
    })),
    isMulti: true,
  },
  {
    id: 3,
    label: "Availability",
    type: "availability",
    name: "availability",
  },
  {
    id: 4,
    label: "Unavailable Dates",
    type: "unavailableDates",
    name: "unavailableDates",
  },
  {
    id: 5,
    label: "Teams",
    type: "select",
    name: "teams",
    options: [], // This will be populated dynamically
    isMulti: true,
  },
];
