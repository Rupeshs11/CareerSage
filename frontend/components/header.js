export const headerHTML = `
<header class="bg-[#0d1117] sticky top-0 z-40 border-b border-gray-800">
    <div class="container mx-auto px-4 flex justify-between items-center h-16">
        <!-- Left Side -->
        <div class="flex items-center gap-6">
            <a href="./index.html" class="flex items-center gap-2 text-white font-bold text-xl">
                <span
                    class="bg-white text-black w-8 h-8 rounded-md flex items-center justify-center font-extrabold">C</span>
                <span>CareerSage</span>
            </a>
            <div class="relative">
                <button onclick="toggleDropdown('roadmapsDropdown')"
                    class="flex items-center gap-2 text-white font-semibold hover:text-gray-400">
                    Roadmaps <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div id="roadmapsDropdown" class="dropdown-content">
                    <a href="./roadmaps.html"><span class="font-semibold">Official Roadmaps</span></a>
                    <a href="./dashboard.html"><span class="font-semibold">MY Roadmaps</span></a>
                </div>
            </div>
            <div class="relative">
                <button onclick="toggleDropdown('aisensieDropdown')"
                    class="flex items-center gap-2 text-white font-semibold hover:text-gray-400">Aisensie <svg
                        class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg></button>
                <div id="aisensieDropdown" class="dropdown-content">
                    <a href="aisensie.html"><span class="font-semibold">Create with AI</span></a>
                    <a href="./skill-quiz.html"><span class="font-semibold">Test my Skills</span></a>
                </div>
            </div>
            <a href="#" class="text-white font-semibold hover:text-gray-400">Resume</a>
        </div>
        <!-- Right Side -->
        <div class="relative">
            <button onclick="toggleDropdown('accountDropdown')" id="account-btn" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-5 rounded-lg flex items-center gap-2">
                <span id="account-btn-text">Account</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            <div id="accountDropdown" class="dropdown-content right-0 min-w-[200px]">
                <!-- Content will be dynamically injected by JS -->
            </div>
        </div>
    </div>
</header>
`;
