// Header/Footer + Dropdown/Auth - Standalone non-module script
// This ensures header, footer, dropdowns, and auth UI work even if main.js module fails
(function () {
  // Inject nav + glassmorphism styles
  var navStyle = document.createElement("style");
  navStyle.textContent =
    ".nav-link{position:relative;transition:color 0.3s ease,background 0.3s ease;padding:6px 14px;border-radius:50px}" +
    ".nav-link:hover{color:#fff!important;background:rgba(99,102,241,0.12)}" +
    ".navbar-glass{background:rgba(15,20,40,0.6);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.15);border-radius:50px;box-shadow:0 8px 32px rgba(0,0,0,0.4),0 0 60px rgba(99,102,241,0.08);transition:all 0.3s ease}" +
    ".navbar-glass.scrolled{background:rgba(15,23,42,0.8);border-color:rgba(255,255,255,0.12);box-shadow:0 8px 40px rgba(0,0,0,0.4),0 0 50px rgba(99,102,241,0.06)}" +
    ".navbar-glass.solid{background:rgba(15,23,42,0.85);border-color:rgba(255,255,255,0.1)}";
  document.head.appendChild(navStyle);

  // ============ Header HTML ============
  var headerHTML =
    '<header id="site-header" class="fixed top-0 left-0 w-full z-40" style="background:transparent;transition:background 0.3s ease,backdrop-filter 0.3s ease,border-bottom 0.3s ease">' +
    '<div class="container mx-auto px-4 md:px-6 py-3 flex justify-between items-center">' +
    // Left group: Hamburger + Logo
    '<div class="flex items-center gap-1">' +
    '<button id="hamburger-btn" onclick="toggleMobileMenu()" class="md:hidden p-2 rounded-lg hover:bg-white/5 text-slate-400 transition">' +
    '<svg id="hamburger-icon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>' +
    '<svg id="close-icon" class="w-5 h-5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>' +
    "</button>" +
    '<a href="./index.html" class="flex items-center">' +
    '<span class="text-white font-extrabold text-xl md:text-3xl tracking-tight">Career<span style="background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Sage</span></span>' +
    "</a></div>" +
    // Center: Nav links ONLY inside glass pill
    '<nav id="navbar-pill" class="navbar-glass hidden md:flex items-center gap-2 px-3 py-1.5">' +
    '<a href="./index.html" class="nav-link text-slate-400 font-medium text-[14px]">Home</a>' +
    '<div class="relative">' +
    '<button onclick="toggleDropdown(\'roadmapsDropdown\')" class="nav-link flex items-center gap-1.5 text-slate-400 font-medium text-[14px]">' +
    'Roadmaps <svg class="w-3 h-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>' +
    "</button>" +
    '<div id="roadmapsDropdown" class="dropdown-content">' +
    '<a href="./roadmaps.html"><span class="font-semibold">Official Roadmaps</span></a>' +
    '<a href="./dashboard.html"><span class="font-semibold">MY Roadmaps</span></a>' +
    "</div></div>" +
    '<div class="relative">' +
    '<button onclick="toggleDropdown(\'aisensieDropdown\')" class="nav-link flex items-center gap-1.5 text-slate-400 font-medium text-[14px]">' +
    'Aisensie <svg class="w-3 h-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>' +
    "</button>" +
    '<div id="aisensieDropdown" class="dropdown-content">' +
    '<a href="aisensie.html"><span class="font-semibold">Create with AI</span></a>' +
    "</div></div>" +
    '<a href="./skill-battle.html" class="nav-link text-slate-400 font-medium text-[14px]">Battle</a>' +
    "</nav>" +
    // Right side icons (outside pill)
    '<div class="flex items-center gap-2">' +
    '<div class="relative">' +
    '<button onclick="toggleDropdown(\'notifDropdown\')" class="relative p-2 rounded-full hover:bg-white/5 transition">' +
    '<svg class="w-[22px] h-[22px] text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>' +
    '<span id="notif-badge" class="hidden absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">0</span>' +
    "</button>" +
    '<div id="notifDropdown" class="dropdown-content right-0 min-w-[320px] max-h-[400px] overflow-y-auto">' +
    '<div class="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">' +
    '<span class="text-white font-semibold text-sm">Notifications</span>' +
    '<button onclick="markAllRead()" class="text-xs text-indigo-400 hover:text-indigo-300">Mark all read</button>' +
    "</div>" +
    '<div id="notif-list" class="py-2"><p class="text-gray-500 text-xs text-center py-4">No notifications</p></div>' +
    "</div></div>" +
    '<div class="relative">' +
    '<button onclick="toggleDropdown(\'accountDropdown\')" id="account-btn" class="flex items-center hover:opacity-80 transition-opacity">' +
    '<div class="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400">' +
    '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>' +
    "</div></button>" +
    '<div id="accountDropdown" class="dropdown-content right-0 min-w-[260px]"></div>' +
    "</div></div>" +
    "</div>" + // end container
    '<div id="mobile-menu" class="hidden md:hidden mt-2 navbar-glass mx-4 px-4 py-3 space-y-1">' +
    '<a href="./index.html" class="block px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/5 font-medium text-sm">Home</a>' +
    '<div class="border-t border-white/5 my-2"></div>' +
    '<p class="text-xs text-slate-500 uppercase font-semibold tracking-wider px-3 py-1">Roadmaps</p>' +
    '<a href="./roadmaps.html" class="block px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/5 font-medium text-sm">Official Roadmaps</a>' +
    '<a href="./dashboard.html" class="block px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/5 font-medium text-sm">MY Roadmaps</a>' +
    '<div class="border-t border-white/5 my-2"></div>' +
    '<p class="text-xs text-slate-500 uppercase font-semibold tracking-wider px-3 py-1">Aisensie</p>' +
    '<a href="aisensie.html" class="block px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/5 font-medium text-sm">Create with AI</a>' +
    '<div class="border-t border-white/5 my-2"></div>' +
    '<a href="./skill-battle.html" class="block px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/5 font-medium text-sm">Battle</a>' +
    "</div>" +
    "</header>";

  // ============ Footer HTML ============
  var footerHTML =
    '<footer class="py-4 px-4 border-t border-white/5 bg-[#0a0f1e] text-slate-500 text-xs fixed bottom-0 left-0 w-full z-40">' +
    '<div class="container mx-auto text-center">' +
    '<p class="hover:text-slate-400 transition-colors">&copy; 2025 CareerSage. All rights reserved.</p>' +
    "</div></footer>";

  // ============ Inject ============
  function inject() {
    var hp = document.getElementById("header-placeholder");
    var fp = document.getElementById("footer-placeholder");
    if (hp && !hp.innerHTML.trim()) hp.innerHTML = headerHTML;
    if (fp && !fp.innerHTML.trim()) fp.innerHTML = footerHTML;
    initAuthUI();
    initNavbarScroll();
  }

  // ============ Navbar Scroll ============
  function initNavbarScroll() {
    var pill = document.getElementById("navbar-pill");
    var header = document.getElementById("site-header");
    if (!pill || !header) return;
    var isHome =
      window.location.pathname === "/" ||
      window.location.pathname.endsWith("/index.html") ||
      window.location.pathname.endsWith("/index");
    if (!isHome) {
      pill.classList.add("solid");
      header.style.background = "rgba(15, 23, 42, 0.95)";
      header.style.backdropFilter = "blur(12px)";
      header.style.webkitBackdropFilter = "blur(12px)";
      return;
    }
    window.addEventListener("scroll", function () {
      if (window.scrollY > 60) {
        pill.classList.add("scrolled");
        header.style.background = "rgba(15, 23, 42, 0.95)";
        header.style.backdropFilter = "blur(12px)";
        header.style.webkitBackdropFilter = "blur(12px)";
        header.style.borderBottom = "1px solid rgba(255,255,255,0.06)";
      } else {
        pill.classList.remove("scrolled");
        header.style.background = "transparent";
        header.style.backdropFilter = "none";
        header.style.webkitBackdropFilter = "none";
        header.style.borderBottom = "none";
      }
    });
  }

  // ============ Toggle Dropdown ============
  window.toggleDropdown = function (id) {
    document.querySelectorAll(".dropdown-content").forEach(function (dropdown) {
      if (dropdown.id !== id) dropdown.classList.remove("show");
    });
    var el = document.getElementById(id);
    if (el) el.classList.toggle("show");
  };

  // ============ Toggle Mobile Menu ============
  window.toggleMobileMenu = function () {
    var menu = document.getElementById("mobile-menu");
    var hamburger = document.getElementById("hamburger-icon");
    var close = document.getElementById("close-icon");
    if (menu) menu.classList.toggle("hidden");
    if (hamburger) hamburger.classList.toggle("hidden");
    if (close) close.classList.toggle("hidden");
  };

  document.addEventListener("click", function (event) {
    if (
      !event.target.closest("button") &&
      !event.target.closest("#mobile-menu")
    ) {
      document
        .querySelectorAll(".dropdown-content")
        .forEach(function (dropdown) {
          dropdown.classList.remove("show");
        });
    }
  });

  window.toggleSidebarDropdown = function (menuId) {
    var menu = document.getElementById(menuId);
    var arrow = document.getElementById(menuId.replace("-menu", "-arrow"));
    if (menu) menu.classList.toggle("hidden");
    if (arrow) arrow.classList.toggle("rotate-180");
  };

  // ============ Auth UI ============
  function initAuthUI() {
    var accountDropdown = document.getElementById("accountDropdown");
    var accountBtn = document.getElementById("account-btn");
    if (!accountDropdown) return;

    var user = null;
    try {
      var raw =
        localStorage.getItem("user") || localStorage.getItem("careersage_user");
      user = raw ? JSON.parse(raw) : null;
    } catch (e) {}

    if (user) {
      var iconDiv = accountBtn ? accountBtn.querySelector("div") : null;
      if (iconDiv) {
        var initial = user.name ? user.name.charAt(0).toUpperCase() : "U";
        iconDiv.innerHTML =
          '<span class="text-white font-bold text-sm">' + initial + "</span>";
        iconDiv.classList.remove("text-indigo-400");
        iconDiv.classList.add(
          "bg-gradient-to-br",
          "from-indigo-600",
          "to-purple-600",
          "border-transparent",
        );
      }
      accountDropdown.innerHTML =
        // Profile header with gradient avatar
        '<div class="p-4 border-b border-white/[0.08]">' +
        '<div class="flex items-center gap-3">' +
        '<div class="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-2 ring-white/10">' +
        '<span class="text-white font-bold text-lg">' +
        (user.name ? user.name.charAt(0).toUpperCase() : "U") +
        "</span>" +
        "</div>" +
        '<div class="flex-1 min-w-0">' +
        '<p class="text-white font-semibold text-sm truncate">' +
        user.name +
        "</p>" +
        '<p class="text-gray-400 text-xs truncate">' +
        user.email +
        "</p>" +
        "</div>" +
        "</div>" +
        '<div class="mt-3 flex items-center gap-1.5">' +
        '<span class="inline-flex items-center gap-1 text-[10px] font-medium bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">' +
        '<svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/></svg>' +
        "Member</span>" +
        "</div>" +
        "</div>" +
        // Menu items
        '<div class="py-1.5">' +
        '<a href="./dashboard.html" class="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg hover:bg-white/[0.06] transition-all group">' +
        '<div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">' +
        '<svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>' +
        "</div>" +
        '<span class="text-sm text-gray-300 group-hover:text-white font-medium">Dashboard</span>' +
        "</a>" +
        '<a href="./roadmaps.html" class="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg hover:bg-white/[0.06] transition-all group">' +
        '<div class="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">' +
        '<svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>' +
        "</div>" +
        '<span class="text-sm text-gray-300 group-hover:text-white font-medium">My Roadmaps</span>' +
        "</a>" +
        "</div>" +
        // Logout
        '<div class="border-t border-white/[0.08] py-1.5">' +
        '<a href="#" onclick="logoutUser()" class="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg hover:bg-red-500/10 transition-all group">' +
        '<div class="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">' +
        '<svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>' +
        "</div>" +
        '<span class="text-sm text-red-400 group-hover:text-red-300 font-medium">Sign Out</span>' +
        "</a>" +
        "</div>";
    } else {
      accountDropdown.innerHTML =
        '<div class="py-2">' +
        '<a href="./login.html" class="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg hover:bg-white/[0.06] transition-all group">' +
        '<div class="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">' +
        '<svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>' +
        "</div>" +
        '<span class="text-sm text-gray-300 group-hover:text-white font-medium">Login</span>' +
        "</a>" +
        '<a href="./register.html" class="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg hover:bg-white/[0.06] transition-all group">' +
        '<div class="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">' +
        '<svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>' +
        "</div>" +
        '<span class="text-sm text-gray-300 group-hover:text-white font-medium">Register</span>' +
        "</a>" +
        "</div>";
    }
  }

  window.logoutUser = function () {
    try {
      if (typeof API !== "undefined" && API.Auth) API.Auth.logout();
    } catch (e) {}
    localStorage.removeItem("user");
    localStorage.removeItem("careersage_user");
    localStorage.removeItem("access_token");
    window.location.href = "./index.html";
  };

  // ============ Notifications ============
  window.markAllRead = async function () {
    try {
      if (typeof API !== "undefined" && API.Friends) {
        await API.Friends.markNotificationsRead();
        loadNotifications();
      }
    } catch (e) {
      console.warn("Mark read failed:", e);
    }
  };

  async function loadNotifications() {
    if (
      typeof API === "undefined" ||
      !API.Friends ||
      !API.Auth ||
      !API.Auth.isAuthenticated()
    )
      return;
    try {
      var res = await API.Friends.getNotifications();
      var badge = document.getElementById("notif-badge");
      var list = document.getElementById("notif-list");
      if (!badge || !list) return;
      if (res.unread_count > 0) {
        badge.textContent = res.unread_count > 9 ? "9+" : res.unread_count;
        badge.classList.remove("hidden");
      } else {
        badge.classList.add("hidden");
      }
      var notifs = res.notifications || [];
      if (notifs.length === 0) {
        list.innerHTML =
          '<p class="text-gray-500 text-xs text-center py-4">No notifications</p>';
        return;
      }
      list.innerHTML = notifs
        .map(function (n) {
          var bg = n.read ? "" : "bg-indigo-900/10";
          var dot = n.read
            ? ""
            : '<span class="w-2 h-2 bg-indigo-400 rounded-full flex-shrink-0"></span>';
          var actions = "";
          if (
            n.type === "friend_request" &&
            !n.read &&
            !(n.data && n.data.accepted)
          ) {
            actions =
              "<button onclick=\"acceptFriend('" +
              n.id +
              '\')" class="text-xs px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded transition">Accept</button>';
          }
          if (n.type === "battle_invite" && n.data && n.data.battle_id) {
            actions =
              "<button onclick=\"window.location.href='./skill-battle.html?join=" +
              n.data.battle_id +
              '\'\" class="text-xs px-2 py-1 bg-green-600 hover:bg-green-500 text-white rounded transition">Join</button>';
          }
          var msg = (n.data && n.data.message) || n.type;
          var time = n.created_at
            ? new Date(n.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";
          return (
            '<div class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800/40 transition ' +
            bg +
            '">' +
            dot +
            '<div class="flex-1 min-w-0"><p class="text-gray-300 text-xs">' +
            msg +
            '</p><p class="text-gray-600 text-[10px]">' +
            time +
            "</p></div>" +
            actions +
            "</div>"
          );
        })
        .join("");
    } catch (e) {
      console.warn("Notif load failed:", e);
    }
  }

  window.acceptFriend = async function (notifId) {
    try {
      await API.Friends.acceptFriendRequest(notifId);
      loadNotifications();
    } catch (e) {
      alert("Failed: " + (e.message || e));
    }
  };

  setTimeout(loadNotifications, 1000);

  function initGlobalSocket() {
    if (window.location.pathname.includes("skill-battle")) return;
    if (typeof io === "undefined") return;
    var user = null;
    try {
      var raw =
        localStorage.getItem("user") || localStorage.getItem("careersage_user");
      user = raw ? JSON.parse(raw) : null;
    } catch (e) {}
    if (!user || !user.id) return;
    var globalSocket = io(window.location.origin, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });
    globalSocket.on("connect", function () {
      globalSocket.emit("register_user", { user_id: user.id });
    });
    globalSocket.on("notification", function () {
      loadNotifications();
    });
    globalSocket.on("friend_list_updated", function () {
      loadNotifications();
    });
  }

  setInterval(loadNotifications, 30000);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      inject();
      loadSocketIOAndInit();
    });
  } else {
    inject();
    loadSocketIOAndInit();
  }

  function loadSocketIOAndInit() {
    if (typeof io !== "undefined") {
      initGlobalSocket();
    } else {
      var script = document.createElement("script");
      script.src = "https://cdn.socket.io/4.7.4/socket.io.min.js";
      script.onload = function () {
        initGlobalSocket();
      };
      document.head.appendChild(script);
    }
  }
})();
