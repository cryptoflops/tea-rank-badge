export const fixtures = {
  searchSuccess: {
    results: [
      {
        projectId: '123456',
        name: 'curl',
        primaryRepo: 'https://github.com/curl/curl',
      }
    ],
    totalCount: 1,
  },
  searchMultiple: {
    results: [
      {
        projectId: '123456',
        name: 'test-project',
        primaryRepo: 'https://github.com/user/test-project',
      },
      {
        projectId: '789012',
        name: 'test-project-fork',
        primaryRepo: 'https://github.com/other/test-project-fork',
      }
    ],
    totalCount: 2,
  },
  searchEmpty: {
    results: [],
    totalCount: 0,
  },
  infoSuccess: {
    teaRank: 75.5432,
    projectId: '123456',
    projectName: 'curl',
    projectType: 'GitHub',
    projectUrl: 'https://github.com/curl/curl',
  },
  infoLowRank: {
    teaRank: 15.25,
    projectId: '789012',
    projectName: 'test-project',
    projectType: 'GitHub',
    projectUrl: 'https://github.com/user/test-project',
  },
};