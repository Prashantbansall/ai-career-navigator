const roadmapResources = {
  Java: {
    learn: "Core Java, OOP, collections, exception handling, streams",
    resource: "GeeksforGeeks Java Programming + Java Brains YouTube",
    project: "Student Management System",
  },

  JavaScript: {
    learn: "ES6, DOM, async/await, promises, array methods",
    resource: "javascript.info + freeCodeCamp JavaScript",
    project: "Interactive Quiz App",
  },

  React: {
    learn: "Components, props, state, hooks, routing, API integration",
    resource: "React Official Docs + Codevolution React Playlist",
    project: "Job Tracker Dashboard",
  },

  "Node.js": {
    learn: "Node runtime, modules, Express basics, middleware",
    resource: "freeCodeCamp Node.js Course",
    project: "REST API for Notes App",
  },

  "Express.js": {
    learn: "Routing, middleware, controllers, error handling",
    resource: "Express.js Official Docs",
    project: "Task Manager API",
  },

  SQL: {
    learn: "Queries, joins, indexes, normalization, transactions",
    resource: "SQLBolt + Mode SQL Tutorial",
    project: "Employee Attendance Database",
  },

  MongoDB: {
    learn: "Collections, CRUD, aggregation, schema design",
    resource: "MongoDB University Free Courses",
    project: "Resume Analyzer Database",
  },

  DSA: {
    learn: "Arrays, strings, linked lists, stacks, queues, trees, graphs",
    resource: "Striver A2Z DSA Sheet",
    project: "DSA Practice Tracker",
  },

  Git: {
    learn: "Git basics, branches, commits, merge, pull requests",
    resource: "Atlassian Git Tutorial",
    project: "Version-controlled Portfolio Project",
  },

  "REST APIs": {
    learn: "HTTP methods, status codes, request/response, API design",
    resource: "Postman API Beginner Course",
    project: "Book Management REST API",
  },

  "System Design": {
    learn: "Scalability, load balancing, caching, database design",
    resource: "Gaurav Sen System Design YouTube",
    project: "URL Shortener System Design",
  },

  Docker: {
    learn: "Containers, images, Dockerfile, docker-compose",
    resource: "Docker Official Getting Started Guide",
    project: "Dockerize MERN App",
  },

  AWS: {
    learn: "EC2, S3, IAM, Lambda basics, deployment",
    resource: "AWS Skill Builder Free Courses",
    project: "Deploy Resume Analyzer on AWS",
  },

  "Machine Learning": {
    learn: "Supervised learning, regression, classification, evaluation",
    resource: "Andrew Ng Machine Learning Course",
    project: "Student Performance Predictor",
  },

  NLP: {
    learn: "Text preprocessing, tokenization, embeddings, similarity",
    resource: "Hugging Face NLP Course",
    project: "Resume Skill Extractor",
  },

  Statistics: {
    learn: "Probability, distributions, hypothesis testing, correlation",
    resource: "Khan Academy Statistics",
    project: "Job Market Skill Trend Analysis",
  },
};

const defaultRoadmap = (skill) => ({
  learn: `Fundamentals of ${skill} with hands-on practice`,
  resource: `Search for beginner-friendly ${skill} tutorials on freeCodeCamp or official docs`,
  project: `Mini project using ${skill}`,
});

export const generateRoadmap = (missingSkills) => {
  return missingSkills.map((skill, index) => {
    const roadmapItem = roadmapResources[skill] || defaultRoadmap(skill);

    return {
      week: `Week ${index + 1}`,
      skill,
      learn: roadmapItem.learn,
      resource: roadmapItem.resource,
      project: roadmapItem.project,
    };
  });
};
