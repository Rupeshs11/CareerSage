export const headerHTML = `
<header id="site-header" class="fixed top-0 left-0 w-full z-40" style="background:transparent">
    <div class="container mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
        <!-- Left group: Hamburger + Logo -->
        <div class="flex items-center gap-1">
            <button id="hamburger-btn" onclick="toggleMobileMenu()" class="md:hidden p-2 rounded-lg hover:bg-white/5 text-slate-400 transition">
                <svg id="hamburger-icon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                <svg id="close-icon" class="w-5 h-5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <a href="./index.html" class="flex items-center">
                <span class="text-white font-extrabold text-xl md:text-3xl tracking-tight">Career<span style="background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Sage</span></span>
            </a>
        </div>
        <!-- Center: Nav links ONLY inside glass pill -->
        <nav id="navbar-pill" class="navbar-glass hidden md:flex items-center gap-2 px-3 py-1.5">
            <a href="./index.html" class="nav-link text-slate-400 font-medium text-[14px]">Home</a>
            <div class="relative">
                <button onclick="toggleDropdown('roadmapsDropdown')" class="nav-link flex items-center gap-1.5 text-slate-400 font-medium text-[14px]">
                    Roadmaps <svg class="w-3 h-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div id="roadmapsDropdown" class="dropdown-content">
                    <a href="./roadmaps.html"><span class="font-semibold">Official Roadmaps</span></a>
                    <a href="./dashboard.html"><span class="font-semibold">MY Roadmaps</span></a>
                </div>
            </div>
            <div class="relative">
                <button onclick="toggleDropdown('aisensieDropdown')" class="nav-link flex items-center gap-1.5 text-slate-400 font-medium text-[14px]">
                    Aisensie <svg class="w-3 h-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div id="aisensieDropdown" class="dropdown-content">
                    <a href="aisensie.html"><span class="font-semibold">Create with AI</span></a>
                </div>
            </div>
            <a href="./skill-battle.html" class="nav-link text-slate-400 font-medium text-[14px]">Battle</a>
        </nav>
        <!-- Right side icons (outside pill) -->
        <div class="flex items-center gap-2">
            <div class="relative">
                <button onclick="toggleDropdown('notifDropdown')" class="relative p-2 rounded-full hover:bg-white/5 transition">
                    <svg class="w-[22px] h-[22px] text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                    <span id="notif-badge" class="hidden absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">0</span>
                </button>
                <div id="notifDropdown" class="dropdown-content right-0 min-w-[320px] max-h-[400px] overflow-y-auto">
                    <div class="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
                        <span class="text-white font-semibold text-sm">Notifications</span>
                        <button onclick="markAllRead()" class="text-xs text-indigo-400 hover:text-indigo-300">Mark all read</button>
                    </div>
                    <div id="notif-list" class="py-2"><p class="text-gray-500 text-xs text-center py-4">No notifications</p></div>
                </div>
            </div>
            <div class="relative">
                <button onclick="toggleDropdown('accountDropdown')" id="account-btn" class="flex items-center hover:opacity-80 transition-opacity">
                    <div class="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </div>
                </button>
                <div id="accountDropdown" class="dropdown-content right-0 min-w-[200px]"></div>
            </div>
        </div>
    </div>
    <div id="mobile-menu" class="hidden md:hidden mt-2 navbar-glass mx-4 px-4 py-3 space-y-1">
        <a href="./index.html" class="block px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/5 font-medium text-sm">Home</a>
        <div class="border-t border-white/5 my-2"></div>
        <p class="text-xs text-slate-500 uppercase font-semibold tracking-wider px-3 py-1">Roadmaps</p>
        <a href="./roadmaps.html" class="block px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/5 font-medium text-sm">Official Roadmaps</a>
        <a href="./dashboard.html" class="block px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/5 font-medium text-sm">MY Roadmaps</a>
        <div class="border-t border-white/5 my-2"></div>
        <p class="text-xs text-slate-500 uppercase font-semibold tracking-wider px-3 py-1">Aisensie</p>
        <a href="aisensie.html" class="block px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/5 font-medium text-sm">Create with AI</a>
        <div class="border-t border-white/5 my-2"></div>
        <a href="./skill-battle.html" class="block px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/5 font-medium text-sm">Battle</a>
    </div>
</header>
`;
