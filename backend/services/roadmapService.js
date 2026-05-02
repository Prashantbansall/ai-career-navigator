const roadmapResources = {
  Java: {
    learn: "Core Java, OOP, collections, exception handling, streams",
    howToLearn:
      "Revise Java fundamentals, practice small programs, then build one CRUD-based mini project.",
    resource: "GeeksforGeeks Java Programming",
    project: "Student Management System",
    difficulty: "Beginner",
    timeEstimate: "6-8 hours",
  },

  JavaScript: {
    learn: "ES6, DOM, async/await, promises, array methods",
    howToLearn:
      "Learn syntax first, practice DOM tasks, then build a small interactive app.",
    resource: "javascript.info",
    project: "Interactive Quiz App",
    difficulty: "Beginner",
    timeEstimate: "5-7 hours",
  },

  React: {
    learn: "Components, props, state, hooks, routing, API integration",
    howToLearn:
      "Build components, practice hooks, connect an API, and create a dashboard UI.",
    resource: "React Official Docs",
    project: "Job Tracker Dashboard",
    difficulty: "Intermediate",
    timeEstimate: "8-10 hours",
  },

  "Node.js": {
    learn: "Node runtime, modules, npm, file system, server basics",
    howToLearn:
      "Understand Node runtime, create basic APIs, then connect routes with controllers.",
    resource: "freeCodeCamp Node.js Course",
    project: "REST API for Notes App",
    difficulty: "Intermediate",
    timeEstimate: "7-9 hours",
  },

  "Express.js": {
    learn: "Routing, middleware, controllers, error handling, API structure",
    howToLearn:
      "Practice route creation, middleware flow, and build a structured backend API.",
    resource: "Express.js Official Docs",
    project: "Task Manager API",
    difficulty: "Intermediate",
    timeEstimate: "6-8 hours",
  },

  SQL: {
    learn: "Queries, joins, indexes, normalization, transactions",
    howToLearn:
      "Practice SELECT queries, joins, grouping, and design a small relational database.",
    resource: "SQLBolt",
    project: "Employee Attendance Database",
    difficulty: "Beginner",
    timeEstimate: "5-7 hours",
  },

  MongoDB: {
    learn: "Collections, CRUD, aggregation, schema design",
    howToLearn:
      "Practice CRUD operations, create schemas, and connect MongoDB with backend APIs.",
    resource: "MongoDB University Free Courses",
    project: "Resume Analyzer Database",
    difficulty: "Intermediate",
    timeEstimate: "6-8 hours",
  },

  DSA: {
    learn: "Arrays, strings, linked lists, stacks, queues, trees, graphs",
    howToLearn:
      "Follow a topic-wise sheet, solve beginner-to-medium problems, and revise patterns.",
    resource: "Striver A2Z DSA Sheet",
    project: "DSA Practice Tracker",
    difficulty: "Intermediate",
    timeEstimate: "10-14 hours",
  },

  Git: {
    learn: "Git basics, branches, commits, merge, pull requests",
    howToLearn:
      "Practice Git commands daily while pushing every project update to GitHub.",
    resource: "Atlassian Git Tutorial",
    project: "Version-controlled Portfolio Project",
    difficulty: "Beginner",
    timeEstimate: "3-4 hours",
  },

  "REST APIs": {
    learn: "HTTP methods, status codes, request/response, API design",
    howToLearn:
      "Build APIs with GET, POST, PUT, DELETE and test them using Postman.",
    resource: "Postman API Beginner Course",
    project: "Book Management REST API",
    difficulty: "Intermediate",
    timeEstimate: "5-7 hours",
  },

  "System Design": {
    learn: "Scalability, load balancing, caching, database design",
    howToLearn:
      "Start with basic concepts, draw diagrams, and design one common system end-to-end.",
    resource: "Gaurav Sen System Design YouTube",
    project: "URL Shortener System Design",
    difficulty: "Advanced",
    timeEstimate: "8-12 hours",
  },

  Docker: {
    learn: "Containers, images, Dockerfile, docker-compose",
    howToLearn:
      "Dockerize one frontend/backend project and run it locally using containers.",
    resource: "Docker Official Getting Started Guide",
    project: "Dockerize MERN App",
    difficulty: "Intermediate",
    timeEstimate: "6-8 hours",
  },

  AWS: {
    learn: "EC2, S3, IAM, Lambda basics, deployment",
    howToLearn:
      "Learn core services, deploy one small backend, and host static files using S3.",
    resource: "AWS Skill Builder Free Courses",
    project: "Deploy Resume Analyzer on AWS",
    difficulty: "Intermediate",
    timeEstimate: "8-10 hours",
  },

  "Machine Learning": {
    learn: "Supervised learning, regression, classification, evaluation",
    howToLearn:
      "Learn basic algorithms, train simple models, and evaluate accuracy using real datasets.",
    resource: "Andrew Ng Machine Learning Course",
    project: "Student Performance Predictor",
    difficulty: "Intermediate",
    timeEstimate: "10-12 hours",
  },

  NLP: {
    learn: "Text preprocessing, tokenization, embeddings, similarity",
    howToLearn:
      "Practice text cleaning, build keyword extraction, then try semantic similarity.",
    resource: "Hugging Face NLP Course",
    project: "Resume Skill Extractor",
    difficulty: "Intermediate",
    timeEstimate: "8-10 hours",
  },

  Statistics: {
    learn: "Probability, distributions, hypothesis testing, correlation",
    howToLearn:
      "Revise core formulas, solve examples, and apply concepts to datasets.",
    resource: "Khan Academy Statistics",
    project: "Job Market Skill Trend Analysis",
    difficulty: "Beginner",
    timeEstimate: "6-8 hours",
  },
};

const defaultRoadmap = (skill) => ({
  learn: `Fundamentals of ${skill} with hands-on practice`,
  howToLearn: `Learn the basics of ${skill}, follow free tutorials, and apply it in a small project.`,
  resource: `Search for beginner-friendly ${skill} tutorials on freeCodeCamp or official docs`,
  project: `Mini project using ${skill}`,
  difficulty: "Beginner",
  timeEstimate: "5-7 hours",
});

export const generateRoadmap = (missingSkills) => {
  return missingSkills.map((skill, index) => {
    const roadmapItem = roadmapResources[skill] || defaultRoadmap(skill);

    return {
      week: `Week ${index + 1}`,
      skill,
      learn: roadmapItem.learn,
      howToLearn: roadmapItem.howToLearn,
      resource: roadmapItem.resource,
      project: roadmapItem.project,
      difficulty: roadmapItem.difficulty,
      timeEstimate: roadmapItem.timeEstimate,
    };
  });
};
