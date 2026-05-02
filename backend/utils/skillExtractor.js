const skillsDictionary = [
  {
    name: "Java",
    aliases: ["java"],
  },
  {
    name: "JavaScript",
    aliases: ["javascript", "js"],
  },
  {
    name: "Python",
    aliases: ["python"],
  },
  {
    name: "React",
    aliases: ["react", "react.js", "reactjs"],
  },
  {
    name: "Node.js",
    aliases: ["node.js", "nodejs", "node"],
  },
  {
    name: "Express.js",
    aliases: ["express.js", "expressjs", "express"],
  },
  {
    name: "Spring Boot",
    aliases: ["spring boot", "springboot"],
  },
  {
    name: "SQL",
    aliases: ["sql", "mysql", "postgresql"],
  },
  {
    name: "MongoDB",
    aliases: ["mongodb", "mongo db"],
  },
  {
    name: "DSA",
    aliases: [
      "dsa",
      "data structures",
      "data structures and algorithms",
      "algorithms",
    ],
  },
  {
    name: "Git",
    aliases: ["git", "github"],
  },
  {
    name: "REST APIs",
    aliases: ["rest api", "rest apis", "restful api", "restful apis"],
  },
  {
    name: "System Design",
    aliases: ["system design"],
  },
  {
    name: "Docker",
    aliases: ["docker"],
  },
  {
    name: "Kubernetes",
    aliases: ["kubernetes", "k8s"],
  },
  {
    name: "AWS",
    aliases: ["aws", "amazon web services"],
  },
  {
    name: "CI/CD",
    aliases: [
      "ci/cd",
      "cicd",
      "continuous integration",
      "continuous deployment",
    ],
  },
  {
    name: "Jenkins",
    aliases: ["jenkins"],
  },
  {
    name: "Linux",
    aliases: ["linux"],
  },
  {
    name: "Machine Learning",
    aliases: ["machine learning", "ml"],
  },
  {
    name: "Deep Learning",
    aliases: ["deep learning", "dl"],
  },
  {
    name: "NLP",
    aliases: ["nlp", "natural language processing"],
  },
  {
    name: "TensorFlow",
    aliases: ["tensorflow"],
  },
  {
    name: "PyTorch",
    aliases: ["pytorch"],
  },
  {
    name: "Pandas",
    aliases: ["pandas"],
  },
  {
    name: "NumPy",
    aliases: ["numpy"],
  },
  {
    name: "Scikit-learn",
    aliases: ["scikit-learn", "sklearn"],
  },
  {
    name: "Statistics",
    aliases: ["statistics", "statistical analysis"],
  },
  {
    name: "Data Visualization",
    aliases: ["data visualization", "matplotlib", "seaborn"],
  },
  {
    name: "HTML",
    aliases: ["html", "html5"],
  },
  {
    name: "CSS",
    aliases: ["css", "css3"],
  },
  {
    name: "Tailwind CSS",
    aliases: ["tailwind", "tailwind css"],
  },
  {
    name: "Redux",
    aliases: ["redux"],
  },
  {
    name: "TypeScript",
    aliases: ["typescript", "ts"],
  },
  {
    name: "Responsive Design",
    aliases: ["responsive design"],
  },
  {
    name: "Authentication",
    aliases: ["authentication", "authorization", "jwt"],
  },
];

const escapeRegex = (text) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const extractSkills = (text) => {
  const lowerText = text.toLowerCase();
  const detectedSkills = new Set();

  skillsDictionary.forEach((skill) => {
    const found = skill.aliases.some((alias) => {
      const safeAlias = escapeRegex(alias.toLowerCase());
      const regex = new RegExp(
        `(^|[^a-zA-Z0-9])${safeAlias}([^a-zA-Z0-9]|$)`,
        "i",
      );
      return regex.test(lowerText);
    });

    if (found) {
      detectedSkills.add(skill.name);
    }
  });

  return Array.from(detectedSkills);
};
