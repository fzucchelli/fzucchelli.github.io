<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prompt Maestro v1.0 - Dashboard</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <!-- Alpine.js -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <!-- Tesseract.js (for OCR) -->
    <script src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'></script>
    <!-- Google Fonts (Inter, Outfit, JetBrains Mono) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&family=Outfit:wght@700&display=swap" rel="stylesheet">
    <!-- Custom Dashboard CSS -->
    <link rel="stylesheet" href="dashboard.css">

</head>
<body class="bg-dark text-gray-200 font-sans antialiased" style="overflow-x: hidden;">

    <div x-data="promptMaestroApp()" x-init="init()" x-cloak class="flex min-h-screen">

        <!-- Mobile Sidebar Overlay -->
         <div x-show="isMobile && sidebarOpen"
              x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100"
              x-transition:leave="transition ease-in duration-200" x-transition:leave-start="opacity-100" x-transition:leave-end="opacity-0"
              @click="sidebarOpen = false" class="sidebar-overlay md:hidden" aria-hidden="true"></div>

        <!-- Sidebar -->
        <aside class="w-64 bg-sidebar p-4 border-r border-border flex flex-col fixed inset-y-0 left-0 z-20 transform transition-transform duration-300 ease-in-out md:translate-x-0"
               :class="{ '-translate-x-full': !sidebarOpen, 'translate-x-0': sidebarOpen }">
            <!-- Logo -->
            <div class="flex items-center justify-between space-x-2 mb-6 p-2">
                 <a href="#" @click.prevent="setActiveView('miei-elementi'); clearFilters();" class="flex items-center space-x-2 shrink-0">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7 text-primary flex-shrink-0"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M9 13a4.5 4.5 0 0 0 3-4"></path><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path><path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path><path d="M6 18a4 4 0 0 1-1.967-.516"></path><path d="M12 13h4"></path><path d="M12 18h6a2 2 0 0 1 2 2v1"></path><path d="M12 8h8"></path><path d="M16 8V5a2 2 0 0 1 2-2"></path><circle cx="16" cy="13" r=".5"></circle><circle cx="18" cy="3" r=".5"></circle><circle cx="20" cy="21" r=".5"></circle><circle cx="20" cy="8" r=".5"></circle></svg>
                    <span class="text-xl font-bold text-white font-outfit">Prompt Maestro</span>
                 </a>
                 <button @click="sidebarOpen = false" class="md:hidden text-gray-400 hover:text-white">
                     <i class="fas fa-times text-xl"></i>
                 </button>
            </div>

            <!-- Navigation -->
            <nav class="flex-grow space-y-1 mb-6 overflow-y-auto pr-2">
                <span class="text-xs font-semibold text-gray-500 uppercase px-3">Principale</span>
                <a href="#" @click.prevent="setActiveView('miei-elementi')"
                   class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 group"
                   :class="activeView === 'miei-elementi' ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary pl-2' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'">
                    <i class="fa fa-layer-group fa-fw w-5 h-5 mr-3 transition-colors" :class="activeView === 'miei-elementi' ? 'text-primary' : 'text-gray-500 group-hover:text-gray-300'"></i>
                    I Miei Elementi
                </a>
                 <a href="#" @click.prevent="setActiveView('libreria')"
                   class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 group"
                   :class="activeView === 'libreria' ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary pl-2' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'">
                    <i class="fa fa-book-open fa-fw w-5 h-5 mr-3 transition-colors" :class="activeView === 'libreria' ? 'text-primary' : 'text-gray-500 group-hover:text-gray-300'"></i>
                    Libreria
                </a>

                <!-- Projects Section -->
                <div class="pt-4">
                    <span class="text-xs font-semibold text-gray-500 uppercase px-3" id="onboarding-target-project-header">Progetti</span>
                    <ul class="mt-1 space-y-1" x-data="{ showNewProjectInput: false }">
                        <template x-for="project in progetti" :key="project.id">
                             <li class="group relative">
                                <a href="#" @click.prevent="filterByProject(project.id)"
                                   class="flex items-center justify-between px-3 py-1.5 rounded-md text-sm font-medium group w-full"
                                    :class="filterProjectId === project.id ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'">
                                    <span class="flex items-center space-x-2 truncate">
                                        <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: project.color }"></span>
                                        <span x-text="project.name" class="truncate"></span>
                                    </span>
                                     <span class="flex items-center space-x-2">
                                        <span class="text-xs text-gray-500 group-hover:text-gray-300" x-text="getElementCountForProject(project.id)"></span>
                                        <!-- Project Delete Button -->
                                        <button @click.prevent.stop="confirmDeleteProject(project.id)"
                                                class="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                                title="Elimina Progetto">
                                            <i class="fas fa-trash-alt fa-fw"></i>
                                        </button>
                                    </span>
                                </a>
                            </li>
                        </template>
                         <li>
                            <button @click.prevent="showNewProjectInput = !showNewProjectInput"
                                    class="flex items-center px-3 py-1.5 text-sm text-gray-500 hover:text-gray-300 w-full">
                                <i class="fa fa-plus-circle w-5 h-5 mr-2"></i>
                                Nuovo Progetto
                            </button>
                             <div x-show="showNewProjectInput" x-transition class="px-3 py-2 space-y-2 bg-gray-800/30 rounded-md mt-1">
                                 <input type="text" x-ref="newProjectName" placeholder="Nome progetto" class="w-full bg-input border border-border rounded-md py-1 px-2 text-sm focus:ring-primary focus:border-primary text-white">
                                 <input type="color" x-ref="newProjectColor" value="#6366F1" class="w-full h-8 bg-input border border-border rounded-md cursor-pointer p-0">
                                 <div class="flex justify-end gap-2">
                                     <button @click="showNewProjectInput = false" class="text-xs text-gray-400 hover:text-white">Annulla</button>
                                     <button @click="addProjectAction($refs.newProjectName.value, $refs.newProjectColor.value) ? (showNewProjectInput = false, $refs.newProjectName.value='') : ''" class="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary/80">Salva</button>
                                 </div>
                             </div>
                         </li>
                    </ul>
                </div>
            </nav>

            <!-- Bottom Settings/Help -->
            <div class="mt-auto border-t border-border pt-4 space-y-1">
                <a href="#" @click.prevent="showToast('Impostazioni non ancora implementate.', 'info')" class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 group">
                    <i class="fa fa-cog fa-fw w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-300 transition-colors"></i>
                    Impostazioni
                </a>
                 <a href="#" @click.prevent="showToast('Sezione Aiuto non ancora implementata.', 'info')" class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 group">
                    <i class="fa fa-question-circle fa-fw w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-300 transition-colors"></i>
                    Aiuto
                </a>
            </div>
        </aside>

        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col transition-all duration-300 ease-in-out" :class="{ 'md:ml-64': sidebarOpen, 'md:ml-0': !sidebarOpen && !isMobile, 'ml-0': isMobile }">

             <!-- Mobile Header -->
            <header class="md:hidden sticky top-0 z-10 bg-sidebar p-4 border-b border-border flex items-center justify-between">
                 <button @click="sidebarOpen = true" class="text-gray-300 hover:text-white">
                     <i class="fas fa-bars text-xl"></i>
                 </button>
                 <h1 class="text-lg font-semibold text-white" x-text="getViewTitle()"></h1>
                 <button @click="openCreateModal()" class="bg-primary hover:bg-primary/80 text-white p-2 rounded-full text-sm leading-none w-8 h-8 flex items-center justify-center">
                     <i class="fa fa-plus"></i>
                 </button>
            </header>

            <!-- Desktop Header & Content-->
             <main class="flex-1 p-4 sm:p-6 pb-16 overflow-y-auto relative"> <!-- Added relative for onboarding absolute positioning -->
                <div class="max-w-7xl mx-auto">

                    <!-- Desktop Header -->
                    <div class="hidden md:flex justify-between items-center mb-6">
                        <h1 class="text-2xl font-semibold text-white" x-text="getViewTitle()"></h1>
                        <button @click="openCreateModal()" class="bg-primary hover:bg-primary/80 text-white font-semibold py-2 px-4 rounded-md text-sm inline-flex items-center transition-colors duration-150 shadow-md hover:shadow-lg">
                            <i class="fa fa-plus mr-2"></i>
                            Crea Nuovo Elemento
                        </button>
                    </div>

                    <!-- Content Area (Switches based on view) -->
                    <div x-show="activeView === 'miei-elementi'" x-transition.opacity>
                        <!-- Filter Bar -->
                        <div class="mb-4 p-3 bg-card rounded-lg border border-border flex flex-wrap items-center gap-3 text-sm">
                            <div class="relative flex-grow min-w-[150px] sm:min-w-[200px]">
                                <input type="text" x-model.debounce.300ms="searchTerm" placeholder="Cerca..." class="w-full bg-input border-border rounded-md py-1.5 px-3 pl-8 text-sm focus:ring-primary focus:border-primary text-white">
                                 <i class="fa fa-search absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                            </div>
                            <div class="min-w-[130px] sm:min-w-[150px] relative">
                                <select x-model="filterProjectId" class="w-full bg-input border-border rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary appearance-none text-white">
                                    <option :value="null">Progetto: Tutti</option>
                                    <template x-for="project in progetti" :key="project.id">
                                        <option :value="project.id" x-text="project.name"></option>
                                    </template>
                                </select>
                                <i class="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs pointer-events-none"></i>
                            </div>
                             <div class="min-w-[130px] sm:min-w-[150px] relative">
                                <select x-model="filterAiModel" class="w-full bg-input border-border rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary appearance-none text-white">
                                    <option value="">Modello AI: Tutti</option>
                                    <option value="ChatGPT-4o">ChatGPT-4o</option>
                                    <option value="ChatGPT-4">ChatGPT-4</option>
                                    <option value="ChatGPT-3.5">ChatGPT-3.5</option>
                                    <option value="Claude 3 Opus">Claude 3 Opus</option>
                                    <option value="Claude 3 Sonnet">Claude 3 Sonnet</option>
                                    <option value="Claude 3 Haiku">Claude 3 Haiku</option>
                                    <option value="Gemini Pro">Gemini Pro</option>
                                    <option value="Gemini Ultra">Gemini Ultra</option>
                                     <option value="Qualsiasi Modello">Qualsiasi Modello</option>
                                    <option value="Altro">Altro</option>
                                </select>
                                <i class="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs pointer-events-none"></i>
                            </div>
                            <div class="min-w-[110px] sm:min-w-[120px] relative">
                                 <select x-model="filterType" class="w-full bg-input border-border rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary appearance-none text-white">
                                    <option value="all">Tipo: Tutti</option>
                                    <option value="Prompt">Solo Prompt</option>
                                    <option value="Modello">Solo Modelli</option>
                                </select>
                                <i class="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs pointer-events-none"></i>
                            </div>
                            <button @click="clearFilters()" x-show="hasActiveFilters()" class="text-xs text-gray-400 hover:text-white border border-border rounded-full px-2 py-1 flex items-center gap-1 hover:border-gray-500 transition" title="Rimuovi filtri">
                                 <i class="fas fa-times text-xs"></i>Reset
                             </button>
                        </div>

                        <!-- Loading State -->
                         <div x-show="isLoading" class="text-center py-10">
                            <i class="fas fa-spinner fa-spin text-primary text-3xl"></i>
                            <p class="mt-2 text-gray-400">Caricamento elementi...</p>
                         </div>

                        <!-- Empty State & Onboarding Container -->
                         <div x-show="!isLoading && elementi.length === 0 && !showOnboarding"
                              class="relative text-center py-16 px-6 bg-card rounded-lg border border-border border-dashed min-h-[300px]">
                             <!-- Default Empty State Content (Shown if list is truly empty and onboarding is off/done) -->
                              <div x-show="filteredElementi.length === 0">
                                 <i class="fa fa-folder-open text-4xl text-gray-500 mb-4"></i>
                                 <h2 class="text-xl font-semibold text-white mb-2" x-text="hasActiveFilters() ? 'Nessun Elemento Corrisponde ai Filtri' : 'Nessun Elemento Creato'"></h2>
                                 <p class="text-gray-400 mb-5 max-w-md mx-auto" x-text="hasActiveFilters() ? 'Prova a modificare i filtri o a rimuoverli per visualizzare più elementi.' : 'Inizia salvando i tuoi prompt o creando modelli riutilizzabili.'"></p>
                                 <div class="space-x-4">
                                     <button @click="openCreateModal()" x-show="!hasActiveFilters()" class="bg-primary hover:bg-primary/80 text-white font-semibold py-2 px-5 rounded-md text-sm inline-flex items-center transition-colors duration-150" id="onboarding-target-create-btn">
                                         <i class="fa fa-plus mr-2"></i>
                                         Crea il tuo Primo Elemento
                                     </button>
                                     <button @click="clearFilters()" x-show="hasActiveFilters()" class="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-5 rounded-md text-sm inline-flex items-center transition-colors duration-150">
                                        <i class="fas fa-times mr-2"></i>
                                        Rimuovi Filtri
                                     </button>
                                     <button @click="setActiveView('libreria')" class="text-primary hover:underline text-sm font-semibold mt-3 inline-block" id="onboarding-target-library-link">
                                         Oppure esplora la Libreria <i class="fas fa-arrow-right ml-1"></i>
                                     </button>
                                 </div>
                             </div>
                         </div>

                         <!-- Onboarding Tooltips Area (Hidden by default via showOnboarding: false) -->
                         <div x-show="showOnboarding" class="relative text-center py-16 px-6 bg-card rounded-lg border border-border border-dashed min-h-[300px]">
                                <!-- Invisible placeholder for layout baseline if needed -->
                                <div class="invisible">
                                    <i class="fa fa-folder-open text-4xl text-gray-500 mb-4"></i>
                                    <h2 class="text-xl font-semibold text-white mb-2">Nessun Elemento Creato</h2>
                                    <p class="text-gray-400 mb-5 max-w-md mx-auto">Inizia salvando i tuoi prompt o creando modelli riutilizzabili.</p>
                                    <div class="space-x-4">
                                        <button class="bg-primary">Placeholder</button>
                                        <button class="text-primary">Placeholder</button>
                                    </div>
                                </div>

                                <!-- Actual Tooltips (Positioning needs refinement) -->
                                <div class="onboarding-tooltip top" :class="{'active': onboardingStep === 1}" style="top: 15%; left: 50%; transform: translateX(-50%);">
                                    <strong class="text-primary">Benvenuto in Prompt Maestro!</strong><br>
                                    Questo è il tuo spazio ('I Miei Elementi') dove salverai e gestirai i tuoi prompt e modelli per l'IA.
                                    <div class="onboarding-tooltip-controls">
                                        <button @click="skipOnboarding()" class="skip-btn">Salta</button>
                                        <button @click="onboardingStep = 2">Avanti &rarr;</button>
                                    </div>
                                </div>
                                <div class="onboarding-tooltip bottom" :class="{'active': onboardingStep === 2}" style="bottom: 45%; left: 50%; transform: translateX(-50%);">
                                    Un <strong>Prompt</strong> è testo fisso. Un <strong>Modello</strong> usa <code class="text-highlight font-mono bg-input px-1 rounded text-xs">{{variabili}}</code> per essere riutilizzabile!
                                    <div class="onboarding-tooltip-controls">
                                        <button @click="skipOnboarding()" class="skip-btn">Salta</button>
                                        <button @click="onboardingStep = 3">Avanti &rarr;</button>
                                    </div>
                                </div>
                                <div class="onboarding-tooltip top" :class="{'active': onboardingStep === 3}" style="top: 65%; left: 35%; transform: translateX(-50%);">
                                    <strong class="text-primary">Inizia da qui!</strong><br>
                                    Clicca per aggiungere il tuo primo prompt o modello.
                                    <div class="onboarding-tooltip-controls">
                                        <button @click="skipOnboarding()" class="skip-btn">Salta</button>
                                        <button @click="onboardingStep = 4">Avanti &rarr;</button>
                                    </div>
                                </div>
                                <div class="onboarding-tooltip top" :class="{'active': onboardingStep === 4}" style="top: 70%; left: 68%; transform: translateX(-50%);">
                                    <strong class="text-primary">Non sai da dove iniziare?</strong><br>
                                    La <strong>Libreria</strong> (vedi menu) contiene esempi già pronti!
                                    <div class="onboarding-tooltip-controls">
                                        <button @click="skipOnboarding()" class="skip-btn">Salta</button>
                                        <button @click="onboardingStep = 5">Avanti &rarr;</button>
                                    </div>
                                </div>
                                <div class="onboarding-tooltip right" :class="{'active': onboardingStep === 5}" style="top: 30%; left: -30px; transform: translateX(-100%); width: 250px;">
                                    Organizza con <strong>Progetti</strong> (nel menu) per tenere tutto ordinato.
                                    <div class="onboarding-tooltip-controls">
                                        <button @click="skipOnboarding()">Fine</button>
                                    </div>
                                </div>

                                <!-- Onboarding Highlight Targets (Positioning needs JS/refinement) -->
                                <div x-show="onboardingStep === 3" class="onboarding-highlight" style="position: absolute; left: calc(50% - 110px); bottom: 115px; width: 220px; height: 40px;"></div>
                                <div x-show="onboardingStep === 4" class="onboarding-highlight" style="position: absolute; left: calc(50% + 10px); bottom: 65px; width: 200px; height: 30px;"></div>
                                <!-- Highlight for Projects section in sidebar needs JS based positioning -->
                         </div>


                         <!-- Element List -->
                         <div x-show="!isLoading && filteredElementi.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            <template x-for="elemento in filteredElementi" :key="elemento.id">
                                <div @click="openModal(elemento, 'view')" class="item-card">
                                    <!-- Project Color Indicator -->
                                    <div x-show="getProjectColor(elemento.projectId)" class="absolute top-0 left-0 right-0 h-1 rounded-t-lg" :style="{ backgroundColor: getProjectColor(elemento.projectId) }"></div>
                                    <!-- Card Content -->
                                    <div class="flex justify-between items-start mb-2 pt-1">
                                         <h3 class="text-base font-semibold text-white mb-1 truncate pr-2" x-text="elemento.title"></h3>
                                         <span class="text-xs px-1.5 py-0.5 rounded flex-shrink-0 whitespace-nowrap" :class="elemento.type === 'Modello' ? 'bg-highlight/20 text-highlight border border-highlight/30' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'">
                                             <i :class="elemento.type === 'Modello' ? 'fa fa-cogs' : 'fa fa-file-alt'" class="mr-1"></i><span x-text="elemento.type"></span>
                                         </span>
                                    </div>
                                    <div class="text-xs text-gray-400 mb-2 space-x-3 truncate">
                                        <span x-show="elemento.aiModel"><i class="fa fa-robot mr-1 opacity-70"></i><span x-text="elemento.aiModel"></span></span>
                                        <span x-show="elemento.projectId"><i class="fa fa-folder mr-1 opacity-70"></i><span x-text="getProjectById(elemento.projectId)?.name || 'N/A'"></span></span>
                                    </div>
                                    <p class="text-sm text-gray-300 mb-3 line-clamp-2 flex-grow min-h-[40px]" x-text="elemento.text || 'Nessun testo'"></p>
                                    <img x-show="elemento.imageUrl" :src="elemento.imageUrl" alt="Immagine" @error="handleImageError($event)" class="mb-3 w-full h-24 object-cover rounded border border-border opacity-80 group-hover:opacity-100 transition-opacity">
                                    <div class="flex flex-wrap mt-auto pt-2 border-t border-border/50 min-h-[26px]">
                                         <template x-for="tag in elemento.tags" :key="tag">
                                             <span class="tag" :class="getTagColorClass(tag)" x-text="tag"></span>
                                         </template>
                                         <span x-show="!elemento.tags || elemento.tags.length === 0" class="text-xs text-gray-500 italic">Nessun tag</span>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div> <!-- End 'miei-elementi' view -->

                    <!-- Libreria Content -->
                     <div x-show="activeView === 'libreria'" x-transition.opacity>
                        <!-- Filters -->
                        <div class="mb-4 p-3 bg-card rounded-lg border border-border flex flex-wrap items-center gap-3 text-sm">
                             <div class="relative flex-grow min-w-[150px] sm:min-w-[200px]">
                                 <input type="text" x-model.debounce.300ms="libreriaSearchTerm" placeholder="Cerca libreria..." class="w-full bg-input border-border rounded-md py-1.5 px-3 pl-8 text-sm focus:ring-primary focus:border-primary text-white">
                                 <i class="fa fa-search absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                            </div>
                             <div class="min-w-[130px] sm:min-w-[150px] relative">
                                 <select x-model="libreriaFilterTaskType" class="w-full bg-input border-border rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary appearance-none text-white">
                                     <option value="">Tipo Task: Tutti</option>
                                     <option value="#marketing">Marketing</option>
                                     <option value="#email">Email</option>
                                     <option value="#social_media">Social Media</option>
                                     <option value="#contenuti">Contenuti</option>
                                     <option value="#blogging">Blogging</option>
                                     <option value="#codice">Codice</option>
                                     <option value="#analisi">Analisi</option>
                                     <option value="#strategia">Strategia</option>
                                     <option value="#swot">SWOT</option>
                                     <option value="#seo">SEO</option>
                                     <option value="#produttivita">Produttività</option>
                                     <option value="#servizio_clienti">Servizio Clienti</option>
                                     <option value="#customer_care">Customer Care</option>
                                     <option value="#traduzione">Traduzione</option>
                                     <option value="#creativita">Creatività</option>
                                      <option value="#spiegazione">Spiegazione</option>
                                      <option value="#feedback">Feedback</option>
                                      <option value="#localizzazione">Localizzazione</option>
                                      <option value="#naming">Naming</option>
                                      <option value="#startup">Startup</option>
                                      <option value="#business">Business</option>
                                      <option value="#pianificazione">Pianificazione</option>
                                      <option value="#problem_solving">Problem Solving</option>
                                      <option value="#sintesi">Sintesi</option>
                                      <option value="#riassunto">Riassunto</option>
                                      <option value="#lancio_prodotto">Lancio Prodotto</option>
                                      <option value="#reclamo">Reclamo</option>
                                      <option value="#semplificazione">Semplificazione</option>
                                      <option value="#comunicazione">Comunicazione</option>
                                      <option value="#tech">Tech</option>
                                      <option value="#engagement">Engagement</option>
                                      <option value="#vendite">Vendite</option>
                                 </select>
                                <i class="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs pointer-events-none"></i>
                             </div>
                             <div class="min-w-[130px] sm:min-w-[150px] relative">
                                <select x-model="libreriaFilterAiModel" class="w-full bg-input border-border rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary appearance-none text-white">
                                    <option value="">Modello AI: Tutti</option>
                                    <option value="ChatGPT-4o">ChatGPT-4o</option>
                                    <option value="Claude 3 Sonnet">Claude 3 Sonnet</option>
                                    <option value="Claude 3 Opus">Claude 3 Opus</option>
                                    <option value="Qualsiasi Modello">Qualsiasi Modello</option>
                                </select>
                                <i class="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs pointer-events-none"></i>
                             </div>
                              <div class="min-w-[110px] sm:min-w-[120px] relative">
                                 <select x-model="libreriaFilterType" class="w-full bg-input border-border rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary appearance-none text-white">
                                    <option value="all">Tipo: Tutti</option>
                                    <option value="Prompt">Solo Prompt</option>
                                    <option value="Modello">Solo Modelli</option>
                                </select>
                                <i class="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs pointer-events-none"></i>
                             </div>
                              <button @click="clearLibreriaFilters()" x-show="hasActiveLibreriaFilters()" class="text-xs text-gray-400 hover:text-white border border-border rounded-full px-2 py-1 flex items-center gap-1 hover:border-gray-500 transition" title="Rimuovi filtri">
                                 <i class="fas fa-times text-xs"></i>Reset
                              </button>
                        </div>

                         <!-- Loading State -->
                         <div x-show="isLoading" class="text-center py-10">
                            <i class="fas fa-spinner fa-spin text-primary text-3xl"></i>
                            <p class="mt-2 text-gray-400">Caricamento libreria...</p>
                         </div>

                         <!-- Empty State -->
                         <div x-show="!isLoading && filteredLibreria.length === 0" class="text-center py-16 px-6 bg-card rounded-lg border border-border border-dashed">
                             <i class="fa fa-book text-4xl text-gray-500 mb-4"></i>
                             <h2 class="text-xl font-semibold text-white mb-2" x-text="hasActiveLibreriaFilters() ? 'Nessun Elemento Corrisponde ai Filtri' : 'Libreria Vuota'"></h2>
                             <p class="text-gray-400 mb-5 max-w-md mx-auto" x-text="hasActiveLibreriaFilters() ? 'Prova a modificare i filtri o a rimuoverli.' : 'Sembra che la libreria sia vuota o non sia stata caricata correttamente (assicurati che `libreria.json` sia presente).'"></p>
                             <button @click="clearLibreriaFilters()" x-show="hasActiveLibreriaFilters()" class="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-5 rounded-md text-sm inline-flex items-center transition-colors duration-150">
                                <i class="fas fa-times mr-2"></i>
                                Rimuovi Filtri
                             </button>
                         </div>

                        <!-- Library Item List -->
                        <div x-show="!isLoading && filteredLibreria.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                             <template x-for="item in filteredLibreria" :key="item.id">
                                 <div @click="openModal(item, 'libreriaPreview')" class="item-card"> <!-- Library Card -->
                                      <div class="flex justify-between items-start mb-2">
                                         <h3 class="text-base font-semibold text-white mb-1 truncate pr-2" x-text="item.title"></h3>
                                         <span class="text-xs px-1.5 py-0.5 rounded flex-shrink-0 whitespace-nowrap" :class="item.type === 'Modello' ? 'bg-highlight/20 text-highlight border border-highlight/30' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'">
                                            <i :class="item.type === 'Modello' ? 'fa fa-cogs' : 'fa fa-file-alt'" class="mr-1"></i><span x-text="item.type"></span>
                                        </span>
                                     </div>
                                     <div class="text-xs text-gray-400 mb-2 space-x-3 truncate">
                                         <span x-show="item.aiModel"><i class="fa fa-robot mr-1 opacity-70"></i><span x-text="item.aiModel"></span></span>
                                     </div>
                                     <p class="text-sm text-gray-300 mb-3 line-clamp-3 flex-grow min-h-[60px]" x-text="item.text || 'Nessun testo'"></p>
                                     <img x-show="item.imageUrl" :src="item.imageUrl" alt="Immagine" @error="handleImageError($event)" class="mb-3 w-full h-24 object-cover rounded border border-border">
                                      <div class="flex flex-wrap gap-1 mb-4 min-h-[26px]">
                                         <template x-for="tag in item.tags" :key="tag">
                                             <span class="tag" :class="getTagColorClass(tag)" x-text="tag"></span>
                                         </template>
                                         <span x-show="!item.tags || item.tags.length === 0" class="text-xs text-gray-500 italic">Nessun tag</span>
                                     </div>
                                     <div class="mt-auto flex justify-end items-center pt-2 border-t border-border/50">
                                         <!-- <button @click.prevent.stop="openModal(item, 'libreriaPreview')" class="text-xs text-primary hover:underline font-medium">Anteprima</button> -->
                                         <button @click.prevent.stop="copyFromLibreriaAction(item)" class="bg-primary/20 hover:bg-primary/40 text-primary text-xs font-semibold py-1 px-2.5 rounded-md inline-flex items-center transition-colors duration-150"><i class="fa fa-plus mr-1.5"></i> Aggiungi ai Miei</button>
                                     </div>
                                 </div>
                             </template>
                         </div>
                     </div> <!-- End 'libreria' view -->

                </div>
            </main>
        </div>


        <!-- Modals -->
        <!-- Quick View/Use Modal -->
        <div x-show="isModalOpen"
             x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 scale-95" x-transition:enter-end="opacity-100 scale-100"
             x-transition:leave="transition ease-in duration-150" x-transition:leave-start="opacity-100 scale-100" x-transition:leave-end="opacity-0 scale-95"
             class="fixed inset-0 z-30 overflow-y-auto flex items-start sm:items-center justify-center p-4 pt-10 sm:pt-4"
             aria-labelledby="modal-title" role="dialog" aria-modal="true">

             <div @click="closeModal()" class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" aria-hidden="true"></div>

             <div class="relative bg-card glass-card rounded-lg shadow-xl overflow-hidden max-w-3xl w-full border border-border/50 transform transition-all">
                 <!-- Header -->
                 <div class="flex items-center justify-between p-4 border-b border-border">
                     <div class="flex items-center space-x-3 min-w-0">
                          <span class="text-lg flex-shrink-0" :class="modalItem?.type === 'Modello' ? 'text-highlight' : 'text-blue-400'">
                              <i :class="modalItem?.type === 'Modello' ? 'fa fa-cogs' : 'fa fa-file-alt'"></i>
                          </span>
                          <h2 class="text-lg font-semibold text-white truncate" id="modal-title" x-text="modalItem?.title || 'Dettaglio Elemento'"></h2>
                     </div>
                     <button @click="closeModal()" class="text-gray-400 hover:text-white transition-colors ml-4 flex-shrink-0">
                         <i class="fa fa-times fa-lg"></i>
                     </button>
                 </div>

                 <!-- Content -->
                 <div class="p-5 max-h-[calc(100vh-200px)] overflow-y-auto" id="modal-content-scroll-area">
                     <!-- Metadata -->
                     <div class="mb-4 text-xs text-gray-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span x-show="modalItem?.aiModel"><i class="fa fa-robot mr-1 opacity-70"></i> Modello AI: <strong class="text-gray-300" x-text="modalItem?.aiModel"></strong></span>
                         <span x-show="modalItem?.projectId"><i class="fa fa-folder mr-1 opacity-70"></i> Progetto: <strong class="text-gray-300" x-text="getProjectById(modalItem?.projectId)?.name || 'Nessuno'"></strong></span>
                         <span><i class="far fa-calendar-alt mr-1 opacity-70"></i> Creato: <strong class="text-gray-300" x-text="formatDate(modalItem?.createdAt)"></strong></span>
                         <span><i class="far fa-calendar-check mr-1 opacity-70"></i> Aggiornato: <strong class="text-gray-300" x-text="formatDate(modalItem?.updatedAt)"></strong></span>
                     </div>
                     <!-- Tags -->
                      <div class="mb-4 flex flex-wrap gap-1" x-show="modalItem?.tags?.length > 0">
                         <template x-for="tag in modalItem?.tags" :key="tag">
                             <span class="tag" :class="getTagColorClass(tag)" x-text="tag"></span>
                         </template>
                      </div>

                    <!-- Variable Inputs -->
                    <template x-if="modalItem?.type === 'Modello' && getVariablesFromText(modalItem?.text).length > 0">
                         <div class="mb-5 p-4 bg-input/50 rounded-md border border-border space-y-3">
                             <h4 class="text-sm font-semibold text-white mb-2 text-highlight"><i class="fa fa-pencil-alt mr-2"></i>Compila le Variabili:</h4>
                             <template x-for="variable in getVariablesFromText(modalItem?.text)" :key="variable">
                                 <div class="grid grid-cols-3 gap-2 items-center">
                                     <label :for="'var-' + variable" class="text-sm font-mono text-highlight/90 text-right truncate" x-text="variable + ':'"></label>
                                     <input :id="'var-' + variable" type="text" x-model.lazy="modalVariableValues[variable]"
                                            class="col-span-2 bg-input border border-border/80 rounded-md py-1 px-2 text-sm focus:ring-primary focus:border-primary text-white placeholder-gray-500"
                                            :placeholder="'Inserisci valore per ' + variable">
                                 </div>
                             </template>
                         </div>
                     </template>

                     <!-- Text Content -->
                     <div class="mb-4">
                         <h4 class="text-sm font-semibold text-white mb-2"><i class="fa fa-align-left mr-2"></i>Testo <span x-text="modalItem?.type"></span>:</h4>
                         <div x-data="{ showFullText: false }">
                             <div class="p-3 bg-input/50 rounded-md border border-border max-h-48 overflow-y-auto whitespace-pre-wrap text-sm font-mono text-gray-200 relative"
                                 :class="{ 'max-h-none': showFullText }"
                                 x-ref="modalTextContent"
                                 x-html="highlightVariables(modalItem?.text ?? '')">
                             </div>
                              <button @click="showFullText = !showFullText"
                                     x-show="$refs.modalTextContent && $refs.modalTextContent.scrollHeight > $refs.modalTextContent.clientHeight + 5"
                                     class="text-xs text-primary hover:underline mt-1"
                                     x-text="showFullText ? 'Mostra meno' : 'Mostra tutto'">
                              </button>
                         </div>
                     </div>

                     <!-- Notes -->
                      <div class="mb-4" x-show="modalItem?.notes">
                         <h4 class="text-sm font-semibold text-white mb-2"><i class="far fa-sticky-note mr-2"></i>Note:</h4>
                         <p class="p-3 bg-input/50 rounded-md border border-border text-sm text-gray-300 whitespace-pre-wrap" x-text="modalItem?.notes"></p>
                      </div>

                     <!-- Image -->
                      <div class="mb-4" x-show="modalItem?.imageUrl">
                         <h4 class="text-sm font-semibold text-white mb-2"><i class="far fa-image mr-2"></i>Immagine Associata:</h4>
                          <img :src="modalItem?.imageUrl" @error="handleImageError($event)" alt="Immagine associata" class="max-w-full h-auto max-h-60 object-contain rounded border border-border">
                      </div>

                     <!-- Live Preview -->
                    <template x-if="modalItem?.type === 'Modello' && Object.keys(modalVariableValues).some(key => modalVariableValues[key])">
                        <div class="mt-5">
                            <h4 class="text-sm font-semibold text-white mb-2"><i class="fa fa-eye mr-2"></i>Anteprima Compilata:</h4>
                            <div class="p-3 bg-green-900/30 border border-green-500/30 rounded-md text-sm font-mono text-green-200 whitespace-pre-wrap max-h-40 overflow-y-auto"
                                 x-text="compileText(modalItem?.text, modalVariableValues)">
                            </div>
                        </div>
                    </template>
                 </div>

                 <!-- Footer -->
                 <div class="p-4 bg-card/80 border-t border-border flex flex-wrap justify-end items-center gap-3">
                     <template x-if="modalMode === 'libreriaPreview'">
                          <button @click="copyFromLibreriaAction(modalItem); closeModal()" class="bg-primary hover:bg-primary/80 text-white font-semibold py-1.5 px-4 rounded-md text-sm inline-flex items-center transition-colors duration-150">
                              <i class="fa fa-plus mr-2"></i> Aggiungi ai Miei Elementi
                          </button>
                          <button @click="closeModal()" class="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1.5 px-4 rounded-md text-sm transition-colors duration-150">
                              Chiudi Anteprima
                          </button>
                     </template>

                     <template x-if="modalMode === 'view'">
                         <template x-if="modalItem?.type === 'Modello' && getVariablesFromText(modalItem?.text).length > 0">
                             <button @click="compileAndCopyAction()" class="bg-primary hover:bg-primary/80 text-white font-semibold py-1.5 px-4 rounded-md text-sm inline-flex items-center transition-colors duration-150">
                                 <i class="fa fa-copy mr-2"></i> Compila & Copia
                              </button>
                         </template>
                          <template x-if="modalItem?.type === 'Prompt' || getVariablesFromText(modalItem?.text).length === 0">
                             <button @click="copyTextAction(modalItem?.text)" class="bg-primary hover:bg-primary/80 text-white font-semibold py-1.5 px-4 rounded-md text-sm inline-flex items-center transition-colors duration-150">
                                  <i class="fa fa-copy mr-2"></i> Copia Testo
                              </button>
                          </template>

                         <button @click="copyTextAction(modalItem?.text)" title="Copia testo originale (anche per Modelli)" class="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1.5 px-3 rounded-md text-sm transition-colors duration-150">
                              <i class="far fa-copy"></i> Testo
                          </button>
                          <button @click="openEditModal(modalItem)" class="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1.5 px-3 rounded-md text-sm transition-colors duration-150">
                              <i class="fa fa-pencil-alt mr-1"></i> Modifica
                          </button>
                         <button @click="confirmDeleteElemento(modalItem?.id)" class="bg-red-700 hover:bg-red-600 text-white font-semibold py-1.5 px-3 rounded-md text-sm transition-colors duration-150">
                             <i class="fa fa-trash-alt mr-1"></i> Elimina
                         </button>
                          <button @click="closeModal()" class="text-gray-400 hover:text-white text-sm ml-4 hidden sm:inline-block">
                              Chiudi
                          </button>
                      </template>
                  </div>
             </div>
        </div>

        <!-- Create/Edit Modal -->
        <div x-show="isFormModalOpen"
             x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 scale-95" x-transition:enter-end="opacity-100 scale-100"
             x-transition:leave="transition ease-in duration-150" x-transition:leave-start="opacity-100 scale-100" x-transition:leave-end="opacity-0 scale-95"
             class="fixed inset-0 z-40 overflow-y-auto flex items-start sm:items-center justify-center p-4 pt-10 sm:pt-4"
             aria-labelledby="form-modal-title" role="dialog" aria-modal="true">

             <div @click="closeFormModal()" class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" aria-hidden="true"></div>

             <form @submit.prevent="saveElementoAction()" class="relative bg-card glass-card rounded-lg shadow-xl overflow-hidden max-w-4xl w-full border border-border/50 transform transition-all">
                 <!-- Header -->
                 <div class="flex items-center justify-between p-4 border-b border-border">
                     <h2 class="text-lg font-semibold text-white" id="form-modal-title" x-text="currentElementForm.id ? 'Modifica Elemento' : 'Crea Nuovo Elemento'"></h2>
                     <div class="space-x-3">
                         <button type="button" @click="closeFormModal()" class="text-gray-400 hover:text-white text-sm">Annulla</button>
                         <button type="submit" class="bg-primary hover:bg-primary/80 text-white font-semibold py-1.5 px-4 rounded-md text-sm transition-colors duration-150">
                             <i class="fa fa-save mr-1.5"></i> Salva Elemento
                         </button>
                     </div>
                 </div>

                 <!-- Content (Form) -->
                 <div class="p-5 max-h-[calc(100vh-200px)] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                     <!-- Left Column -->
                     <div class="space-y-4">
                         <div>
                             <label for="form-title" class="block text-sm font-medium text-gray-300 mb-1">Titolo*</label>
                             <input type="text" id="form-title" x-model="currentElementForm.title" required
                                    placeholder="Dai un nome chiaro..."
                                    class="w-full bg-input border border-border rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary text-white placeholder-gray-500">
                         </div>
                         <div>
                            <div class="flex justify-between items-center mb-1">
                                <label for="form-text" class="block text-sm font-medium text-gray-300">Testo (Prompt o Modello)*</label>
                                <button type="button" @click="insertVariablePlaceholder($refs.formTextarea)" class="insert-variable-btn" title="Inserisci una variabile nel testo">
                                    <i class="fas fa-plus-circle text-xs mr-1"></i> Variabile
                                </button>
                            </div>
                             <textarea id="form-text" x-ref="formTextarea" x-model.lazy="currentElementForm.text"
                                       @input="updateFormElementType()"
                                       @paste.prevent="handlePaste($event)"
                                       required rows="10"
                                       placeholder="Incolla o scrivi qui il testo..."
                                       class="w-full bg-input border border-border rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary font-mono placeholder-gray-500 text-white"></textarea>
                             <p class="text-xs text-gray-400 mt-1">Usa <code class="text-highlight bg-input px-1 rounded">{{variabile}}</code> o il pulsante sopra per creare Modelli.</p>

                              <!-- OCR Section -->
                              <div class="mt-2 border-t border-border pt-2">
                                 <input type="file" accept="image/*" x-ref="ocrImageInput" @change="performOCR" class="hidden">
                                 <button type="button" @click="$refs.ocrImageInput.click()" :disabled="ocrLoading"
                                         class="text-xs text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                                      <i class="fas fa-image"></i> Estrai Testo da Immagine
                                      <i x-show="ocrLoading" class="fas fa-spinner fa-spin ml-1"></i>
                                 </button>
                                 <p x-show="ocrLoading" class="text-xs text-gray-400 mt-1 animate-pulse" x-text="ocrProgressMessage || 'Caricamento...'"></p>
                              </div>
                         </div>
                         <div>
                            <label for="form-notes" class="block text-sm font-medium text-gray-300 mb-1">Note / Descrizione</label>
                             <textarea id="form-notes" x-model="currentElementForm.notes" rows="4"
                                       placeholder="Aggiungi contesto, scopo, o istruzioni opzionali..."
                                       class="w-full bg-input border border-border rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary placeholder-gray-500 text-white"></textarea>
                         </div>
                     </div> <!-- End Left Column -->

                     <!-- Right Column -->
                     <div class="space-y-4">
                         <div>
                             <label for="form-project" class="block text-sm font-medium text-gray-300 mb-1">Progetto</label>
                             <select id="form-project" x-model="currentElementForm.projectId"
                                     class="w-full bg-input border border-border rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary appearance-none text-white">
                                 <option :value="null">Nessun progetto</option>
                                 <template x-for="project in progetti" :key="project.id">
                                     <option :value="project.id" x-text="project.name"></option>
                                 </template>
                             </select>
                         </div>
                         <div>
                             <label for="form-tags" class="block text-sm font-medium text-gray-300 mb-1">Tags</label>
                             <div x-data="{ newTag: '' }" class="relative">
                                 <input type="text" id="form-tags-input" x-model="newTag" @keydown.enter.prevent="addTag(newTag); newTag=''" @keydown.,.prevent="addTag(newTag); newTag=''"
                                        placeholder="Aggiungi tags (es. #email, #bozza)"
                                        class="w-full bg-input border border-border rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary placeholder-gray-500 text-white">
                                <button type="button" @click.prevent="addTag(newTag); newTag=''" x-show="newTag.trim() !== ''" class="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-primary text-white px-2 py-0.5 rounded hover:bg-primary/80">Aggiungi</button>
                             </div>
                             <div class="mt-2 flex flex-wrap gap-1 min-h-[26px]">
                                <template x-for="(tag, index) in currentElementForm.tags" :key="index">
                                    <span class="tag flex items-center" :class="getTagColorClass(tag)">
                                        <span x-text="tag"></span>
                                        <button type="button" @click.prevent="removeTag(index)" class="ml-1.5 text-gray-500 hover:text-white text-xs opacity-70 hover:opacity-100">&times;</button>
                                    </span>
                                </template>
                                <span x-show="!currentElementForm.tags || currentElementForm.tags.length === 0" class="text-xs text-gray-500 italic px-1">Nessun tag aggiunto</span>
                             </div>
                         </div>
                         <div>
                             <label for="form-aiModel" class="block text-sm font-medium text-gray-300 mb-1">Modello AI Suggerito</label>
                             <input type="text" list="ai-models-list" id="form-aiModel" x-model="currentElementForm.aiModel"
                                    placeholder="Es. ChatGPT-4o, Claude 3 Sonnet..."
                                    class="w-full bg-input border border-border rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary placeholder-gray-500 text-white">
                              <datalist id="ai-models-list">
                                <option value="ChatGPT-4o"></option>
                                <option value="ChatGPT-4"></option>
                                <option value="ChatGPT-3.5"></option>
                                <option value="Claude 3 Opus"></option>
                                <option value="Claude 3 Sonnet"></option>
                                <option value="Claude 3 Haiku"></option>
                                <option value="Gemini Pro"></option>
                                <option value="Gemini Ultra"></option>
                                <option value="Qualsiasi Modello"></option>
                                <option value="Altro"></option>
                              </datalist>
                         </div>
                         <div>
                             <label class="block text-sm font-medium text-gray-300 mb-1">Immagine (Opzionale)</label>
                             <div class="flex flex-col sm:flex-row gap-2 items-start">
                                 <div class="flex-grow">
                                      <label for="form-imageUrl" class="sr-only">URL Immagine</label>
                                      <input type="url" id="form-imageUrl" x-model.lazy="currentElementForm.imageUrl" @input="/* Assume URL input might clear file upload */"
                                             placeholder="Incolla URL immagine (es. https://...)"
                                             class="w-full bg-input border border-border rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary text-white placeholder-gray-500">
                                 </div>
                                 <span class="text-xs text-gray-500 self-center px-1">oppure</span>
                                 <div>
                                     <label for="form-imageFile" class="sr-only">Carica Immagine</label>
                                     <input type="file" id="form-imageFile" @change="handleImageUpload($event)" accept="image/*"
                                            class="block w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 file:cursor-pointer">
                                 </div>
                             </div>
                             <img x-show="currentElementForm.imageUrl" :src="currentElementForm.imageUrl" @error="handleImageError($event)" alt="Anteprima immagine" class="mt-2 max-h-20 w-auto object-contain rounded border border-border">
                         </div>

                         <!-- Variable Detection Preview -->
                         <div x-show="currentElementForm.type === 'Modello'" class="mt-4 p-3 bg-input/50 rounded-md border border-border/50">
                             <h4 class="text-sm font-semibold text-white mb-2 text-highlight"><i class="fa fa-cogs mr-2"></i>Variabili Rilevate:</h4>
                             <div class="flex flex-wrap gap-1 min-h-[18px]" x-show="getVariablesFromText(currentElementForm.text).length > 0">
                                <template x-for="variable in getVariablesFromText(currentElementForm.text)" :key="variable">
                                     <span class="inline-block bg-highlight/20 text-highlight text-xs font-mono font-medium mr-2 px-2 py-0.5 rounded-full border border-highlight/30" x-text="variable"></span>
                                </template>
                             </div>
                             <p class="text-xs text-gray-400 italic" x-show="getVariablesFromText(currentElementForm.text).length === 0">Nessuna variabile ( {{variabile}} ) trovata.</p>
                             <p class="text-xs text-gray-400 mt-1">Questo elemento verrà salvato come <strong class="text-highlight">Modello</strong>.</p>
                         </div>
                          <div x-show="currentElementForm.type === 'Prompt'" class="mt-4 p-3 bg-input/50 rounded-md border border-border/50">
                             <h4 class="text-sm font-semibold text-white mb-2 text-blue-400"><i class="fa fa-file-alt mr-2"></i>Tipo Rilevato:</h4>
                             <p class="text-xs text-gray-400 mt-1">Nessuna variabile ( {{...}} ) trovata. Questo elemento verrà salvato come <strong class="text-blue-400">Prompt</strong>.</p>
                         </div>
                     </div> <!-- End Right Column -->
                 </div> <!-- End Form Grid -->
             </form>
        </div>

        <!-- Confirmation Modal -->
        <div x-show="isConfirmModalOpen"
             x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 scale-95" x-transition:enter-end="opacity-100 scale-100"
             x-transition:leave="transition ease-in duration-150" x-transition:leave-start="opacity-100 scale-100" x-transition:leave-end="opacity-0 scale-95"
             class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4"
             aria-labelledby="confirm-modal-title" role="dialog" aria-modal="true">

            <div @click="closeConfirmModal()" class="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" aria-hidden="true"></div>

            <div class="relative bg-card rounded-lg shadow-xl max-w-md w-full border border-red-500/30 p-6 transform transition-all">
                 <div class="text-center">
                    <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                    <h3 class="text-lg font-semibold text-white mb-2" id="confirm-modal-title" x-text="itemToDeleteId && itemToDeleteId.startsWith('proj-') ? 'Conferma Eliminazione Progetto' : 'Conferma Eliminazione Elemento'"></h3>
                     <p class="text-sm text-gray-300 mb-6">Sei sicuro di voler eliminare questo elemento? <span x-show="itemToDeleteId && itemToDeleteId.startsWith('proj-')">Gli elementi associati non verranno eliminati ma resteranno senza progetto.</span> L'azione è irreversibile.</p>
                    <div class="flex justify-center gap-4">
                         <button @click="executeConfirmedAction()" class="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-6 rounded-md text-sm transition-colors duration-150">
                             Sì, Elimina
                         </button>
                         <button @click="closeConfirmModal()" class="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-6 rounded-md text-sm transition-colors duration-150">
                             Annulla
                         </button>
                     </div>
                 </div>
             </div>
        </div>

        <!-- Toast Notifications Container -->
        <div aria-live="assertive" class="fixed inset-0 flex flex-col items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-end z-50 space-y-2">
            <template x-for="toast in toastMessages" :key="toast.id">
                <div x-show="toast.show"
                     x-transition:enter="transform ease-out duration-300 transition" x-transition:enter-start="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2" x-transition:enter-end="translate-y-0 opacity-100 sm:translate-x-0"
                     x-transition:leave="transition ease-in duration-100" x-transition:leave-start="opacity-100" x-transition:leave-end="opacity-0"
                     class="max-w-sm w-full bg-card shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border-l-4"
                     :class="{'border-green-500': toast.type === 'success', 'border-red-500': toast.type === 'error', 'border-blue-500': toast.type === 'info' }">
                     <div class="p-3">
                        <div class="flex items-start">
                            <div class="flex-shrink-0">
                                 <i :class="{'fas fa-check-circle text-green-500': toast.type === 'success', 'fas fa-times-circle text-red-500': toast.type === 'error', 'fas fa-info-circle text-blue-500': toast.type === 'info' }" class="h-5 w-5 mt-0.5"></i>
                             </div>
                            <div class="ml-3 w-0 flex-1 pt-0.5"> <p class="text-sm font-medium text-white" x-text="toast.message"></p> </div>
                            <div class="ml-4 flex-shrink-0 flex">
                                 <button @click="removeToast(toast.id)" class="inline-flex text-gray-400 hover:text-gray-300">
                                     <span class="sr-only">Close</span> <i class="fas fa-times h-5 w-5"></i>
                                 </button>
                             </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>

    </div> <!-- End x-data root -->

    <!-- Alpine.js Store and Logic -->
    <script src="dashboard.js"></script>

</body>
</html>