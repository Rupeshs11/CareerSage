import { footerHTML } from "../components/footer.js";
import { headerHTML } from "../components/header.js";

document.addEventListener("DOMContentLoaded", () => {
  const headerPlaceholder = document.getElementById("header-placeholder");
  const footerPlaceholder = document.getElementById("footer-placeholder");
  const sidebarPlaceholder = document.getElementById("sidebar-placeholder");

  if (headerPlaceholder) headerPlaceholder.innerHTML = headerHTML;
  if (footerPlaceholder) footerPlaceholder.innerHTML = footerHTML;
  if (sidebarPlaceholder) {
    const sidebarTemplate = `
        <nav class="w-72 bg-white p-5 flex flex-col border-r h-screen">
            <div class="mb-8">
                <a href="index.html" class="flex items-center gap-3 mb-2"><div class="bg-black text-white font-bold text-xl rounded-md w-10 h-10 flex items-center justify-center">C</div><h1 class="text-xl font-bold text-gray-900">AI Tutor</h1></a>
                <p class="text-sm text-gray-500">Your personalized learning companion</p>
            </div>
            <ul class="flex flex-col gap-1">
                <li>
                    <button onclick="toggleSidebarDropdown('create-ai-menu')" class="w-full flex justify-between items-center p-2 rounded-md hover:bg-gray-100 text-left font-semibold"><span>Create with AI</span><svg id="create-ai-arrow" class="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button>
                    <div id="create-ai-menu" class="hidden pl-4 mt-1 space-y-1"><a href="#" class="block p-2 rounded-md text-gray-600 hover:bg-gray-100">Plan</a><a href="#" class="block p-2 rounded-md text-gray-600 hover:bg-gray-100">Roadmap</a><a href="#" class="block p-2 rounded-md text-gray-600 hover:bg-gray-100">Quiz</a></div>
                </li>
                <li>
                    <button onclick="toggleSidebarDropdown('my-learning-menu')" class="w-full flex justify-between items-center p-2 rounded-md hover:bg-gray-100 text-left font-semibold"><span>My Learnings</span><svg id="my-learning-arrow" class="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button>
                    <div id="my-learning-menu" class="hidden pl-4 mt-1 space-y-1"><a href="#" class="block p-2 rounded-md text-gray-600 hover:bg-gray-100">My Plans</a><a href="#" class="block p-2 rounded-md text-gray-600 hover:bg-gray-100">My Learnings</a><a href="#" class="block p-2 rounded-md text-gray-600 hover:bg-gray-100">My Quizzes</a></div>
                </li>
                <li><a href="#" class="flex items-center p-2 rounded-md hover:bg-gray-100 font-semibold">Ask Aisensie</a></li>
            </ul>
        </nav>
    `;
    sidebarPlaceholder.innerHTML = sidebarTemplate;
  }

  initAuthUI();

  runPageSpecificLogic();
});

function initAuthUI() {
  const accountDropdown = document.getElementById("accountDropdown");
  const accountBtnText = document.getElementById("account-btn-text");

  if (!accountDropdown) return;

  const user = JSON.parse(localStorage.getItem("careersage_user"));

  if (user) {
    // User is logged in - show user info and logout
    accountBtnText.textContent = user.name.split(" ")[0]; // First name only
    accountDropdown.innerHTML = `
      <div class="p-3 border-b border-gray-700">
        <p class="text-white font-semibold">${user.name}</p>
        <p class="text-gray-400 text-sm">${user.email}</p>
      </div>
      <a href="./dashboard.html" class="block">
        <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
        </svg>
        <span class="font-semibold">Dashboard</span>
      </a>
      <a href="#" onclick="logoutUser()">
        <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
        </svg>
        <span class="font-semibold text-red-400">Logout</span>
      </a>
    `;
  } else {
    // User is logged out - show login/register options
    accountBtnText.textContent = "Account";
    accountDropdown.innerHTML = `
      <a href="./login.html">
        <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
        </svg>
        <span class="font-semibold">Login</span>
      </a>
      <a href="./register.html">
        <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
        </svg>
        <span class="font-semibold">Register</span>
      </a>
    `;
  }
}

window.logoutUser = async function () {
  try {
    if (typeof API !== "undefined" && API.Auth) {
      await API.Auth.logout();
    }
  } catch (e) {
    console.error("Logout error:", e);
  }
  localStorage.removeItem("careersage_user");
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  window.location.href = "./index.html";
};

window.toggleDropdown = function (id) {
  document.querySelectorAll(".dropdown-content").forEach((dropdown) => {
    if (dropdown.id !== id) dropdown.classList.remove("show");
  });
  document.getElementById(id)?.classList.toggle("show");
};
window.onclick = function (event) {
  if (!event.target.closest("button")) {
    document.querySelectorAll(".dropdown-content").forEach((dropdown) => {
      dropdown.classList.remove("show");
    });
  }
};
window.toggleSidebarDropdown = function (menuId) {
  const menu = document.getElementById(menuId);
  const arrow = document.getElementById(menuId.replace("-menu", "-arrow"));
  menu.classList.toggle("hidden");
  arrow.classList.toggle("rotate-180");
};

function runPageSpecificLogic() {
  if (document.getElementById("features-grid")) {
    initLandingPage();
  }
  if (document.getElementById("roadmap-content")) {
    initRoadmapsPage();
  }
  if (document.getElementById("ai-topic")) {
    initAisensiePage();
  }
  if (document.getElementById("roadmap-container")) {
    initRoadmapVisualPage();
  }
}

function initLandingPage() {
  const features = [
    {
      icon: "compass",
      title: "AI Roadmap Generation",
      description:
        "Tell us your career goal, and our AI will generate a personalized, step-by-step learning path for you.",
    },
    {
      icon: "chart",
      title: "Skill Gap Analysis",
      description:
        "Identify the exact skills you need to bridge the gap between where you are and where you want to be.",
    },
    {
      icon: "book",
      title: "Resource Recommendation",
      description:
        "Get curated links to the best articles, tutorials, and courses for every step of your roadmap.",
    },
    {
      icon: "document",
      title: "Resume Builder",
      description:
        "Create a professional, tech-focused resume that highlights your new skills and gets you noticed.",
    },
  ];
  const icons = {
    compass: `<div class="relative w-12 h-12 flex items-center justify-center bg-blue-500/10 rounded-full"><div class="absolute w-1 h-8 bg-blue-500 rounded-full transform rotate-45"></div><div class="absolute w-1 h-8 bg-blue-500 rounded-full transform -rotate-45"></div><div class="absolute w-4 h-4 bg-gray-800 border-2 border-blue-500 rounded-full"></div></div>`,
    chart: `<div class="w-12 h-12 flex items-end justify-between bg-green-500/10 rounded-full p-2"><div class="w-2 h-4 bg-green-500 rounded-t-sm"></div><div class="w-2 h-8 bg-green-500 rounded-t-sm"></div><div class="w-2 h-6 bg-green-500 rounded-t-sm"></div></div>`,
    book: `<div class="w-12 h-12 flex items-center justify-center bg-purple-500/10 rounded-full p-2"><div class="w-8 h-8 border-2 border-purple-500 rounded-md"></div><div class="absolute w-1 h-8 bg-purple-500"></div></div>`,
    document: `<div class="w-12 h-12 flex flex-col items-center justify-center bg-yellow-500/10 rounded-full p-2"><div class="w-8 h-2 bg-yellow-500 rounded-sm mb-1"></div><div class="w-8 h-2 bg-yellow-500 rounded-sm mb-1"></div><div class="w-6 h-2 bg-yellow-500 rounded-sm"></div></div>`,
  };
  const featuresGrid = document.getElementById("features-grid");
  if (featuresGrid) {
    featuresGrid.innerHTML = features
      .map(
        (feature) =>
          ` <div class="bg-[#161b22] p-8 rounded-xl border border-gray-800 transition-all duration-300 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2"> <div class="mb-6">${
            icons[feature.icon]
          }</div> <h3 class="text-xl font-bold text-white mb-3">${
            feature.title
          }</h3> <p class="text-gray-400">${feature.description}</p> </div> `,
      )
      .join("");
  }
}

function initRoadmapsPage() {
  const navContainer = document.getElementById("roadmap-nav");
  const contentContainer = document.getElementById("roadmap-content");

  // Static categories for navigation
  const categories = {
    "All Roadmaps": null,
    Frontend: "frontend",
    Backend: "backend",
    "Full Stack": "fullstack",
    DevOps: "devops",
    "Data Science": "data",
  };

  let allRoadmaps = [];

  // Fetch roadmaps from API
  async function fetchRoadmaps() {
    try {
      // Check if API is available
      if (typeof API !== "undefined" && API.Roadmaps) {
        const response = await API.Roadmaps.getAll();
        allRoadmaps = response.roadmaps || [];
      } else {
        console.warn("API not available, using fallback data");
        allRoadmaps = getFallbackRoadmaps();
      }
      renderNav();
      renderContent(null); // Show all initially
    } catch (error) {
      console.error("Failed to fetch roadmaps:", error);
      allRoadmaps = getFallbackRoadmaps();
      renderNav();
      renderContent(null);
    }
  }

  // Fallback roadmaps if API fails
  function getFallbackRoadmaps() {
    return [
      {
        slug: "frontend-beginner",
        title: "Frontend Developer",
        category: "frontend",
        description: "Step by step guide to frontend development",
      },
      {
        slug: "backend",
        title: "Backend Developer",
        category: "backend",
        description: "Step by step guide to backend development",
      },
      {
        slug: "full-stack",
        title: "Full Stack Developer",
        category: "fullstack",
        description: "Complete full stack guide",
      },
      {
        slug: "devops-engineer",
        title: "DevOps Engineer",
        category: "devops",
        description: "DevOps learning path",
      },
      {
        slug: "data-scientist",
        title: "Data Scientist",
        category: "data",
        description: "Data science roadmap",
      },
      {
        slug: "react",
        title: "React Developer",
        category: "frontend",
        description: "Master React.js",
      },
      {
        slug: "python",
        title: "Python Developer",
        category: "backend",
        description: "Python learning path",
      },
      {
        slug: "javascript",
        title: "JavaScript Developer",
        category: "frontend",
        description: "Master JavaScript",
      },
    ];
  }

  function renderContent(categoryFilter) {
    let filteredRoadmaps = allRoadmaps;

    if (categoryFilter) {
      filteredRoadmaps = allRoadmaps.filter(
        (r) => r.category === categoryFilter,
      );
    }

    // Group by category
    const grouped = {};
    filteredRoadmaps.forEach((roadmap) => {
      const cat = roadmap.category || "general";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(roadmap);
    });

    const categoryTitles = {
      frontend: "Frontend Development",
      backend: "Backend Development",
      fullstack: "Full Stack Development",
      devops: "DevOps & Cloud",
      data: "Data Science & AI",
      general: "General",
    };

    contentContainer.innerHTML = Object.entries(grouped)
      .map(
        ([category, roadmaps]) => `
        <section class="mb-12">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">${categoryTitles[category] || category}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${roadmaps
              .map(
                (roadmap) => `
              <a href="./roadmap-visual.html?topic=${roadmap.slug}" 
                 class="bg-[#161b22] border border-gray-800 p-4 rounded-lg flex flex-col hover:border-blue-500 transition-colors">
                <div class="flex justify-between items-start mb-2">
                  <span class="font-semibold text-white">${roadmap.title}</span>
                  ${roadmap.is_official ? '<span class="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Official</span>' : ""}
                </div>
                <p class="text-gray-500 text-sm flex-1">${roadmap.description || ""}</p>
                <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                  <span class="text-gray-600 text-xs">${roadmap.view_count || 0} views</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </a>
            `,
              )
              .join("")}
          </div>
        </section>
      `,
      )
      .join("");

    if (filteredRoadmaps.length === 0) {
      contentContainer.innerHTML = `
        <div class="text-center py-12">
          <p class="text-gray-500">No roadmaps found in this category.</p>
        </div>
      `;
    }
  }

  function renderNav() {
    navContainer.innerHTML = Object.entries(categories)
      .map(
        ([label, value]) =>
          `<a href="#" class="side-nav-link text-gray-400 font-medium py-2 px-3 rounded-md hover:bg-gray-700" data-category="${value || "all"}">${label}</a>`,
      )
      .join("");

    const navLinks = document.querySelectorAll(".side-nav-link");
    navLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        navLinks.forEach((l) => l.classList.remove("active"));
        this.classList.add("active");
        const category =
          this.dataset.category === "all" ? null : this.dataset.category;
        renderContent(category);
      });
    });

    // Set first item as active
    const firstLink = document.querySelector(
      '.side-nav-link[data-category="all"]',
    );
    if (firstLink) firstLink.classList.add("active");
  }

  // Initialize
  fetchRoadmaps();
}

// --- AISENSIE PAGE LOGIC ---
function initAisensiePage() {
  const betterRoadmapCheckbox = document.getElementById(
    "better-roadmap-checkbox",
  );
  const questionsSection = document.getElementById("questions-section");
  const generateBtn = document.getElementById("generate-btn");
  const loadingState = document.getElementById("loading-state");

  // Skills management
  window.currentSkills = [];

  window.addSkill = function () {
    const skillInput = document.getElementById("skill-input");
    const skill = skillInput.value.trim();
    if (skill && !window.currentSkills.includes(skill)) {
      window.currentSkills.push(skill);
      renderSkills();
      skillInput.value = "";
    }
  };

  window.quickAddSkill = function (skill) {
    if (!window.currentSkills.includes(skill)) {
      window.currentSkills.push(skill);
      renderSkills();
    }
  };

  window.removeSkill = function (skill) {
    window.currentSkills = window.currentSkills.filter((s) => s !== skill);
    renderSkills();
  };

  function renderSkills() {
    const container = document.getElementById("skills-container");
    container.innerHTML = window.currentSkills
      .map(
        (skill) => `
      <span class="inline-flex items-center gap-1 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
        ${skill}
        <button onclick="removeSkill('${skill}')" class="hover:text-red-400 ml-1">&times;</button>
      </span>
    `,
      )
      .join("");
  }

  // Skill input enter key
  document
    .getElementById("skill-input")
    ?.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        window.addSkill();
      }
    });

  // Better roadmap checkbox toggle
  if (betterRoadmapCheckbox) {
    betterRoadmapCheckbox.addEventListener("change", () => {
      if (betterRoadmapCheckbox.checked) {
        questionsSection.classList.add("open");
      } else {
        questionsSection.classList.remove("open");
      }
    });
  }
}

function initRoadmapVisualPage() {
  const masterRoadmapData = {
    "frontend-beginner": {
      title: "Frontend Developer",
      description:
        "Step by step guide to becoming a modern frontend developer in 2025",
      nodes: [
        // === INTERNET SECTION ===
        {
          id: "internet",
          title: "Internet",
          x: 550,
          y: 0,
          type: "required",
          topics: [
            "How does the internet work?",
            "What is HTTP?",
            "What is Domain Name?",
            "What is hosting?",
            "DNS and how it works?",
            "Browsers and how they work?",
          ],
        },

        // === HTML SECTION (Left Branch) ===
        {
          id: "html",
          title: "HTML",
          x: 200,
          y: 120,
          type: "required",
          topics: [
            "Learn the basics",
            "Writing Semantic HTML",
            "Forms and Validations",
            "Accessibility",
            "SEO Basics",
          ],
        },

        // === CSS SECTION (Center) ===
        {
          id: "css",
          title: "CSS",
          x: 550,
          y: 120,
          type: "required",
          topics: ["Learn the basics", "Making Layouts", "Responsive Design"],
        },

        // === JAVASCRIPT SECTION (Right Branch) ===
        {
          id: "javascript",
          title: "JavaScript",
          x: 900,
          y: 120,
          type: "required",
          topics: [
            "Learn the Basics",
            "Learn DOM Manipulation",
            "Fetch API / Ajax (XHR)",
          ],
        },

        // === VERSION CONTROL ===
        {
          id: "vcs",
          title: "Version Control Systems",
          x: 550,
          y: 240,
          type: "required",
          topics: ["Git - Basic Usage", "Git - Branching", "Git - Merging"],
        },

        // === VCS HOSTING & PACKAGE MANAGERS ===
        {
          id: "github",
          title: "GitHub",
          x: 350,
          y: 360,
          type: "required",
          topics: ["Repos", "Pull Requests", "Issues", "Actions"],
        },
        {
          id: "gitlab",
          title: "GitLab",
          x: 450,
          y: 360,
          type: "alternative",
          topics: ["CI/CD", "Merge Requests"],
        },
        {
          id: "bitbucket",
          title: "Bitbucket",
          x: 550,
          y: 360,
          type: "alternative",
          topics: ["Pipelines", "Jira Integration"],
        },
        {
          id: "npm",
          title: "npm",
          x: 700,
          y: 360,
          type: "required",
          topics: ["Package Installation", "Scripts", "Publishing"],
        },
        {
          id: "yarn",
          title: "yarn",
          x: 800,
          y: 360,
          type: "alternative",
          topics: ["Workspaces", "Berry"],
        },
        {
          id: "pnpm",
          title: "pnpm",
          x: 900,
          y: 360,
          type: "alternative",
          topics: ["Efficient Storage", "Monorepos"],
        },

        // === CSS ARCHITECTURE & PREPROCESSORS ===
        {
          id: "bem",
          title: "BEM",
          x: 150,
          y: 480,
          type: "alternative",
          topics: ["Block Element Modifier", "Naming Convention"],
        },
        {
          id: "css-architecture",
          title: "CSS Architecture",
          x: 250,
          y: 480,
          type: "alternative",
          topics: ["OOCSS", "SMACSS", "Atomic CSS"],
        },
        {
          id: "sass",
          title: "Sass",
          x: 400,
          y: 480,
          type: "alternative",
          topics: ["Variables", "Nesting", "Mixins", "Functions"],
        },
        {
          id: "postcss",
          title: "PostCSS",
          x: 500,
          y: 480,
          type: "alternative",
          topics: ["Autoprefixer", "CSS Modules"],
        },
        {
          id: "tailwind",
          title: "Tailwind CSS",
          x: 650,
          y: 480,
          type: "recommended",
          topics: ["Utility Classes", "Customization", "JIT Mode"],
        },

        // === FRAMEWORKS ===
        {
          id: "react",
          title: "React",
          x: 300,
          y: 600,
          type: "recommended",
          topics: ["Components", "JSX", "Props", "State", "Hooks", "Context"],
        },
        {
          id: "vue",
          title: "Vue.js",
          x: 450,
          y: 600,
          type: "alternative",
          topics: ["Templates", "Composition API", "Vuex", "Vue Router"],
        },
        {
          id: "angular",
          title: "Angular",
          x: 600,
          y: 600,
          type: "alternative",
          topics: ["TypeScript", "RxJS", "Modules", "Services", "DI"],
        },
        {
          id: "svelte",
          title: "Svelte",
          x: 750,
          y: 600,
          type: "alternative",
          topics: ["Reactivity", "Stores", "SvelteKit"],
        },
        {
          id: "solid",
          title: "Solid.js",
          x: 900,
          y: 600,
          type: "alternative",
          topics: ["Fine-grained Reactivity", "JSX"],
        },
        {
          id: "qwik",
          title: "Qwik",
          x: 1000,
          y: 600,
          type: "alternative",
          topics: ["Resumability", "Progressive Hydration"],
        },

        // === BUILD TOOLS ===
        {
          id: "vite",
          title: "Vite",
          x: 350,
          y: 720,
          type: "recommended",
          topics: ["Dev Server", "HMR", "Build"],
        },
        {
          id: "esbuild",
          title: "esbuild",
          x: 450,
          y: 720,
          type: "alternative",
          topics: ["Bundling", "Minification"],
        },
        {
          id: "webpack",
          title: "Webpack",
          x: 550,
          y: 720,
          type: "alternative",
          topics: ["Loaders", "Plugins", "Code Splitting"],
        },
        {
          id: "rollup",
          title: "Rollup",
          x: 650,
          y: 720,
          type: "alternative",
          topics: ["ES Modules", "Tree Shaking"],
        },
        {
          id: "parcel",
          title: "Parcel",
          x: 750,
          y: 720,
          type: "alternative",
          topics: ["Zero Config", "Auto Transform"],
        },

        // === LINTERS & FORMATTERS ===
        {
          id: "prettier",
          title: "Prettier",
          x: 350,
          y: 840,
          type: "required",
          topics: ["Code Formatting", "Config"],
        },
        {
          id: "eslint",
          title: "ESLint",
          x: 500,
          y: 840,
          type: "required",
          topics: ["Linting Rules", "Plugins", "Flat Config"],
        },

        // === TESTING ===
        {
          id: "vitest",
          title: "Vitest",
          x: 300,
          y: 960,
          type: "recommended",
          topics: ["Unit Testing", "Mocking", "Coverage"],
        },
        {
          id: "jest",
          title: "Jest",
          x: 400,
          y: 960,
          type: "alternative",
          topics: ["Snapshots", "Mocking", "Coverage"],
        },
        {
          id: "playwright",
          title: "Playwright",
          x: 550,
          y: 960,
          type: "recommended",
          topics: ["E2E Testing", "Cross-browser"],
        },
        {
          id: "cypress",
          title: "Cypress",
          x: 700,
          y: 960,
          type: "alternative",
          topics: ["E2E Testing", "Component Testing"],
        },

        // === TYPESCRIPT ===
        {
          id: "typescript",
          title: "TypeScript",
          x: 900,
          y: 840,
          type: "recommended",
          topics: ["Types", "Interfaces", "Generics", "Enums", "Utility Types"],
        },

        // === AUTH & SECURITY ===
        {
          id: "jwt",
          title: "JWT",
          x: 200,
          y: 1080,
          type: "required",
          topics: ["Token Structure", "Signing", "Verification"],
        },
        {
          id: "oauth",
          title: "OAuth",
          x: 300,
          y: 1080,
          type: "required",
          topics: ["OAuth 2.0", "OpenID Connect"],
        },
        {
          id: "basic-auth",
          title: "Basic Auth",
          x: 400,
          y: 1080,
          type: "anytime",
          topics: ["HTTP Basic", "Headers"],
        },
        {
          id: "session-auth",
          title: "Session Auth",
          x: 500,
          y: 1080,
          type: "anytime",
          topics: ["Cookies", "Server Sessions"],
        },
        {
          id: "cors",
          title: "CORS",
          x: 700,
          y: 1080,
          type: "required",
          topics: ["Cross-Origin", "Preflight", "Headers"],
        },
        {
          id: "https",
          title: "HTTPS",
          x: 800,
          y: 1080,
          type: "required",
          topics: ["SSL/TLS", "Certificates"],
        },
        {
          id: "csp",
          title: "Content Security Policy",
          x: 950,
          y: 1080,
          type: "required",
          topics: ["Directives", "Nonce", "Hashes"],
        },
        {
          id: "owasp",
          title: "OWASP Security Risks",
          x: 1100,
          y: 1080,
          type: "required",
          topics: ["XSS", "CSRF", "Injection"],
        },

        // === ADVANCED ===
        {
          id: "web-components",
          title: "Web Components",
          x: 150,
          y: 1200,
          type: "anytime",
          topics: ["Custom Elements", "Shadow DOM", "HTML Templates"],
        },
        {
          id: "ssr",
          title: "SSR",
          x: 550,
          y: 1200,
          type: "recommended",
          topics: ["Server vs Client Rendering", "Hydration"],
        },
        {
          id: "nextjs",
          title: "Next.js",
          x: 450,
          y: 1320,
          type: "recommended",
          topics: ["App Router", "Server Components", "API Routes"],
        },
        {
          id: "nuxtjs",
          title: "Nuxt.js",
          x: 550,
          y: 1320,
          type: "alternative",
          topics: ["File-based Routing", "Modules"],
        },
        {
          id: "sveltekit",
          title: "SvelteKit",
          x: 650,
          y: 1320,
          type: "alternative",
          topics: ["Adapters", "Form Actions"],
        },
        {
          id: "graphql",
          title: "GraphQL",
          x: 900,
          y: 1200,
          type: "alternative",
          topics: ["Queries", "Mutations", "Subscriptions"],
        },
        {
          id: "apollo",
          title: "Apollo",
          x: 850,
          y: 1320,
          type: "alternative",
          topics: ["Client", "Cache", "DevTools"],
        },
        {
          id: "relay",
          title: "Relay Modern",
          x: 950,
          y: 1320,
          type: "alternative",
          topics: ["Fragments", "Pagination"],
        },

        // === STATIC SITE GENERATORS ===
        {
          id: "astro",
          title: "Astro",
          x: 300,
          y: 1440,
          type: "alternative",
          topics: ["Islands", "Zero JS", "Integrations"],
        },
        {
          id: "eleventy",
          title: "Eleventy",
          x: 400,
          y: 1440,
          type: "alternative",
          topics: ["Templates", "Data Cascade"],
        },
        {
          id: "hugo",
          title: "Hugo",
          x: 500,
          y: 1440,
          type: "alternative",
          topics: ["Go Templates", "Speed"],
        },

        // === PERFORMANCE ===
        {
          id: "lighthouse",
          title: "Lighthouse",
          x: 700,
          y: 1440,
          type: "required",
          topics: ["Performance Score", "Accessibility", "SEO"],
        },
        {
          id: "devtools",
          title: "DevTools",
          x: 800,
          y: 1440,
          type: "required",
          topics: ["Network", "Performance", "Memory"],
        },
        {
          id: "core-web-vitals",
          title: "Core Web Vitals",
          x: 900,
          y: 1440,
          type: "required",
          topics: ["LCP", "FID", "CLS"],
        },

        // === PWA & MOBILE ===
        {
          id: "pwa",
          title: "PWAs",
          x: 400,
          y: 1560,
          type: "alternative",
          topics: [
            "Service Workers",
            "Manifest",
            "Offline",
            "Push Notifications",
          ],
        },
        {
          id: "react-native",
          title: "React Native",
          x: 650,
          y: 1560,
          type: "alternative",
          topics: ["Native Components", "Expo"],
        },
        {
          id: "flutter",
          title: "Flutter",
          x: 750,
          y: 1560,
          type: "alternative",
          topics: ["Widgets", "Dart"],
        },
        {
          id: "ionic",
          title: "Ionic",
          x: 850,
          y: 1560,
          type: "alternative",
          topics: ["Capacitor", "Web Components"],
        },
      ],
      connections: [
        { from: "internet", to: "html" },
        { from: "internet", to: "css" },
        { from: "internet", to: "javascript" },
        { from: "html", to: "vcs" },
        { from: "css", to: "vcs" },
        { from: "javascript", to: "vcs" },
        { from: "vcs", to: "github" },
        { from: "vcs", to: "gitlab" },
        { from: "vcs", to: "bitbucket" },
        { from: "vcs", to: "npm" },
        { from: "vcs", to: "yarn" },
        { from: "vcs", to: "pnpm" },
        { from: "github", to: "bem" },
        { from: "github", to: "css-architecture" },
        { from: "npm", to: "sass" },
        { from: "npm", to: "postcss" },
        { from: "npm", to: "tailwind" },
        { from: "tailwind", to: "react" },
        { from: "tailwind", to: "vue" },
        { from: "tailwind", to: "angular" },
        { from: "sass", to: "svelte" },
        { from: "postcss", to: "solid" },
        { from: "postcss", to: "qwik" },
        { from: "react", to: "vite" },
        { from: "vue", to: "webpack" },
        { from: "angular", to: "esbuild" },
        { from: "vite", to: "prettier" },
        { from: "webpack", to: "eslint" },
        { from: "prettier", to: "vitest" },
        { from: "eslint", to: "jest" },
        { from: "vitest", to: "playwright" },
        { from: "jest", to: "cypress" },
        { from: "eslint", to: "typescript" },
        { from: "playwright", to: "jwt" },
        { from: "cypress", to: "oauth" },
        { from: "typescript", to: "cors" },
        { from: "typescript", to: "https" },
        { from: "jwt", to: "web-components" },
        { from: "oauth", to: "ssr" },
        { from: "cors", to: "graphql" },
        { from: "https", to: "owasp" },
        { from: "ssr", to: "nextjs" },
        { from: "ssr", to: "nuxtjs" },
        { from: "ssr", to: "sveltekit" },
        { from: "graphql", to: "apollo" },
        { from: "graphql", to: "relay" },
        { from: "nextjs", to: "astro" },
        { from: "nuxtjs", to: "eleventy" },
        { from: "sveltekit", to: "hugo" },
        { from: "astro", to: "lighthouse" },
        { from: "eleventy", to: "devtools" },
        { from: "hugo", to: "core-web-vitals" },
        { from: "lighthouse", to: "pwa" },
        { from: "devtools", to: "react-native" },
        { from: "core-web-vitals", to: "flutter" },
        { from: "core-web-vitals", to: "ionic" },
      ],
      faqs: [
        {
          question: "What is a Frontend Developer?",
          answer:
            "A frontend developer creates the visual and interactive aspects of a website using HTML, CSS, and JavaScript.",
        },
        {
          question: "Do I need a CS degree?",
          answer:
            "No, many successful frontend developers are self-taught. A strong portfolio matters more than degrees.",
        },
        {
          question: "How long does it take to learn frontend?",
          answer:
            "3-6 months for basics, 6-12 months to be job-ready with consistent practice.",
        },
        {
          question: "Which framework should I learn first?",
          answer:
            "React is the most popular choice with the largest job market, but Vue is easier for beginners.",
        },
      ],
    },

    backend: {
      title: "Backend Developer",
      description:
        "Step by step guide to becoming a modern backend developer in 2025",
      nodes: [
        {
          id: "internet",
          title: "Internet",
          x: 500,
          y: 0,
          type: "required",
          topics: ["How does the internet work?", "HTTP/HTTPS", "APIs", "DNS"],
        },
        {
          id: "language",
          title: "Pick a Language",
          x: 500,
          y: 140,
          type: "required",
          topics: ["Node.js", "Python", "Java", "Go", "Rust"],
        },
        {
          id: "git",
          title: "Version Control",
          x: 500,
          y: 280,
          type: "required",
          topics: ["Git Basics", "GitHub", "Branching", "Pull Requests"],
        },
        {
          id: "databases",
          title: "Relational Databases",
          x: 300,
          y: 420,
          type: "required",
          topics: ["PostgreSQL", "MySQL", "SQL Queries", "Joins", "Indexes"],
        },
        {
          id: "nosql",
          title: "NoSQL Databases",
          x: 700,
          y: 420,
          type: "recommended",
          topics: ["MongoDB", "Redis", "Firebase"],
        },
        {
          id: "api",
          title: "APIs",
          x: 500,
          y: 560,
          type: "required",
          topics: ["REST", "JSON APIs", "GraphQL", "gRPC"],
        },
        {
          id: "auth",
          title: "Authentication",
          x: 300,
          y: 700,
          type: "required",
          topics: ["JWT", "OAuth 2.0", "Session Auth", "Cookies"],
        },
        {
          id: "caching",
          title: "Caching",
          x: 700,
          y: 700,
          type: "recommended",
          topics: ["Redis", "Memcached", "CDN"],
        },
        {
          id: "testing",
          title: "Testing",
          x: 500,
          y: 840,
          type: "required",
          topics: ["Unit Testing", "Integration Testing", "E2E Testing"],
        },
        {
          id: "docker",
          title: "Containerization",
          x: 300,
          y: 980,
          type: "required",
          topics: ["Docker", "Docker Compose"],
        },
        {
          id: "ci-cd",
          title: "CI/CD",
          x: 700,
          y: 980,
          type: "recommended",
          topics: ["GitHub Actions", "Jenkins", "GitLab CI"],
        },
        {
          id: "cloud",
          title: "Cloud Services",
          x: 500,
          y: 1120,
          type: "required",
          topics: ["AWS", "GCP", "Azure", "Heroku"],
        },
        {
          id: "security",
          title: "Web Security",
          x: 500,
          y: 1260,
          type: "required",
          topics: ["OWASP Top 10", "CORS", "SQL Injection", "XSS"],
        },
      ],
      connections: [
        { from: "internet", to: "language" },
        { from: "language", to: "git" },
        { from: "git", to: "databases" },
        { from: "git", to: "nosql" },
        { from: "databases", to: "api" },
        { from: "nosql", to: "api" },
        { from: "api", to: "auth" },
        { from: "api", to: "caching" },
        { from: "auth", to: "testing" },
        { from: "caching", to: "testing" },
        { from: "testing", to: "docker" },
        { from: "testing", to: "ci-cd" },
        { from: "docker", to: "cloud" },
        { from: "ci-cd", to: "cloud" },
        { from: "cloud", to: "security" },
      ],
      faqs: [
        {
          question: "What does a Backend Developer do?",
          answer:
            "They build server-side logic, databases, and APIs that power web applications.",
        },
        {
          question: "Which language should I start with?",
          answer:
            "Node.js or Python are great for beginners due to their large communities and resources.",
        },
      ],
    },

    "full-stack": {
      title: "Full Stack Developer",
      description: "Master both frontend and backend development",
      nodes: [
        {
          id: "html-css",
          title: "HTML & CSS",
          x: 500,
          y: 0,
          type: "required",
          topics: ["HTML5", "CSS3", "Flexbox", "Grid", "Responsive Design"],
        },
        {
          id: "javascript",
          title: "JavaScript",
          x: 500,
          y: 140,
          type: "required",
          topics: ["ES6+", "DOM", "Async/Await", "Fetch API"],
        },
        {
          id: "react",
          title: "Frontend Framework",
          x: 300,
          y: 280,
          type: "required",
          topics: ["React", "Vue", "Angular"],
        },
        {
          id: "git",
          title: "Git & GitHub",
          x: 700,
          y: 280,
          type: "required",
          topics: ["Version Control", "Branching", "PRs"],
        },
        {
          id: "nodejs",
          title: "Node.js",
          x: 500,
          y: 420,
          type: "required",
          topics: ["Express.js", "REST APIs", "Middleware"],
        },
        {
          id: "databases",
          title: "Databases",
          x: 500,
          y: 560,
          type: "required",
          topics: ["PostgreSQL", "MongoDB", "ORMs"],
        },
        {
          id: "auth",
          title: "Authentication",
          x: 300,
          y: 700,
          type: "required",
          topics: ["JWT", "OAuth", "Sessions"],
        },
        {
          id: "testing",
          title: "Testing",
          x: 700,
          y: 700,
          type: "recommended",
          topics: ["Jest", "Cypress", "Mocha"],
        },
        {
          id: "docker",
          title: "Docker",
          x: 500,
          y: 840,
          type: "recommended",
          topics: ["Containers", "Docker Compose"],
        },
        {
          id: "deployment",
          title: "Deployment",
          x: 500,
          y: 980,
          type: "required",
          topics: ["Vercel", "Heroku", "AWS", "CI/CD"],
        },
      ],
      connections: [
        { from: "html-css", to: "javascript" },
        { from: "javascript", to: "react" },
        { from: "javascript", to: "git" },
        { from: "react", to: "nodejs" },
        { from: "git", to: "nodejs" },
        { from: "nodejs", to: "databases" },
        { from: "databases", to: "auth" },
        { from: "databases", to: "testing" },
        { from: "auth", to: "docker" },
        { from: "testing", to: "docker" },
        { from: "docker", to: "deployment" },
      ],
      faqs: [
        {
          question: "How long to become a Full Stack Developer?",
          answer: "With consistent learning, 12-18 months to become job-ready.",
        },
      ],
    },

    "devops-engineer": {
      title: "DevOps Engineer",
      description: "Learn to bridge development and operations",
      nodes: [
        {
          id: "linux",
          title: "Linux Fundamentals",
          x: 500,
          y: 0,
          type: "required",
          topics: [
            "Command Line",
            "Shell Scripting",
            "File System",
            "Permissions",
          ],
        },
        {
          id: "networking",
          title: "Networking",
          x: 500,
          y: 140,
          type: "required",
          topics: ["TCP/IP", "DNS", "HTTP", "Firewalls", "Load Balancers"],
        },
        {
          id: "git",
          title: "Version Control",
          x: 500,
          y: 280,
          type: "required",
          topics: ["Git", "GitHub", "GitLab", "Branching Strategies"],
        },
        {
          id: "containers",
          title: "Containers",
          x: 300,
          y: 420,
          type: "required",
          topics: ["Docker", "Docker Compose", "Container Registry"],
        },
        {
          id: "ci-cd",
          title: "CI/CD",
          x: 700,
          y: 420,
          type: "required",
          topics: ["GitHub Actions", "Jenkins", "GitLab CI", "ArgoCD"],
        },
        {
          id: "kubernetes",
          title: "Kubernetes",
          x: 500,
          y: 560,
          type: "required",
          topics: ["Pods", "Services", "Deployments", "Helm", "kubectl"],
        },
        {
          id: "cloud",
          title: "Cloud Providers",
          x: 500,
          y: 700,
          type: "required",
          topics: ["AWS", "GCP", "Azure"],
        },
        {
          id: "iac",
          title: "Infrastructure as Code",
          x: 300,
          y: 840,
          type: "required",
          topics: ["Terraform", "Ansible", "Pulumi"],
        },
        {
          id: "monitoring",
          title: "Monitoring",
          x: 700,
          y: 840,
          type: "required",
          topics: ["Prometheus", "Grafana", "ELK Stack", "Datadog"],
        },
        {
          id: "security",
          title: "DevSecOps",
          x: 500,
          y: 980,
          type: "recommended",
          topics: ["SAST", "DAST", "Secret Management", "Vault"],
        },
      ],
      connections: [
        { from: "linux", to: "networking" },
        { from: "networking", to: "git" },
        { from: "git", to: "containers" },
        { from: "git", to: "ci-cd" },
        { from: "containers", to: "kubernetes" },
        { from: "ci-cd", to: "kubernetes" },
        { from: "kubernetes", to: "cloud" },
        { from: "cloud", to: "iac" },
        { from: "cloud", to: "monitoring" },
        { from: "iac", to: "security" },
        { from: "monitoring", to: "security" },
      ],
      faqs: [
        {
          question: "What is DevOps?",
          answer:
            "DevOps is a set of practices that combines software development and IT operations.",
        },
      ],
    },

    "data-scientist": {
      title: "Data Scientist",
      description:
        "Learn to extract insights from data using AI and statistics",
      nodes: [
        {
          id: "python",
          title: "Python",
          x: 500,
          y: 0,
          type: "required",
          topics: ["Syntax", "Data Types", "Functions", "OOP"],
        },
        {
          id: "math",
          title: "Mathematics",
          x: 500,
          y: 140,
          type: "required",
          topics: ["Linear Algebra", "Calculus", "Statistics", "Probability"],
        },
        {
          id: "numpy",
          title: "NumPy & Pandas",
          x: 300,
          y: 280,
          type: "required",
          topics: ["Arrays", "DataFrames", "Data Manipulation"],
        },
        {
          id: "viz",
          title: "Data Visualization",
          x: 700,
          y: 280,
          type: "required",
          topics: ["Matplotlib", "Seaborn", "Plotly"],
        },
        {
          id: "ml",
          title: "Machine Learning",
          x: 500,
          y: 420,
          type: "required",
          topics: [
            "Scikit-learn",
            "Regression",
            "Classification",
            "Clustering",
          ],
        },
        {
          id: "deep",
          title: "Deep Learning",
          x: 300,
          y: 560,
          type: "recommended",
          topics: ["TensorFlow", "PyTorch", "Neural Networks", "CNNs", "RNNs"],
        },
        {
          id: "nlp",
          title: "NLP",
          x: 700,
          y: 560,
          type: "alternative",
          topics: ["Text Processing", "Transformers", "BERT", "GPT"],
        },
        {
          id: "sql",
          title: "SQL & Databases",
          x: 500,
          y: 700,
          type: "required",
          topics: ["SQL Queries", "PostgreSQL", "Data Warehouses"],
        },
        {
          id: "bigdata",
          title: "Big Data",
          x: 500,
          y: 840,
          type: "alternative",
          topics: ["Spark", "Hadoop", "Distributed Computing"],
        },
        {
          id: "mlops",
          title: "MLOps",
          x: 500,
          y: 980,
          type: "recommended",
          topics: ["Model Deployment", "MLflow", "Docker", "Kubernetes"],
        },
      ],
      connections: [
        { from: "python", to: "math" },
        { from: "math", to: "numpy" },
        { from: "math", to: "viz" },
        { from: "numpy", to: "ml" },
        { from: "viz", to: "ml" },
        { from: "ml", to: "deep" },
        { from: "ml", to: "nlp" },
        { from: "ml", to: "sql" },
        { from: "sql", to: "bigdata" },
        { from: "deep", to: "mlops" },
        { from: "nlp", to: "mlops" },
        { from: "bigdata", to: "mlops" },
      ],
      faqs: [
        {
          question: "Do I need a PhD for Data Science?",
          answer:
            "No! Many data scientists have bachelor's degrees or are self-taught with strong portfolios.",
        },
      ],
    },

    react: {
      title: "React Developer",
      description: "Master React.js for building modern web applications",
      nodes: [
        {
          id: "js-basics",
          title: "JavaScript Fundamentals",
          x: 500,
          y: 0,
          type: "required",
          topics: ["ES6+", "Async/Await", "Modules", "Destructuring"],
        },
        {
          id: "react-basics",
          title: "React Basics",
          x: 500,
          y: 140,
          type: "required",
          topics: ["JSX", "Components", "Props", "State"],
        },
        {
          id: "hooks",
          title: "React Hooks",
          x: 500,
          y: 280,
          type: "required",
          topics: ["useState", "useEffect", "useContext", "useRef", "useMemo"],
        },
        {
          id: "routing",
          title: "React Router",
          x: 300,
          y: 420,
          type: "required",
          topics: ["Routes", "Navigation", "URL Parameters"],
        },
        {
          id: "state-mgmt",
          title: "State Management",
          x: 700,
          y: 420,
          type: "required",
          topics: ["Context API", "Redux", "Zustand", "Jotai"],
        },
        {
          id: "styling",
          title: "Styling",
          x: 500,
          y: 560,
          type: "required",
          topics: ["CSS Modules", "Styled Components", "Tailwind CSS"],
        },
        {
          id: "api",
          title: "API Integration",
          x: 500,
          y: 700,
          type: "required",
          topics: ["Fetch", "Axios", "React Query", "SWR"],
        },
        {
          id: "testing",
          title: "Testing",
          x: 300,
          y: 840,
          type: "recommended",
          topics: ["Jest", "React Testing Library", "Cypress"],
        },
        {
          id: "typescript",
          title: "TypeScript",
          x: 700,
          y: 840,
          type: "recommended",
          topics: ["Types", "Interfaces", "Generics"],
        },
        {
          id: "nextjs",
          title: "Next.js",
          x: 500,
          y: 980,
          type: "recommended",
          topics: ["SSR", "SSG", "API Routes", "App Router"],
        },
      ],
      connections: [
        { from: "js-basics", to: "react-basics" },
        { from: "react-basics", to: "hooks" },
        { from: "hooks", to: "routing" },
        { from: "hooks", to: "state-mgmt" },
        { from: "routing", to: "styling" },
        { from: "state-mgmt", to: "styling" },
        { from: "styling", to: "api" },
        { from: "api", to: "testing" },
        { from: "api", to: "typescript" },
        { from: "testing", to: "nextjs" },
        { from: "typescript", to: "nextjs" },
      ],
      faqs: [
        {
          question: "Should I learn React or Vue?",
          answer:
            "Both are great! React has more job opportunities, Vue is easier to learn.",
        },
      ],
    },

    python: {
      title: "Python Developer",
      description:
        "Learn Python for web development, data science, and automation",
      nodes: [
        {
          id: "basics",
          title: "Python Basics",
          x: 500,
          y: 0,
          type: "required",
          topics: ["Syntax", "Data Types", "Control Flow", "Functions"],
        },
        {
          id: "oop",
          title: "OOP",
          x: 500,
          y: 140,
          type: "required",
          topics: ["Classes", "Inheritance", "Polymorphism", "Encapsulation"],
        },
        {
          id: "packages",
          title: "Package Management",
          x: 500,
          y: 280,
          type: "required",
          topics: ["pip", "venv", "Poetry", "Conda"],
        },
        {
          id: "web",
          title: "Web Frameworks",
          x: 300,
          y: 420,
          type: "recommended",
          topics: ["Django", "Flask", "FastAPI"],
        },
        {
          id: "data",
          title: "Data Science",
          x: 700,
          y: 420,
          type: "alternative",
          topics: ["NumPy", "Pandas", "Matplotlib"],
        },
        {
          id: "databases",
          title: "Databases",
          x: 500,
          y: 560,
          type: "required",
          topics: ["SQLAlchemy", "PostgreSQL", "MongoDB"],
        },
        {
          id: "testing",
          title: "Testing",
          x: 300,
          y: 700,
          type: "required",
          topics: ["pytest", "unittest", "Coverage"],
        },
        {
          id: "async",
          title: "Async Python",
          x: 700,
          y: 700,
          type: "recommended",
          topics: ["asyncio", "aiohttp", "Celery"],
        },
        {
          id: "deployment",
          title: "Deployment",
          x: 500,
          y: 840,
          type: "required",
          topics: ["Docker", "Gunicorn", "AWS", "Heroku"],
        },
      ],
      connections: [
        { from: "basics", to: "oop" },
        { from: "oop", to: "packages" },
        { from: "packages", to: "web" },
        { from: "packages", to: "data" },
        { from: "web", to: "databases" },
        { from: "data", to: "databases" },
        { from: "databases", to: "testing" },
        { from: "databases", to: "async" },
        { from: "testing", to: "deployment" },
        { from: "async", to: "deployment" },
      ],
      faqs: [
        {
          question: "Is Python good for beginners?",
          answer:
            "Yes! Python has simple syntax and is one of the best languages to start with.",
        },
      ],
    },

    javascript: {
      title: "JavaScript Developer",
      description: "Master JavaScript for frontend and backend development",
      nodes: [
        {
          id: "basics",
          title: "JS Fundamentals",
          x: 500,
          y: 0,
          type: "required",
          topics: ["Variables", "Data Types", "Operators", "Control Flow"],
        },
        {
          id: "functions",
          title: "Functions",
          x: 500,
          y: 140,
          type: "required",
          topics: ["Arrow Functions", "Callbacks", "Closures", "Scope"],
        },
        {
          id: "dom",
          title: "DOM Manipulation",
          x: 500,
          y: 280,
          type: "required",
          topics: ["Selectors", "Events", "Manipulation"],
        },
        {
          id: "async",
          title: "Async JavaScript",
          x: 500,
          y: 420,
          type: "required",
          topics: ["Promises", "Async/Await", "Fetch API"],
        },
        {
          id: "es6",
          title: "ES6+ Features",
          x: 300,
          y: 560,
          type: "required",
          topics: ["Destructuring", "Spread", "Modules", "Classes"],
        },
        {
          id: "typescript",
          title: "TypeScript",
          x: 700,
          y: 560,
          type: "recommended",
          topics: ["Types", "Interfaces", "Generics"],
        },
        {
          id: "react",
          title: "React",
          x: 300,
          y: 700,
          type: "recommended",
          topics: ["Components", "Hooks", "State"],
        },
        {
          id: "node",
          title: "Node.js",
          x: 700,
          y: 700,
          type: "recommended",
          topics: ["Express", "APIs", "npm"],
        },
        {
          id: "testing",
          title: "Testing",
          x: 500,
          y: 840,
          type: "required",
          topics: ["Jest", "Mocha", "Testing Library"],
        },
      ],
      connections: [
        { from: "basics", to: "functions" },
        { from: "functions", to: "dom" },
        { from: "dom", to: "async" },
        { from: "async", to: "es6" },
        { from: "async", to: "typescript" },
        { from: "es6", to: "react" },
        { from: "typescript", to: "node" },
        { from: "react", to: "testing" },
        { from: "node", to: "testing" },
      ],
      faqs: [
        {
          question: "Is JavaScript hard to learn?",
          answer:
            "JavaScript is beginner-friendly but has depth for advanced concepts.",
        },
      ],
    },

    default: {
      title: "Roadmap Not Found",
      description: "Please select a valid roadmap from the previous page.",
      nodes: [],
      connections: [],
      faqs: [],
    },
  }; // Step 1: URL se topic ka naam nikalo

  const urlParams = new URLSearchParams(window.location.search);
  const topic = urlParams.get("topic") || "default";
  const isAIGenerated = urlParams.get("ai") === "true";
  const isSavedRoadmap = urlParams.get("saved") === "true";
  const roadmapId = urlParams.get("id");

  // Step 2: Load the roadmap data
  let currentRoadmap;
  let roadmapLoaded = false;

  // Function to initialize the page once roadmap is loaded
  async function initializePage() {
    // Case 1: Saved roadmap from dashboard - fetch from API
    if (isSavedRoadmap && roadmapId) {
      try {
        console.log("Fetching saved roadmap from API, ID:", roadmapId);
        const response = await API.Dashboard.getRoadmapById(roadmapId);
        if (response.roadmap) {
          currentRoadmap = {
            id: response.roadmap.id,
            title: response.roadmap.title || "Saved Roadmap",
            description: response.roadmap.description || "Your learning path",
            nodes: response.roadmap.nodes || [],
            connections: response.roadmap.connections || [],
            completed_nodes: response.roadmap.completed_nodes || [],
            faqs: [],
          };
          console.log("Loaded saved roadmap from API:", currentRoadmap);
          roadmapLoaded = true;
        }
      } catch (e) {
        console.error("Failed to fetch saved roadmap:", e);
      }
    }

    // Case 2: AI-generated roadmap from localStorage
    if (!roadmapLoaded && isAIGenerated && roadmapId) {
      const storedRoadmap = localStorage.getItem("generated_roadmap");
      if (storedRoadmap) {
        try {
          const parsed = JSON.parse(storedRoadmap);
          if (parsed.id && parsed.id.toString() === roadmapId) {
            currentRoadmap = {
              title: parsed.title || "AI Generated Roadmap",
              description:
                parsed.description || "Your personalized learning path",
              nodes: parsed.nodes || [],
              connections: parsed.connections || [],
              faqs: [],
            };
            console.log("Loaded AI-generated roadmap:", currentRoadmap);
            roadmapLoaded = true;
          }
        } catch (e) {
          console.error("Failed to parse stored roadmap:", e);
        }
      }
    }

    // Case 3: Predefined topic roadmap
    if (!roadmapLoaded) {
      console.log(
        "Roadmap not loaded from API or Storage. Checking master data for topic:",
        topic,
      );
      if (masterRoadmapData && masterRoadmapData[topic]) {
        currentRoadmap = masterRoadmapData[topic];
      } else if (masterRoadmapData && masterRoadmapData["default"]) {
        currentRoadmap = masterRoadmapData["default"];
      } else {
        console.error(
          "Critical Error: Master Roadmap Data is missing or corrupt.",
        );
      }
      console.log("Set currentRoadmap from master data:", currentRoadmap);
    }

    if (!currentRoadmap) {
      console.error(
        "Final check: currentRoadmap is STILL undefined. Force-setting default.",
      );
      currentRoadmap = {
        title: "Error Loading Roadmap",
        description: "We could not find the roadmap you requested.",
        nodes: [],
        connections: [],
      };
    }

    console.log("Calling renderRoadmapPage with:", currentRoadmap);

    // Now render the page
    renderRoadmapPage();
  }

  function renderRoadmapPage() {
    // Step 3: Page ke title aur heading ko update karo
    if (!currentRoadmap) {
      console.error("No currentRoadmap data found!");
      return;
    }

    document.title = `${currentRoadmap.title} - CareerSage`;

    const titleEl = document.getElementById("roadmap-title");
    if (titleEl) titleEl.textContent = currentRoadmap.title;

    const descEl = document.getElementById("roadmap-description");
    if (descEl) descEl.textContent = currentRoadmap.description || "";

    const sidebarContainer = document.getElementById("roadmap-visual-sidebar");
    const faqContainer = document.getElementById("faq-container");

    // Render Sidebar Navigation
    function renderSidebar() {
      if (!sidebarContainer) return;

      if (!currentRoadmap.nodes || currentRoadmap.nodes.length === 0) {
        sidebarContainer.innerHTML =
          '<p class="text-gray-400 text-sm">No sections available</p>';
        return;
      }

      sidebarContainer.innerHTML = currentRoadmap.nodes
        .map(
          (node) =>
            `<a href="#${node.id}" class="sidebar-link-visual block py-1 text-gray-500 hover:text-gray-800">${node.title}</a>`,
        )
        .join("");
    }

    // Legacy variable cleanups...
    // const flowchartCanvas = document.getElementById("flowchart-canvas"); // REMOVED
    const tooltip = document.getElementById("flowchart-tooltip"); // Kept for event listeners if needed locally

    // Track completed nodes
    let completedNodes = new Set();

    // Draw SVG connection lines
    function drawConnections() {
      const svg = document.getElementById("connections");
      if (!svg || !currentRoadmap.connections) return;

      // Clear previous lines
      svg.innerHTML = "";

      currentRoadmap.connections.forEach((conn) => {
        const sourceId = conn.from || conn.source;
        const targetId = conn.to || conn.target;

        const fromNode = currentRoadmap.nodes.find((n) => n.id === sourceId);
        const toNode = currentRoadmap.nodes.find((n) => n.id === targetId);

        if (!fromNode || !toNode) return;

        // Calculate positions (Node Center points for cleaner lines)
        // Adjusted for smaller node size 150x60
        const NODE_W = 150;
        const NODE_H = 60;

        // Dagre/Backend gives Top-Left. We want centers for lines?
        // Actually, let's do Bottom-Center to Top-Center for Top-Down flow
        const x1 = fromNode.x + NODE_W / 2;
        const y1 = fromNode.y + NODE_H; // Bottom of source
        const x2 = toNode.x + NODE_W / 2;
        const y2 = toNode.y; // Top of target

        const path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );

        // Wavy/Flexible "Bezier" Connector (Modern & Cool)
        // M x1 y1 -> C cp1x cp1y, cp2x cp2y, x2 y2

        // Control Points for smooth S-curve (Vertical orientation)
        const cp1x = x1;
        const cp1y = y1 + (y2 - y1) / 2;
        const cp2x = x2;
        const cp2y = y2 - (y2 - y1) / 2;

        const d = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;

        // Add proper styling
        path.setAttribute("d", d);
        path.setAttribute("stroke", "#94a3b8"); // Slightly softer color
        path.setAttribute("stroke-width", "2");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke-linecap", "round");

        svg.appendChild(path);
      });
    }

    // Auto-layout function using Dagre
    function applyDagreLayout(nodes, connections, direction = "TB") {
      if (!window.dagre) {
        console.warn("Dagre not found, using static coordinates");
        return;
      }

      const dagreGraph = new dagre.graphlib.Graph();
      dagreGraph.setDefaultEdgeLabel(() => ({}));

      const nodeWidth = 150;
      const nodeHeight = 60;

      dagreGraph.setGraph({
        rankdir: direction,
        nodesep: 140, // Much wider spacing for proper "Spread" Tree look
        ranksep: 80, // Good vertical separation
      });

      nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
      });

      connections.forEach((conn) => {
        const source = conn.from || conn.source;
        const target = conn.to || conn.target;
        if (source && target) {
          dagreGraph.setEdge(source, target);
        }
      });

      dagre.layout(dagreGraph);

      nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        // Dagre gives center coordinates, we need top-left for absolute positioning
        node.x = nodeWithPosition.x - nodeWidth / 2;
        node.y = nodeWithPosition.y - nodeHeight / 2;
      });
    }

    // Initialize dragging for a node
    function initNodeDragging(nodeEl, node) {
      let isDragging = false;
      let startX, startY, nodeStartX, nodeStartY;
      const dragThreshold = 5;

      const onMouseDown = (e) => {
        if (e.button !== 0) return; // Only left click
        startX = e.clientX;
        startY = e.clientY;
        nodeStartX = node.x;
        nodeStartY = node.y;
        isDragging = false;

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        e.preventDefault(); // Prevent text selection
      };

      const onMouseMove = (e) => {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (!isDragging && Math.sqrt(dx * dx + dy * dy) > dragThreshold) {
          isDragging = true;
          nodeEl.style.cursor = "grabbing";
          nodeEl.classList.add("dragging");
        }

        if (isDragging) {
          const scale = window.currentZoom || 1;
          node.x = nodeStartX + dx / scale;
          node.y = nodeStartY + dy / scale;
          nodeEl.style.left = `${node.x}px`;
          nodeEl.style.top = `${node.y}px`;
          drawConnections();
        }
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        if (isDragging) {
          nodeEl.style.cursor = "grab";
          nodeEl.classList.remove("dragging");
          setTimeout(() => {
            isDragging = false;
          }, 50);
        }
      };

      nodeEl.addEventListener("mousedown", onMouseDown);
      nodeEl.style.cursor = "grab";

      // Stop click event if we were dragging
      nodeEl.addEventListener(
        "click",
        (e) => {
          if (isDragging) e.stopImmediatePropagation();
        },
        true,
      );
    }

    // Render Flowchart Nodes
    function renderFlowchart() {
      const container = document.getElementById("roadmap-container");
      if (!container) return;

      if (!currentRoadmap.nodes || currentRoadmap.nodes.length === 0) {
        container.innerHTML =
          '<p class="text-center text-gray-500 py-20">No roadmap data available</p>';
        return;
      }

      // === AUTO LAYOUT ===
      // Apply Dagre layout to calculate X/Y coordinates dynamically
      // This overrides any hardcoded X/Y in the JSON
      // === AUTO LAYOUT ===
      applyDagreLayout(currentRoadmap.nodes, currentRoadmap.connections || []);

      // Create a Wrapper for Scaling
      // We set transform-origin to 'top center' so it scales neatly from the top
      container.innerHTML =
        '<div id="roadmap-layer" style="transform-origin: top center; width: 100%; height: 100%; position: absolute; left: 0; top: 0;"><svg id="connections" style="overflow: visible; width: 100%; height: 100%;"></svg></div>';
      const layer = document.getElementById("roadmap-layer");

      // Draw lines (they will go into #connections inside #roadmap-layer)
      drawConnections();

      // Draw Nodes
      currentRoadmap.nodes.forEach((node) => {
        const nodeEl = document.createElement("div");
        nodeEl.className = `node ${node.type || "custom"}`;
        nodeEl.id = node.id;
        nodeEl.style.left = `${node.x}px`;
        nodeEl.style.top = `${node.y}px`;
        nodeEl.textContent = node.title;

        if (completedNodes.has(node.id)) {
          nodeEl.classList.add("completed");
        }

        nodeEl.addEventListener("click", () => {
          openNodePanel(node);
        });

        // Initialize dragging
        initNodeDragging(nodeEl, node);

        // Tooltip logic
        const tooltip = document.getElementById("flowchart-tooltip");
        if (tooltip) {
          nodeEl.addEventListener("mouseenter", () => {
            if (node.topics && node.topics.length > 0) {
              const listHtml = node.topics.map((t) => `<li>${t}</li>`).join("");
              tooltip.innerHTML = `<h4>${node.title}</h4><ul>${listHtml}</ul>`;
              tooltip.classList.add("show");
              // Tooltip positioning using Viewport Coordinates (Robust against scale/scroll)
              const rect = nodeEl.getBoundingClientRect();
              const containerRect = container.getBoundingClientRect();

              // Calculate position relative to container (accounting for scroll)
              // We want visual position relative to container top-left
              let left = rect.left - containerRect.left + container.scrollLeft;
              let top =
                rect.top -
                containerRect.top +
                container.scrollTop +
                rect.height +
                4;

              // Smart Boundary Check (Flip if too close to right/bottom)
              // Tooltip width approx 250px
              if (left + 250 > container.scrollWidth) {
                left -= 250; // Flip to left
              }
              // If flipping puts it off-screen left, clamp it
              left = Math.max(10, left);

              tooltip.style.left = `${left}px`;
              tooltip.style.top = `${top}px`;
            }
          });
          nodeEl.addEventListener("mouseleave", () => {
            tooltip.classList.remove("show");
          });
        }

        layer.appendChild(nodeEl);
      });

      // === SMART FIT & ZOOM SETUP ===
      const maxGraphY = Math.max(
        ...currentRoadmap.nodes.map((n) => n.y + 60 + 50),
      );
      const containerH = container.clientHeight;

      let initialScale = 1;
      if (maxGraphY > containerH) {
        initialScale = Math.max(0.5, Math.min(1, containerH / maxGraphY));
      }

      // Set Global Zoom State
      window.currentZoom = initialScale;

      // Define Zoom Functions Globally
      window.updateZoom = function () {
        const layer = document.getElementById("roadmap-layer");
        if (layer) {
          layer.style.transform = `scale(${window.currentZoom})`;
        }
      };

      window.handleZoomIn = function () {
        window.currentZoom = Math.min(window.currentZoom + 0.1, 2.0);
        window.updateZoom();
      };

      window.handleZoomOut = function () {
        window.currentZoom = Math.max(window.currentZoom - 0.1, 0.2);
        window.updateZoom();
      };

      window.handleZoomReset = function () {
        window.currentZoom = 1; // Or resize to fit? Let's use 1.0 standard.
        window.updateZoom();
      };

      // Apply Initial Zoom
      window.updateZoom();

      // Setup Wheel Listener (One-time check)
      if (!container.dataset.hasZoomListener) {
        container.addEventListener("wheel", (e) => {
          if (e.ctrlKey) {
            e.preventDefault();
            const delta = e.deltaY * -0.001;
            window.currentZoom = Math.min(
              Math.max(0.2, window.currentZoom + delta),
              2.0,
            );
            window.updateZoom();
          }
        });
        container.dataset.hasZoomListener = "true";
      }

      // Adjust SVG container size to fit contents if needed
      // (Optional: loop through nodes to find max X/Y and set container width/height)
    }

    // Store current node for panel operations
    let currentPanelNode = null;

    // Open side panel with node details
    window.openNodePanel = function (node) {
      currentPanelNode = node;
      const panel = document.getElementById("node-detail-panel");
      const overlay = document.getElementById("panel-overlay");

      if (!panel) return;

      // Update panel content
      document.getElementById("panel-title").textContent = node.title;
      document.getElementById("panel-description").textContent =
        node.description ||
        "Learn the fundamentals and key concepts of this topic.";
      document.getElementById("panel-time").textContent =
        node.estimatedTime || "1-2 weeks";

      // Update topics
      const topicsContainer = document.getElementById("panel-topics");
      if (node.topics && node.topics.length > 0) {
        topicsContainer.innerHTML = node.topics
          .map(
            (t) => `
        <li class="flex items-center gap-2 text-gray-300">
          <svg class="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          ${t}
        </li>
      `,
          )
          .join("");
      } else {
        topicsContainer.innerHTML =
          '<li class="text-gray-500">No topics specified</li>';
      }

      // Update resources
      const resourcesContainer = document.getElementById("panel-resources");
      if (node.resources && node.resources.length > 0) {
        const resourceIcons = {
          video: "🎬",
          docs: "📄",
          course: "🎓",
          article: "📰",
          tutorial: "📖",
          practice: "💻",
        };
        resourcesContainer.innerHTML = node.resources
          .map(
            (r) => `
        <a href="${r.url}" target="_blank" rel="noopener" 
           class="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition group">
          <span class="text-2xl">${resourceIcons[r.type] || "🔗"}</span>
          <div class="flex-1">
            <p class="text-white font-medium group-hover:text-blue-400 transition">${r.title}</p>
            <p class="text-xs text-gray-500 capitalize">${r.type}</p>
          </div>
          <svg class="w-5 h-5 text-gray-500 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
          </svg>
        </a>
      `,
          )
          .join("");
      } else {
        resourcesContainer.innerHTML =
          '<p class="text-gray-500 text-center py-4">No resources available yet</p>';
      }

      // Update complete button state
      const completeBtn = document.getElementById("panel-complete-btn");
      if (completedNodes.has(node.id)) {
        completeBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        Mark as Incomplete
      `;
        completeBtn.classList.remove("bg-green-600", "hover:bg-green-700");
        completeBtn.classList.add("bg-gray-600", "hover:bg-gray-700");
      } else {
        completeBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Mark as Complete
      `;
        completeBtn.classList.remove("bg-gray-600", "hover:bg-gray-700");
        completeBtn.classList.add("bg-green-600", "hover:bg-green-700");
      }

      // Show panel
      panel.classList.remove("translate-x-full");
      overlay.classList.remove("hidden");
    };

    // Close side panel
    window.closeNodePanel = function () {
      const panel = document.getElementById("node-detail-panel");
      const overlay = document.getElementById("panel-overlay");

      if (panel) panel.classList.add("translate-x-full");
      if (overlay) overlay.classList.add("hidden");
      currentPanelNode = null;
    };

    // Toggle node completion from panel
    window.toggleNodeComplete = function () {
      if (!currentPanelNode) return;

      const nodeEl = document.getElementById(currentPanelNode.id);
      if (completedNodes.has(currentPanelNode.id)) {
        completedNodes.delete(currentPanelNode.id);
        if (nodeEl) nodeEl.classList.remove("completed");
      } else {
        completedNodes.add(currentPanelNode.id);
        if (nodeEl) nodeEl.classList.add("completed");
      }

      // Re-open panel to update button state
      openNodePanel(currentPanelNode);
    };

    // Render FAQs
    function renderFAQs() {
      if (!faqContainer) return;

      if (!currentRoadmap.faqs || currentRoadmap.faqs.length === 0) {
        faqContainer.innerHTML =
          '<p class="text-center text-gray-400">No FAQs available</p>';
        return;
      }

      faqContainer.innerHTML = currentRoadmap.faqs
        .map(
          (faq) => `
        <div class="faq-item border-b">
          <button class="flex justify-between items-center w-full py-5 text-left font-semibold text-lg">
            <span>${faq.question}</span>
            <svg class="faq-arrow w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          <div class="faq-answer text-gray-600">
            <p class="px-2 pb-4">${faq.answer}</p>
          </div>
        </div>
      `,
        )
        .join("");

      // Add FAQ toggle functionality
      document.querySelectorAll(".faq-item button").forEach((button) => {
        button.addEventListener("click", () => {
          button.closest(".faq-item").classList.toggle("open");
        });
      });
    }

    // Initialize everything
    // PDF Download - Screenshot Quality
    window.downloadRoadmapPDF = async function () {
      const roadmapContainer = document.getElementById("roadmap-container");
      const layer = document.getElementById("roadmap-layer");

      if (!roadmapContainer || !layer) {
        alert("Could not find the roadmap to export.");
        return;
      }

      // Find the button
      const btn = document.querySelector(
        'button[onclick="downloadRoadmapPDF()"]',
      );
      const originalBtnText = btn ? btn.innerHTML : "";
      if (btn) {
        btn.innerHTML = `<svg class="animate-spin w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Generating...`;
        btn.disabled = true;
      }

      // Hide UI elements
      const zoomControls = document.getElementById("zoom-controls");
      const tooltip = document.getElementById("flowchart-tooltip");
      if (zoomControls) zoomControls.style.visibility = "hidden";
      if (tooltip) tooltip.style.visibility = "hidden";

      // Save original styles
      const originalLayerTransform = layer.style.transform;
      const originalContainerOverflow = roadmapContainer.style.overflow;
      const originalContainerWidth = roadmapContainer.style.width;
      const originalContainerHeight = roadmapContainer.style.height;

      // Calculate the actual bounds of the roadmap content
      const allNodes = layer.querySelectorAll(".node");
      let minX = Infinity,
        minY = Infinity,
        maxX = 0,
        maxY = 0;

      allNodes.forEach((node) => {
        const left = parseFloat(node.style.left) || 0;
        const top = parseFloat(node.style.top) || 0;
        const width = node.offsetWidth || 150;
        const height = node.offsetHeight || 60;

        minX = Math.min(minX, left);
        minY = Math.min(minY, top);
        maxX = Math.max(maxX, left + width);
        maxY = Math.max(maxY, top + height);
      });

      // Add padding
      const padding = 50;
      const contentWidth = maxX - minX + padding * 2;
      const contentHeight = maxY - minY + padding * 2;

      // Reset the transform scale to 1 for accurate capture
      layer.style.transform = "scale(1)";

      // Expand container to fit all content
      roadmapContainer.style.overflow = "visible";
      roadmapContainer.style.width = contentWidth + "px";
      roadmapContainer.style.height = contentHeight + "px";
      layer.style.width = contentWidth + "px";
      layer.style.height = contentHeight + "px";

      // Wait a frame for the DOM to update
      await new Promise((resolve) => setTimeout(resolve, 100));

      try {
        // Use html2canvas to capture
        const canvas = await html2canvas(layer, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#f8fafc",
          width: contentWidth,
          height: contentHeight,
          x: 0,
          y: 0,
        });

        // Calculate PDF dimensions
        const pdfWidthMM = ((canvas.width / 96) * 25.4) / 2; // Divide by scale
        const pdfHeightMM = ((canvas.height / 96) * 25.4) / 2;

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
          orientation: pdfWidthMM > pdfHeightMM ? "landscape" : "portrait",
          unit: "mm",
          format: [pdfWidthMM, pdfHeightMM],
        });

        const imgData = canvas.toDataURL("image/png", 1.0);
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidthMM, pdfHeightMM);

        // Generate filename
        const title =
          document.getElementById("roadmap-title")?.innerText || "roadmap";
        const safeTitle = title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
        pdf.save(`${safeTitle}.pdf`);
      } catch (error) {
        console.error("PDF generation failed:", error);
        alert("Failed to generate PDF. Please try again.");
      } finally {
        // Restore everything
        layer.style.transform = originalLayerTransform;
        layer.style.width = "";
        layer.style.height = "";
        roadmapContainer.style.overflow = originalContainerOverflow;
        roadmapContainer.style.width = originalContainerWidth;
        roadmapContainer.style.height = originalContainerHeight;

        if (zoomControls) zoomControls.style.visibility = "visible";
        if (tooltip) tooltip.style.visibility = "visible";

        if (btn) {
          btn.innerHTML = originalBtnText;
          btn.disabled = false;
        }
      }
    };

    renderSidebar();
    renderFlowchart();
    renderFAQs();

    // Smooth scroll for sidebar links
    document.querySelectorAll(".sidebar-link-visual").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href").substring(1);
        const targetNode = document.getElementById(targetId);
        if (targetNode) {
          targetNode.scrollIntoView({ behavior: "smooth", block: "center" });
          targetNode.style.transform = "translate(-50%, -4px) scale(1.05)";
          setTimeout(() => {
            targetNode.style.transform = "translate(-50%, 0) scale(1)";
          }, 300);
        }
      });
    });
  }

  // Initialize the page by loading data and rendering
  initializePage();
}
