export const orgData = {
  id: '1',
  name: "Ethan Miller",
  title: "Chief Executive Officer",
  department: "Executive",
  tier: "chief",
  level: "senior",
  children: [
    {
      id: '2',
      name: "Barry Gause",
      title: "Chief Technology Officer",
      department: "Technology",
      tier: "chief",
      level: "senior",
      children: [
        {
          id: '20',
          name: "David Kumar",
          title: "Deputy CTO",
          department: "Technology",
          tier: "chief",
          level: "junior",
          children: []
        },
        {
          id: '21',
          name: "Kelly Zhang",
          title: "Development Director",
          department: "Engineering",
          tier: "director",
          level: "senior",
          children: [
            {
              id: '210',
              name: "Peter Chen",
              title: "Assistant Director",
              department: "Engineering",
              tier: "director",
              level: "junior",
              children: []
            },
            {
              id: '211',
              name: "Tom Wilson",
              title: "Senior Developer",
              department: "Engineering",
              tier: "staff",
              level: "senior",
              children: []
            },
            {
              id: '212',
              name: "Sarah Chen",
              title: "Junior Developer",
              department: "Engineering",
              tier: "staff",
              level: "junior",
              children: []
            }
          ]
        }
      ]
    },
    {
      id: '3',
      name: "Len Martinez",
      title: "Chief Operating Officer",
      department: "Operations",
      tier: "chief",
      level: "senior",
      children: [
        {
          id: '30',
          name: "Maria Rodriguez",
          title: "Deputy COO",
          department: "Operations",
          tier: "chief",
          level: "junior",
          children: [
            {
              id: '301',
              name: "Chris Taylor",
              title: "Operations Specialist",
              department: "Operations",
              tier: "staff",
              level: "junior",
              children: []
            }
          ]
        },
        {
          id: '31',
          name: "Carrie Johnson",
          title: "Operations Director",
          department: "Operations",
          tier: "director",
          level: "senior",
          children: [
            {
              id: '310',
              name: "James Wilson",
              title: "Assistant Director",
              department: "Operations",
              tier: "director",
              level: "junior",
              children: []
            },
            {
              id: '311',
              name: "Mike Ross",
              title: "Operations Manager",
              department: "Operations",
              tier: "manager",
              level: "senior",
              children: [
                {
                  id: '3111',
                  name: "Alex Lee",
                  title: "Senior Analyst",
                  department: "Operations",
                  tier: "staff",
                  level: "senior",
                  children: []
                },
                {
                  id: '3112',
                  name: "Lisa Park",
                  title: "Junior Analyst",
                  department: "Operations",
                  tier: "staff",
                  level: "junior",
                  children: []
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: '4',
      name: "Shannon Lee",
      title: "Chief Financial Officer",
      department: "Finance",
      tier: "chief",
      level: "senior",
      children: [
        {
          id: '40',
          name: "Robert Chen",
          title: "Deputy CFO",
          department: "Finance",
          tier: "chief",
          level: "junior",
          children: [
            {
              id: '401',
              name: "Emily Wang",
              title: "Financial Analyst",
              department: "Finance",
              tier: "staff",
              level: "junior",
              children: []
            }
          ]
        },
        {
          id: '41',
          name: "Terri Wilson",
          title: "Finance Director",
          department: "Finance",
          tier: "director",
          level: "senior",
          children: [
            {
              id: '410',
              name: "Amy Zhang",
              title: "Assistant Director",
              department: "Finance",
              tier: "director",
              level: "junior",
              children: []
            },
            {
              id: '411',
              name: "Xi Wang",
              title: "Financial Controller",
              department: "Finance",
              tier: "manager",
              level: "senior",
              children: [
                {
                  id: '4111',
                  name: "John Smith",
                  title: "Senior Accountant",
                  department: "Finance",
                  tier: "staff",
                  level: "senior",
                  children: []
                },
                {
                  id: '4112',
                  name: "Emma Davis",
                  title: "Junior Accountant",
                  department: "Finance",
                  tier: "staff",
                  level: "junior",
                  children: []
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
