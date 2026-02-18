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
  const accountBtn = document.getElementById("account-btn");

  if (!accountDropdown) return;

  const user = JSON.parse(localStorage.getItem("careersage_user"));

  if (user) {
    // Show user initial in the icon
    const iconDiv = accountBtn ? accountBtn.querySelector("div") : null;
    if (iconDiv) {
      const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";
      iconDiv.innerHTML = `<span class="text-white font-bold text-sm">${initial}</span>`;
      iconDiv.classList.remove("text-purple-400");
      iconDiv.classList.add(
        "bg-gradient-to-br",
        "from-purple-600",
        "to-blue-600",
        "border-transparent",
      );
    }

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
            generation_params: response.roadmap.generation_params || null,
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
              completed_nodes: parsed.completed_nodes || [],
              generation_params: parsed.generation_params || null,
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

    // Store roadmap nodes for skill-test page to access
    try {
      localStorage.setItem("generated_roadmap", JSON.stringify(currentRoadmap));
    } catch (e) {
      console.warn("Failed to store roadmap in localStorage:", e);
    }

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

    // Draw pipe connector lines between consecutive nodes (GitHub Actions style)
    function drawConnections() {
      const svg = document.getElementById("connections");
      if (svg) svg.innerHTML = "";

      // Remove old pipe lines
      document.querySelectorAll(".pipe-line").forEach((el) => el.remove());

      if (!currentRoadmap.nodes || currentRoadmap.nodes.length < 2) return;

      const layer = document.getElementById("roadmap-layer");
      if (!layer) return;

      const NODE_W = 280;
      const NODE_H = 140;
      const COLS = 3;

      for (let i = 0; i < currentRoadmap.nodes.length - 1; i++) {
        const from = currentRoadmap.nodes[i];
        const to = currentRoadmap.nodes[i + 1];
        const fromRow = Math.floor(i / COLS);
        const toRow = Math.floor((i + 1) / COLS);
        const isEvenRow = fromRow % 2 === 0;

        // Determine pipe color class
        const fromDone = completedNodes.has(from.id);
        const toDone = completedNodes.has(to.id);
        let pipeClass = "";
        if (fromDone && toDone) pipeClass = "completed";
        else if (fromDone && !toDone) pipeClass = "in-progress";

        if (fromRow === toRow) {
          // Same row: horizontal pipe
          const pipe = document.createElement("div");
          pipe.className = `pipe-line ${pipeClass}`;

          const x1 = isEvenRow ? from.x + NODE_W : to.x + NODE_W;
          const x2 = isEvenRow ? to.x : from.x;
          const minX = Math.min(x1, x2);
          const pipeWidth = Math.abs(x2 - x1);
          const y = from.y + NODE_H / 2;

          pipe.style.left = `${minX}px`;
          pipe.style.top = `${y}px`;
          pipe.style.width = `${pipeWidth}px`;
          pipe.style.height = `3px`;

          layer.appendChild(pipe);
        } else {
          // Row transition: vertical pipe from bottom of source to top of target
          // Part 1: short horizontal to center if needed, then vertical drop
          const fromCenterX = from.x + NODE_W / 2;
          const toCenterX = to.x + NODE_W / 2;

          // Vertical pipe straight down from source center
          const pipeV = document.createElement("div");
          pipeV.className = `pipe-line ${pipeClass}`;

          const vX = fromCenterX;
          const vY = from.y + NODE_H;
          const vHeight = to.y - (from.y + NODE_H);

          pipeV.style.left = `${vX - 1}px`;
          pipeV.style.top = `${vY}px`;
          pipeV.style.width = `3px`;
          pipeV.style.height = `${Math.max(0, vHeight)}px`;

          layer.appendChild(pipeV);

          // If columns are different, add horizontal connector
          if (Math.abs(fromCenterX - toCenterX) > 5) {
            const pipeH = document.createElement("div");
            pipeH.className = `pipe-line ${pipeClass}`;

            const midY = from.y + NODE_H + vHeight / 2;
            const minX = Math.min(fromCenterX, toCenterX);
            const hWidth = Math.abs(toCenterX - fromCenterX);

            pipeH.style.left = `${minX}px`;
            pipeH.style.top = `${midY}px`;
            pipeH.style.width = `${hWidth}px`;
            pipeH.style.height = `3px`;

            layer.appendChild(pipeH);

            // Second vertical segment from horizontal to target
            const pipeV2 = document.createElement("div");
            pipeV2.className = `pipe-line ${pipeClass}`;

            pipeV2.style.left = `${toCenterX - 1}px`;
            pipeV2.style.top = `${midY}px`;
            pipeV2.style.width = `3px`;
            pipeV2.style.height = `${Math.max(0, vHeight / 2)}px`;

            layer.appendChild(pipeV2);

            // Adjust the first vertical to only go halfway
            pipeV.style.height = `${Math.max(0, vHeight / 2)}px`;
          }
        }
      }
    }

    // Zig-zag serpentine layout: 3 nodes per row, alternating direction
    function applyZigZagLayout(nodes) {
      const NODE_W = 280;
      const NODE_H = 140;
      const GAP_X = 40;
      const GAP_Y = 60;
      const COLS = 3;
      const START_X = 40;

      nodes.forEach((node, i) => {
        const row = Math.floor(i / COLS);
        const col = i % COLS;
        const isEvenRow = row % 2 === 0;

        const actualCol = isEvenRow ? col : COLS - 1 - col;

        node.x = START_X + actualCol * (NODE_W + GAP_X);
        node.y = 20 + row * (NODE_H + GAP_Y);
      });
    }

    // Dagre layout kept as fallback
    function applyDagreLayout(nodes, connections, direction = "TB") {
      if (!window.dagre) {
        console.warn("Dagre not found, using zig-zag layout");
        applyZigZagLayout(nodes);
        return;
      }

      const dagreGraph = new dagre.graphlib.Graph();
      dagreGraph.setDefaultEdgeLabel(() => ({}));

      const nodeWidth = 280;
      const nodeHeight = 140;

      dagreGraph.setGraph({
        rankdir: direction,
        nodesep: 80,
        ranksep: 100,
        marginx: 40,
        marginy: 40,
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

    // Render Flowchart Nodes (Widget Cards + Pipe Connections)
    function renderFlowchart() {
      const container = document.getElementById("roadmap-container");
      if (!container) return;

      if (!currentRoadmap.nodes || currentRoadmap.nodes.length === 0) {
        container.innerHTML =
          '<p class="text-center text-gray-500 py-20">No roadmap data available</p>';
        return;
      }

      // Apply zig-zag layout (sequential serpentine flow)
      applyZigZagLayout(currentRoadmap.nodes);

      container.innerHTML =
        '<div id="roadmap-layer" style="transform-origin: top left; width: 100%; height: 100%; position: absolute; left: 0; top: 0;"><svg id="connections" style="overflow: visible; width: 100%; height: 100%;"></svg></div>';
      const layer = document.getElementById("roadmap-layer");

      // Determine in-progress index (first incomplete node after a completed one)
      let inProgressIdx = -1;
      for (let i = 0; i < currentRoadmap.nodes.length; i++) {
        if (!completedNodes.has(currentRoadmap.nodes[i].id)) {
          if (i === 0 || completedNodes.has(currentRoadmap.nodes[i - 1].id)) {
            inProgressIdx = i;
          }
          break;
        }
      }

      // Draw Nodes as widget cards
      currentRoadmap.nodes.forEach((node, nodeIdx) => {
        const nodeEl = document.createElement("div");
        nodeEl.className = `node-widget ${node.type || "required"}`;
        nodeEl.id = node.id;
        nodeEl.style.left = `${node.x}px`;
        nodeEl.style.top = `${node.y}px`;

        // Apply states
        if (completedNodes.has(node.id)) {
          nodeEl.classList.add("completed");
        } else if (nodeIdx === inProgressIdx) {
          nodeEl.classList.add("in-progress");
        }

        // Step number badge
        const stepBadge = document.createElement("div");
        stepBadge.className = "node-step";
        stepBadge.textContent = nodeIdx + 1;
        nodeEl.appendChild(stepBadge);

        // Header area
        const header = document.createElement("div");
        header.className = "node-header";

        const titleSpan = document.createElement("span");
        titleSpan.className = "node-title";
        titleSpan.textContent = node.title;
        header.appendChild(titleSpan);

        // Time estimate
        if (node.estimatedTime) {
          const timeSpan = document.createElement("span");
          timeSpan.className = "node-time";
          timeSpan.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> ${node.estimatedTime}`;
          header.appendChild(timeSpan);
        }

        nodeEl.appendChild(header);

        // Topic tags
        if (node.topics && node.topics.length > 0) {
          const tagsDiv = document.createElement("div");
          tagsDiv.className = "node-tags";
          const displayTopics = node.topics.slice(0, 3);
          displayTopics.forEach((t) => {
            const tag = document.createElement("span");
            tag.className = "node-tag";
            tag.textContent = t;
            tagsDiv.appendChild(tag);
          });
          if (node.topics.length > 3) {
            const more = document.createElement("span");
            more.className = "node-tag more";
            more.textContent = `+${node.topics.length - 3}`;
            tagsDiv.appendChild(more);
          }
          nodeEl.appendChild(tagsDiv);
        }

        // Type badge
        const typeBadge = document.createElement("span");
        typeBadge.className = `node-type-badge ${node.type || "required"}`;
        typeBadge.textContent =
          node.type === "recommended" ? "OPTIONAL" : "CORE";
        nodeEl.appendChild(typeBadge);

        nodeEl.addEventListener("click", () => {
          openNodePanel(node);
        });

        initNodeDragging(nodeEl, node);

        // Tooltip
        const tooltip = document.getElementById("flowchart-tooltip");
        if (tooltip) {
          nodeEl.addEventListener("mouseenter", () => {
            if (node.description) {
              tooltip.innerHTML = `<p style="margin:0;color:#e2e8f0;font-size:0.85rem">${node.description}</p>`;
              tooltip.classList.add("show");
              const rect = nodeEl.getBoundingClientRect();
              const containerRect = container.getBoundingClientRect();
              let left = rect.left - containerRect.left + container.scrollLeft;
              let top =
                rect.top -
                containerRect.top +
                container.scrollTop +
                rect.height +
                6;
              if (left + 280 > container.scrollWidth) left -= 280;
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

      // Draw pipe connections after nodes
      drawConnections();

      // Smart fit
      const maxGraphX = Math.max(
        ...currentRoadmap.nodes.map((n) => n.x + 280 + 40),
      );
      const maxGraphY = Math.max(
        ...currentRoadmap.nodes.map((n) => n.y + 140 + 40),
      );
      const containerW = container.clientWidth;
      const containerH = container.clientHeight;

      let initialScale = 1;
      const scaleX = containerW / maxGraphX;
      const scaleY = containerH / maxGraphY;
      initialScale = Math.max(0.4, Math.min(1, Math.min(scaleX, scaleY)));

      window.currentZoom = initialScale;

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
        window.currentZoom = 1;
        window.updateZoom();
      };

      window.updateZoom();

      // Wheel zoom
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

      // Clear search results
      const searchResultsContainer = document.getElementById(
        "panel-search-results",
      );
      if (searchResultsContainer) searchResultsContainer.innerHTML = "";

      // Set skill test link
      const skillTestLink = document.getElementById("panel-skill-test-link");
      if (skillTestLink) {
        const params = new URLSearchParams();
        params.set("node", node.title);
        if (node.topics && node.topics.length > 0) {
          params.set("topics", JSON.stringify(node.topics));
        }
        skillTestLink.href = `./skill-test.html?${params.toString()}`;
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

    // Search more resources
    window.searchMoreResources = async function () {
      if (!currentPanelNode) return;
      const btn = document.getElementById("panel-search-btn");
      const resultsContainer = document.getElementById("panel-search-results");

      btn.innerHTML = `
        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        Searching...
      `;
      btn.disabled = true;

      try {
        const data = await API.AI.searchResources(currentPanelNode.title);
        const resources = data.resources || [];

        if (resources.length > 0) {
          const resourceIcons = { video: "🎬", docs: "📄", article: "📰" };
          resultsContainer.innerHTML = `
            <h5 class="text-xs font-semibold text-gray-500 uppercase mt-2">Web Results</h5>
            ${resources
              .map(
                (r) => `
              <a href="${r.url}" target="_blank" rel="noopener"
                 class="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition group">
                <span class="text-2xl">${resourceIcons[r.type] || "🔗"}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-white font-medium group-hover:text-blue-400 transition text-sm truncate">${r.title}</p>
                  <p class="text-xs text-gray-500 truncate">${r.snippet || r.type}</p>
                </div>
                <svg class="w-4 h-4 text-gray-500 group-hover:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </a>
            `,
              )
              .join("")}
          `;
        } else {
          resultsContainer.innerHTML =
            '<p class="text-gray-500 text-sm text-center py-2">No results found</p>';
        }
      } catch (e) {
        resultsContainer.innerHTML =
          '<p class="text-red-400 text-sm text-center py-2">Search failed. Please try again.</p>';
      }

      btn.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        Find More Resources
      `;
      btn.disabled = false;
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
    window.toggleNodeComplete = async function () {
      if (!currentPanelNode) return;

      const isCompleting = !completedNodes.has(currentPanelNode.id);

      if (isCompleting) {
        completedNodes.add(currentPanelNode.id);
      } else {
        completedNodes.delete(currentPanelNode.id);
      }

      // Re-render entire pipeline to update pipes and in-progress state
      renderFlowchart();

      // Re-open panel to update button state
      openNodePanel(currentPanelNode);

      // Persist to backend if this is a saved roadmap
      const savedId = currentRoadmap.id || roadmapId;
      if (savedId && isSavedRoadmap) {
        try {
          await API.Roadmaps.updateNodeProgress(
            savedId,
            currentPanelNode.id,
            isCompleting,
          );
          console.log("Progress saved for node:", currentPanelNode.id);
        } catch (e) {
          console.warn("Could not save progress to backend:", e);
        }
      }
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

    // Seed completedNodes from saved data before first render
    if (
      currentRoadmap.completed_nodes &&
      currentRoadmap.completed_nodes.length > 0
    ) {
      currentRoadmap.completed_nodes.forEach((id) => completedNodes.add(id));
      console.log(
        "Loaded",
        completedNodes.size,
        "completed nodes from saved data:",
        [...completedNodes],
      );
    }

    // Frontend fallback: if generation_params has skills, match them against nodes
    if (
      completedNodes.size === 0 &&
      currentRoadmap.generation_params &&
      currentRoadmap.generation_params.skills
    ) {
      const userSkills = currentRoadmap.generation_params.skills.map((s) =>
        s.toLowerCase().trim(),
      );
      if (userSkills.length > 0 && currentRoadmap.nodes) {
        console.log("Frontend skill matching - skills:", userSkills);
        currentRoadmap.nodes.forEach((node) => {
          const searchText = [
            node.id || "",
            node.title || "",
            node.description || "",
            ...(node.topics || []),
          ]
            .join(" ")
            .toLowerCase();

          for (const skill of userSkills) {
            if (searchText.includes(skill)) {
              completedNodes.add(node.id);
              console.log(
                `  Frontend matched skill '${skill}' to node '${node.id}' (${node.title})`,
              );
              break;
            }
          }
        });
        console.log("Frontend matched", completedNodes.size, "nodes:", [
          ...completedNodes,
        ]);
      }
    }

    console.log("Final completedNodes count:", completedNodes.size);

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
