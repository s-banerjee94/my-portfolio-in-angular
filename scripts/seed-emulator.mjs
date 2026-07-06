/**
 * Seeds the local Firebase emulators with content for every section of the
 * portfolio, plus the admin login user, so the site and dashboard are never
 * empty after an emulator restart.
 *
 * Usage:
 *   npm run emulators   (in one terminal)
 *   npm run seed        (in another)
 *
 * The Firestore emulator accepts `Bearer owner` as an admin credential, so
 * this script bypasses security rules. It only talks to localhost — it can
 * never touch production data.
 */

const PROJECT_ID = 'my-portfolio-in-angular';
const FIRESTORE = `http://127.0.0.1:8081/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const AUTH = 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1';

const ADMIN_EMAIL = 'contactsandeepan@gmail.com';
const ADMIN_PASSWORD = 'password123';

// ---- Firestore REST value encoding ----------------------------------------
// The REST API needs every value wrapped in a typed envelope
// ({ stringValue: ... }, { timestampValue: ... }, ...). JS Dates become
// Firestore Timestamps, which is what the app's Date | Timestamp fields expect.

function toValue(value) {
  if (value === null) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toValue) } };
  }
  return { mapValue: { fields: toFields(value) } };
}

function toFields(obj) {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([, v]) => v !== undefined)
      .map(([key, v]) => [key, toValue(v)]),
  );
}

async function setDoc(path, data) {
  const res = await fetch(`${FIRESTORE}/${path}`, {
    method: 'PATCH',
    headers: {
      Authorization: 'Bearer owner',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields: toFields(data) }),
  });
  if (!res.ok) {
    throw new Error(`set ${path} failed: ${res.status} ${await res.text()}`);
  }
  console.log(`  ✓ profile doc ${path}`);
}

async function addDoc(collectionName, data) {
  const res = await fetch(`${FIRESTORE}/${collectionName}`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer owner',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields: toFields(data) }),
  });
  if (!res.ok) {
    throw new Error(
      `add to ${collectionName} failed: ${res.status} ${await res.text()}`,
    );
  }
  console.log(`  ✓ added to ${collectionName}`);
}

async function clearCollection(collectionName) {
  // List every doc (name only) and delete them, so re-seeding replaces
  // instead of duplicating.
  let deleted = 0;
  for (;;) {
    const res = await fetch(
      `${FIRESTORE}/${collectionName}?pageSize=300&mask.fieldPaths=__name__`,
      { headers: { Authorization: 'Bearer owner' } },
    );
    if (!res.ok) {
      throw new Error(
        `list ${collectionName} failed: ${res.status} ${await res.text()}`,
      );
    }
    const body = await res.json();
    const docs = body.documents ?? [];
    if (docs.length === 0) break;
    for (const docEntry of docs) {
      const del = await fetch(`http://127.0.0.1:8081/v1/${docEntry.name}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer owner' },
      });
      if (!del.ok) {
        throw new Error(`delete ${docEntry.name} failed: ${del.status}`);
      }
      deleted++;
    }
  }
  if (deleted > 0) console.log(`  ✓ cleared ${collectionName} (${deleted})`);
}

async function createAdminUser() {
  const res = await fetch(`${AUTH}/accounts:signUp?key=fake-api-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      returnSecureToken: true,
    }),
  });
  const body = await res.json();
  if (!res.ok) {
    if (body?.error?.message === 'EMAIL_EXISTS') {
      console.log(`  ✓ admin user already exists (${ADMIN_EMAIL})`);
      return;
    }
    throw new Error(`create user failed: ${JSON.stringify(body)}`);
  }
  console.log(`  ✓ admin user ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

// ---- Content ---------------------------------------------------------------

const GH = 'https://github.com/s-banerjee94';
const ogImage = (repo) =>
  `https://opengraph.githubassets.com/1/s-banerjee94/${repo}`;

const hero = {
  name: 'Sandeepan Banerjee',
  professionalTitle: 'Java Full-Stack Developer',
  description:
    'I build scalable, efficient applications end to end — Spring Boot services on the back, Angular on the front, clean and maintainable code throughout.',
  statusBadge: 'Open to opportunities',
  heroImgUrl: 'https://github.com/s-banerjee94.png',
  githubUrl: GH,
  linkedInUrl: 'https://www.linkedin.com/in/connect2sandy/',
  email: ADMIN_EMAIL,
};

const about = {
  text:
    '<p>Three years in as a <strong>Java full-stack developer</strong> — designing scalable solutions, solving complex problems, and collaborating across teams. I write clean, maintainable code and build robust backend systems with responsive frontends on top.</p>' +
    '<p>The daily stack: Spring Boot (Security, Batch, JPA/Hibernate, Cloud) on the backend, Angular and TypeScript on the front, MySQL, DynamoDB and Firestore for data, deployed to AWS — EC2, S3, Lambda, SQS, and CI/CD through CodeBuild and CodePipeline.</p>',
  experience: '3 years',
  education: 'B.Tech, Computer Science',
  certification: 'AWS Certified Cloud Practitioner',
  skills: [
    'Java',
    'TypeScript',
    'SQL',
    'Spring Boot',
    'Spring Security',
    'Spring Batch',
    'JPA / Hibernate',
    'Spring Cloud',
    'JUnit',
    'Angular',
    'MySQL',
    'DynamoDB',
    'Firestore',
    'AWS',
    'Docker',
    'Git',
    'Maven',
  ],
};

const contact = {
  email: ADMIN_EMAIL,
  github: GH,
  linkedin: 'https://www.linkedin.com/in/connect2sandy/',
  twitter: '',
  facebook: '',
  instagram: '',
};

const projects = [
  {
    title: 'InterviewGenius',
    description:
      'AI-powered interview-preparation platform: an 8-service microservices backend with Spring Cloud Gateway, OAuth2/JWT security, Netflix Eureka discovery, MongoDB and MySQL persistence, and AI integrations with Anthropic Claude and OpenAI.',
    gitHubUrl: `${GH}/interviewgenius`,
    liveDemoUrl: '',
    technologies: [
      'Java',
      'Spring Boot',
      'Spring Cloud',
      'OAuth2 / JWT',
      'Eureka',
      'MongoDB',
      'MySQL',
      'Claude API',
    ],
    projectImgUrl: ogImage('interviewgenius'),
    projectDate: new Date('2026-04-15'),
    featured: true,
    detailsSource: 'readme',
  },
  {
    title: 'Marathon Bib Expo Service',
    description:
      'Spring Boot service that runs marathon bib-expo operations end to end — organizations, users, participants and bib distribution — exposed as REST APIs with real-time metrics.',
    gitHubUrl: `${GH}/marathon-bib-expo-service`,
    liveDemoUrl: '',
    technologies: ['Java', 'Spring Boot', 'REST API', 'MySQL'],
    projectImgUrl: ogImage('marathon-bib-expo-service'),
    projectDate: new Date('2026-06-11'),
    detailsSource: 'readme',
  },
  {
    title: 'Marathon Bib Expo Frontend',
    description:
      'Frontend for the bib-expo platform: participant lookup and bib-distribution flows built for race-day speed.',
    gitHubUrl: `${GH}/marathon-bib-expo-frontend`,
    liveDemoUrl: '',
    technologies: ['Angular', 'TypeScript'],
    projectImgUrl: ogImage('marathon-bib-expo-frontend'),
    projectDate: new Date('2026-06-21'),
    detailsSource: 'readme',
  },
  {
    title: 'InterviewGenius Frontend',
    description:
      'The Angular face of InterviewGenius: resume and profile management plus interview-prep tooling, built with Angular 20+ and a focus on user experience.',
    gitHubUrl: `${GH}/interviewgenius-frontend`,
    liveDemoUrl: '',
    technologies: ['Angular', 'TypeScript', 'PrimeNG'],
    projectImgUrl: ogImage('interviewgenius-frontend'),
    projectDate: new Date('2025-10-28'),
    detailsSource: 'readme',
  },
  {
    title: 'Job Portal Backend',
    description:
      'Job-portal REST API with JWT authentication and role-based access control separating recruiter and candidate capabilities.',
    gitHubUrl: `${GH}/Job-Portal-Backend`,
    liveDemoUrl: '',
    technologies: ['Java', 'Spring Boot', 'Spring Security', 'JWT', 'MySQL'],
    projectImgUrl: ogImage('Job-Portal-Backend'),
    projectDate: new Date('2025-11-01'),
    detailsSource: 'readme',
  },
  {
    title: 'Race Result API',
    description:
      'Batch pipeline that imports and serves race results — Spring Batch jobs on top of Spring Data JPA and MySQL.',
    gitHubUrl: `${GH}/race-result-api`,
    liveDemoUrl: '',
    technologies: ['Java', 'Spring Batch', 'Spring Data JPA', 'MySQL'],
    projectImgUrl: ogImage('race-result-api'),
    projectDate: new Date('2025-09-15'),
    detailsSource: 'readme',
  },
];

// Service cards for the public "// GET /services" section (max 6).
const services = {
  services: [
    {
      icon: 'server',
      title: 'Backend & Microservices',
      description:
        'Spring Boot REST APIs, OAuth2/JWT security, service discovery, messaging and batch pipelines — production-grade Java back ends.',
    },
    {
      icon: 'layout',
      title: 'Full-Stack Web Apps',
      description:
        'Angular frontends wired to Java, Kotlin or Node back ends — one owner from data model to UI.',
    },
    {
      icon: 'cloud',
      title: 'Cloud & CI/CD',
      description:
        'AWS (S3, SQS, Lambda, DynamoDB, EventBridge) with CodeBuild/CodePipeline — automated builds and deploys, not manual rituals.',
    },
  ],
};

// Real roles from the CV, newest first.
// One highlight per line — the public site renders each line as a bullet.
const experiences = [
  {
    companyName: 'Dzylo',
    jobProfile: 'Software Development Engineer',
    color: '',
    startDate: new Date('2024-10-01'),
    endDate: new Date('2025-01-31'),
    description: [
      'Developed backend services in a microservices setup using Java (Spring), Kotlin (Ktor) and Node.js.',
      'Integrated MySQL, DynamoDB, S3, SQS, EventBridge and Lambda across the stack.',
      'Built Angular frontends supporting the business workflows.',
      'Shipped through AWS CodeBuild/CodePipeline CI/CD and resolved 10+ critical bugs.',
    ].join('\n'),
  },
  {
    companyName: 'Jai Balaji Group',
    jobProfile: 'Associate Manager',
    color: '',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-10-01'),
    description: [
      'Engineered a real-time data-validation tool for a marathon RFID system processing 10K+ participant registrations with 99.8% data accuracy (Spring Boot + MySQL).',
      'Built the Angular interface that reports errors so only validated data reaches the RFID system.',
      'Automated event-triggered notifications with Spring Batch and real-time SMS delivery monitoring.',
    ].join('\n'),
  },
  {
    companyName: 'Infiflex Technologies Pvt. Ltd.',
    jobProfile: 'Junior Solutions Associate',
    color: '',
    startDate: new Date('2022-01-01'),
    endDate: new Date('2023-10-01'),
    description: [
      "Improved GIFFY's import-module performance by 60% with Spring Boot and Syncfusion UI.",
      'Led development of a project-management tool with Spring Boot REST APIs.',
      'Added Kanban board and Gantt chart views for project tracking.',
    ].join('\n'),
  },
];

// Real credentials from the CV (issue dates approximate — adjust in the dashboard).
const certifications = [
  {
    name: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    type: 'certification',
    issueDate: new Date('2025-06-01'),
    verifyUrl: 'https://aws.amazon.com/verification',
    featured: true,
  },
  {
    name: 'Java In-Depth: Become a Complete Java Engineer!',
    issuer: 'Udemy',
    type: 'course',
    issueDate: new Date('2022-08-01'),
    featured: true,
  },
  {
    name: 'Java (Basic)',
    issuer: 'HackerRank',
    type: 'certification',
    issueDate: new Date('2022-03-01'),
  },
];

const now = Date.now();
const messages = [
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    subject: 'Backend developer role — are you open to a chat?',
    message:
      'Hi Sandeepan, I came across your portfolio and your Spring Boot microservices work looks like a great fit for a role we are hiring for. Could we set up a quick call this week?',
    timestamp: now - 1000 * 60 * 60 * 3,
    read: false,
  },
  {
    name: 'Arjun Mehta',
    email: 'arjun@example.dev',
    subject: 'Freelance project: race-timing dashboard',
    message:
      'Hello! I run timing for regional marathons and saw your bib-expo project. We need a results dashboard with live updates — would you be interested in a short freelance engagement?',
    timestamp: now - 1000 * 60 * 60 * 26,
    read: true,
  },
];

// ---- Run --------------------------------------------------------------------

async function main() {
  console.log(`Seeding emulators for ${PROJECT_ID}…`);

  await createAdminUser();

  await setDoc('profile/hero', hero);
  await setDoc('profile/about', about);
  await setDoc('profile/contact', contact);
  await setDoc('profile/services', services);

  for (const name of ['projects', 'experience', 'certifications', 'messages'])
    await clearCollection(name);

  for (const project of projects) await addDoc('projects', project);
  for (const experience of experiences) await addDoc('experience', experience);
  for (const certification of certifications)
    await addDoc('certifications', certification);
  for (const message of messages) await addDoc('messages', message);

  console.log('\nDone. Reload http://localhost:4200 to see the content.');
  console.log(`Dashboard login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

main().catch((err) => {
  console.error(`\nSeed failed: ${err.message}`);
  console.error('Are the emulators running? Start them with: npm run emulators');
  process.exit(1);
});
