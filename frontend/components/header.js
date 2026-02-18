export const headerHTML = `
<header class="bg-[#0d1117] fixed top-0 left-0 w-full z-40 border-b border-gray-800">
    <div class="container mx-auto px-4 flex justify-between items-center h-16">
        <!-- Hamburger Button (mobile only) -->
        <button id="hamburger-btn" onclick="toggleMobileMenu()" class="md:hidden p-2 rounded-lg hover:bg-gray-800 text-gray-400 transition">
            <svg id="hamburger-icon" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            <svg id="close-icon" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <!-- Logo -->
        <div class="flex items-center gap-6">
            <a href="./index.html" class="flex items-center gap-2 text-white font-bold text-xl">
                <span class="bg-gradient-to-br from-purple-500 to-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-extrabold shadow-lg shadow-purple-500/20">C</span>
                <span>CareerSage</span>
            </a>
        </div>
        <!-- Desktop Nav (hidden on mobile) -->
        <nav class="hidden md:flex items-center gap-6">
            <div class="relative">
                <button onclick="toggleDropdown('roadmapsDropdown')" class="flex items-center gap-2 text-white font-semibold hover:text-gray-400">
                    Roadmaps <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div id="roadmapsDropdown" class="dropdown-content">
                    <a href="./roadmaps.html"><span class="font-semibold">Official Roadmaps</span></a>
                    <a href="./dashboard.html"><span class="font-semibold">MY Roadmaps</span></a>
                </div>
            </div>
            <div class="relative">
                <button onclick="toggleDropdown('aisensieDropdown')" class="flex items-center gap-2 text-white font-semibold hover:text-gray-400">
                    Aisensie <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div id="aisensieDropdown" class="dropdown-content">
                    <a href="aisensie.html"><span class="font-semibold">Create with AI</span></a>
                </div>
            </div>
            <a href="./skill-battle.html" class="text-white font-semibold hover:text-gray-400">Battle</a>
        </nav>
        <!-- Right side icons -->
        <div class="flex items-center gap-3">
            <!-- Notification Bell -->
            <div class="relative">
                <button onclick="toggleDropdown('notifDropdown')" class="relative p-2 rounded-full hover:bg-gray-800 transition">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                    <span id="notif-badge" class="hidden absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">0</span>
                </button>
                <div id="notifDropdown" class="dropdown-content right-0 min-w-[320px] max-h-[400px] overflow-y-auto">
                    <div class="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                        <span class="text-white font-semibold text-sm">Notifications</span>
                        <button onclick="markAllRead()" class="text-xs text-indigo-400 hover:text-indigo-300">Mark all read</button>
                    </div>
                    <div id="notif-list" class="py-2"><p class="text-gray-500 text-xs text-center py-4">No notifications</p></div>
                </div>
            </div>
            <!-- Account -->
            <div class="relative">
                <button onclick="toggleDropdown('accountDropdown')" id="account-btn" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div class="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-purple-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </div>
                </button>
                <div id="accountDropdown" class="dropdown-content right-0 min-w-[200px]">
                    <!-- Content will be dynamically injected by JS -->
                </div>
            </div>
        </div>
    </div>
    <!-- Mobile menu (hidden by default) -->
    <div id="mobile-menu" class="hidden md:hidden border-t border-gray-800 bg-[#0d1117]">
        <div class="px-4 py-3 space-y-1">
            <p class="text-xs text-gray-500 uppercase font-semibold tracking-wider px-3 py-1">Roadmaps</p>
            <a href="./roadmaps.html" class="block px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 font-medium">Official Roadmaps</a>
            <a href="./dashboard.html" class="block px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 font-medium">MY Roadmaps</a>
            <div class="border-t border-gray-800 my-2"></div>
            <p class="text-xs text-gray-500 uppercase font-semibold tracking-wider px-3 py-1">Aisensie</p>
            <a href="aisensie.html" class="block px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 font-medium">Create with AI</a>
            <div class="border-t border-gray-800 my-2"></div>
            <a href="./skill-battle.html" class="block px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 font-medium">⚔️ Battle</a>
        </div>
    </div>
</header>
`;
