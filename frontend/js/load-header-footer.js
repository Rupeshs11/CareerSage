// Header/Footer + Dropdown/Auth - Standalone non-module script
// This ensures header, footer, dropdowns, and auth UI work even if main.js module fails
(function () {
  // ============ Header HTML ============
  var headerHTML =
    '<header class="bg-[#0d1117] fixed top-0 left-0 w-full z-40 border-b border-gray-800">' +
    '<div class="container mx-auto px-4 flex justify-between items-center h-16">' +
    // Hamburger Button (mobile only)
    '<button id="hamburger-btn" onclick="toggleMobileMenu()" class="md:hidden p-2 rounded-lg hover:bg-gray-800 text-gray-400 transition">' +
    '<svg id="hamburger-icon" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>' +
    '<svg id="close-icon" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>' +
    "</button>" +
    // Logo
    '<div class="flex items-center gap-6">' +
    '<a href="./index.html" class="flex items-center gap-2 text-white font-bold text-xl">' +
    '<span class="bg-gradient-to-br from-purple-500 to-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-extrabold shadow-lg shadow-purple-500/20">C</span>' +
    "<span>CareerSage</span>" +
    "</a>" +
    "</div>" +
    // Desktop Nav (hidden on mobile)
    '<nav class="hidden md:flex items-center gap-6">' +
    '<div class="relative">' +
    '<button onclick="toggleDropdown(\'roadmapsDropdown\')" class="flex items-center gap-2 text-white font-semibold hover:text-gray-400">' +
    'Roadmaps <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>' +
    "</button>" +
    '<div id="roadmapsDropdown" class="dropdown-content">' +
    '<a href="./roadmaps.html"><span class="font-semibold">Official Roadmaps</span></a>' +
    '<a href="./dashboard.html"><span class="font-semibold">MY Roadmaps</span></a>' +
    "</div>" +
    "</div>" +
    '<div class="relative">' +
    '<button onclick="toggleDropdown(\'aisensieDropdown\')" class="flex items-center gap-2 text-white font-semibold hover:text-gray-400">' +
    'Aisensie <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>' +
    "</button>" +
    '<div id="aisensieDropdown" class="dropdown-content">' +
    '<a href="aisensie.html"><span class="font-semibold">Create with AI</span></a>' +
    "</div>" +
    "</div>" +
    '<a href="./skill-battle.html" class="text-white font-semibold hover:text-gray-400">Battle</a>' +
    "</nav>" +
    // Right side icons (notification + account)
    '<div class="flex items-center gap-3">' +
    // Notification bell
    '<div class="relative">' +
    '<button onclick="toggleDropdown(\'notifDropdown\')" class="relative p-2 rounded-full hover:bg-gray-800 transition">' +
    '<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>' +
    '<span id="notif-badge" class="hidden absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">0</span>' +
    "</button>" +
    '<div id="notifDropdown" class="dropdown-content right-0 min-w-[320px] max-h-[400px] overflow-y-auto">' +
    '<div class="flex items-center justify-between px-4 py-3 border-b border-gray-700">' +
    '<span class="text-white font-semibold text-sm">Notifications</span>' +
    '<button onclick="markAllRead()" class="text-xs text-indigo-400 hover:text-indigo-300">Mark all read</button>' +
    "</div>" +
    '<div id="notif-list" class="py-2"><p class="text-gray-500 text-xs text-center py-4">No notifications</p></div>' +
    "</div>" +
    "</div>" +
    // Account button
    '<div class="relative">' +
    '<button onclick="toggleDropdown(\'accountDropdown\')" id="account-btn" class="flex items-center gap-2 hover:opacity-80 transition-opacity">' +
    '<div class="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-purple-400">' +
    '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>' +
    "</div>" +
    "</button>" +
    '<div id="accountDropdown" class="dropdown-content right-0 min-w-[200px]"></div>' +
    "</div>" +
    "</div>" +
    "</div>" +
    // Mobile menu (hidden by default)
    '<div id="mobile-menu" class="hidden md:hidden border-t border-gray-800 bg-[#0d1117]">' +
    '<div class="px-4 py-3 space-y-1">' +
    '<p class="text-xs text-gray-500 uppercase font-semibold tracking-wider px-3 py-1">Roadmaps</p>' +
    '<a href="./roadmaps.html" class="block px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 font-medium">Official Roadmaps</a>' +
    '<a href="./dashboard.html" class="block px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 font-medium">MY Roadmaps</a>' +
    '<div class="border-t border-gray-800 my-2"></div>' +
    '<p class="text-xs text-gray-500 uppercase font-semibold tracking-wider px-3 py-1">Aisensie</p>' +
    '<a href="aisensie.html" class="block px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 font-medium">Create with AI</a>' +
    '<div class="border-t border-gray-800 my-2"></div>' +
    '<a href="./skill-battle.html" class="block px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 font-medium">⚔️ Battle</a>' +
    "</div>" +
    "</div>" +
    "</header>";

  // ============ Footer HTML ============
  var footerHTML =
    '<footer class="py-4 md:py-6 px-4 border-t border-[#30363d] bg-[#0d1117] text-gray-400 text-xs md:text-sm fixed bottom-0 left-0 w-full z-40">' +
    '<div class="container mx-auto text-center">' +
    '<p class="hover:text-gray-300 transition-colors">&copy; 2025 CareerSage. All rights reserved.</p>' +
    "</div>" +
    "</footer>";

  // ============ Inject Header & Footer ============
  function inject() {
    var hp = document.getElementById("header-placeholder");
    var fp = document.getElementById("footer-placeholder");
    if (hp && !hp.innerHTML.trim()) hp.innerHTML = headerHTML;
    if (fp && !fp.innerHTML.trim()) fp.innerHTML = footerHTML;
    initAuthUI();
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

  // Close dropdowns and mobile menu on outside click
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

  // ============ Toggle Sidebar Dropdown ============
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
      // Show user initial
      var iconDiv = accountBtn ? accountBtn.querySelector("div") : null;
      if (iconDiv) {
        var initial = user.name ? user.name.charAt(0).toUpperCase() : "U";
        iconDiv.innerHTML =
          '<span class="text-white font-bold text-sm">' + initial + "</span>";
        iconDiv.classList.remove("text-purple-400");
        iconDiv.classList.add(
          "bg-gradient-to-br",
          "from-purple-600",
          "to-blue-600",
          "border-transparent",
        );
      }
      accountDropdown.innerHTML =
        '<div class="p-3 border-b border-gray-700">' +
        '<p class="text-white font-semibold">' +
        user.name +
        "</p>" +
        '<p class="text-gray-400 text-sm">' +
        user.email +
        "</p>" +
        "</div>" +
        '<a href="./dashboard.html" class="block">' +
        '<svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>' +
        '<span class="font-semibold">Dashboard</span>' +
        "</a>" +
        '<a href="#" onclick="logoutUser()">' +
        '<svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>' +
        '<span class="font-semibold text-red-400">Logout</span>' +
        "</a>";
    } else {
      accountDropdown.innerHTML =
        '<a href="./login.html">' +
        '<svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>' +
        '<span class="font-semibold">Login</span>' +
        "</a>" +
        '<a href="./register.html">' +
        '<svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>' +
        '<span class="font-semibold">Register</span>' +
        "</a>";
    }
  }

  // ============ Logout ============
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

      // Update badge
      if (res.unread_count > 0) {
        badge.textContent = res.unread_count > 9 ? "9+" : res.unread_count;
        badge.classList.remove("hidden");
      } else {
        badge.classList.add("hidden");
      }

      // Render list
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
              '\'" class="text-xs px-2 py-1 bg-green-600 hover:bg-green-500 text-white rounded transition">Join</button>';
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

  // Load notifications on page load and poll every 30s
  setTimeout(loadNotifications, 1000);
  setInterval(loadNotifications, 30000);

  // ============ Run on DOM ready ============
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
