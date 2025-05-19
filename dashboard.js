$(document).ready(() => {
    console.log("Document ready. Initializing Prompt Maestro v3.2...");

    // Variables, constants, helpTooltipsContent, onboardingState, onboardingStepsData, initialSampleTemplates from previous response remain largely the same.
    // I'll only show changes or new additions here for brevity, assuming the rest is carried over.
    let allLoadedPrompts = []; 
    let userSavedItems = []; 
    let globalShowItalianTranslations = localStorage.getItem('globalShowItalianTranslationsPM_v3.2') === 'true';
    const MAX_ITEMS_FREE_PLAN = 300;

    const helpTooltipsContent = { // Unchanged from v3.1
        "effectivePrompts": "Per prompt efficaci: <strong>sii specifico</strong>, fornisci <strong>contesto</strong>, definisci <strong>l'output desiderato</strong> (formato, lunghezza, stile). Nei Modelli, usa <code>[variabili_chiare_e_parlanti]</code> per la massima riusabilità. Esempio: <code>Scrivi una email a [nome_cliente] riguardo all'aggiornamento di [nome_prodotto]</code>.",
        "faqHelp": "Le FAQ coprono argomenti come la gestione di Prompt e Modelli, l'uso delle variabili, la personalizzazione e i piani futuri. Controlla regolarmente per aggiornamenti!",
        "placeholderUsage": "I placeholder (o variabili) come <code>[argomento_email]</code> o <code>[nome_destinatario]</code> rendono i Modelli incredibilmente flessibili. <br>1. <strong>Definisci</strong> le variabili quando crei/modifichi un Modello (appariranno automaticamente se le scrivi nel testo, o puoi aggiungerle manualmente). <br>2. <strong>Compila</strong> i valori per queste variabili quando 'Usi' il Modello per generare un prompt specifico.",
        "globalTranslateToggle": "Attiva per visualizzare i testi dei prompt/modelli in Italiano (se una traduzione è disponibile). Disattiva per vedere la versione originale (solitamente Inglese). Questa impostazione è globale per tutte le card.",
        "aiModelNotes": "Indica quale modello AI (es. GPT-4o, Claude 3 Sonnet) funziona meglio con questo prompt/modello, o aggiungi note su parametri specifici (es. temperatura bassa per risposte fattuali)."
    };
    const onboardingState = { // Unchanged from v3.1
        currentStep: 1,
        totalSteps: 3, 
        userChoice: null, 
        completed: localStorage.getItem('onboardingCompletedPM_v3.2') === 'true' // Updated version key
    };
    let onboardingItemCache = { name: '', text: '', variables: [] }; // Unchanged
    const onboardingStepsData = [ /* Unchanged from v3.1 */
        {
            step: 1, title: "Benvenuto in Prompt Maestro!", icon: "fa-magic-wand-sparkles",
            mainHtml: `
                <div>
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                        <h2 class="text-2xl font-semibold flex items-center text-lightText-display mb-2 sm:mb-0">
                            <span class="bg-gradient-to-br from-brandPurple-light to-brandPurple text-white w-10 h-10 rounded-xl flex items-center justify-center mr-3.5 text-xl shrink-0 shadow-lg shadow-brandPurple/30"><i class="fas fa-magic-wand-sparkles"></i></span>
                            Benvenuto in Prompt Maestro!
                        </h2>
                        <div class="text-sm text-lightText-subtle shrink-0 mt-1 sm:mt-0">Passo 1 di ${onboardingState.totalSteps}</div>
                    </div>
                    <p class="text-lightText-subtle mb-6 text-base leading-relaxed">Prompt Maestro ti aiuta a creare, gestire e riutilizzare prompt e modelli AI potenti ed efficaci. Sei pronto a trasformare il tuo workflow?</p>
                    <p class="text-lightText-DEFAULT mb-8 text-base leading-relaxed">Scegli come vuoi iniziare questo tour guidato:</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                        <div class="onboarding-choice-card ph-card p-6 rounded-xl border-2 border-darkBg-uiElement hover:border-brandPurple cursor-pointer transition-all duration-200 transform hover:scale-[1.02]" data-choice="prompt">
                            <div class="flex items-start mb-2">
                                <span class="bg-accentTeal-DEFAULT/20 text-accentTeal-light w-11 h-11 flex items-center justify-center rounded-lg mr-4 text-xl shrink-0"><i class="fas fa-pencil-alt"></i></span>
                                <div>
                                    <h3 class="font-semibold text-lg text-lightText-display mb-1">Crea un Prompt Semplice</h3>
                                    <p class="text-lightText-subtle text-sm line-clamp-2">Perfetto per idee veloci o istruzioni dirette all'AI. Imparerai le basi.</p>
                                </div>
                            </div>
                        </div>
                        <div class="onboarding-choice-card ph-card p-6 rounded-xl border-2 border-darkBg-uiElement hover:border-brandPurple cursor-pointer transition-all duration-200 transform hover:scale-[1.02]" data-choice="model">
                            <div class="flex items-start mb-2">
                                <span class="bg-brandPurple/20 text-brandPurple-light w-11 h-11 flex items-center justify-center rounded-lg mr-4 text-xl shrink-0"><i class="fas fa-layer-group"></i></span>
                                 <div>
                                    <h3 class="font-semibold text-lg text-lightText-display mb-1">Crea un Modello Avanzato</h3>
                                    <p class="text-lightText-subtle text-sm line-clamp-2">Scopri la potenza delle <code>[variabili]</code> per creare template flessibili e riutilizzabili.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p class="text-lightText-subtle/80 text-xs italic mb-6 text-center">Potrai sempre accedere a entrambe le funzionalità dalla dashboard principale.</p>
                    <div class="mt-10 flex flex-col sm:flex-row justify-between items-center">
                        <div id="stepDotsContainer" class="flex space-x-2.5 mb-4 sm:mb-0"></div>
                        <div class="flex items-center space-x-3 w-full sm:w-auto">
                            <button id="onboardingSkipButtonStep" class="ph-button-secondary py-2.5 px-5 rounded-lg text-sm font-medium w-1/2 sm:w-auto">Salta Tour</button>
                            <button id="onboardingContinueButton" class="ph-button-primary py-2.5 px-6 rounded-lg flex items-center text-sm font-medium w-1/2 sm:w-auto justify-center opacity-50 cursor-not-allowed" disabled>
                                Continua <i class="fas fa-arrow-right ml-2"></i>
                            </button>
                        </div>
                    </div>
                </div>`
        },
        {
            step: 2, title: "Creazione Guidata", icon: "fa-file-signature",
            mainHtmlTemplate: (choice) => `
                <div>
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                        <h2 class="text-2xl font-semibold flex items-center text-lightText-display mb-2 sm:mb-0">
                           <span class="bg-gradient-to-br from-brandPurple-light to-brandPurple text-white w-10 h-10 rounded-xl flex items-center justify-center mr-3.5 text-xl shrink-0 shadow-lg shadow-brandPurple/30"><i class="fas fa-file-signature"></i></span>
                            ${choice === 'model' ? 'Il Tuo Primo Modello Avanzato' : 'Il Tuo Primo Prompt Semplice'}
                        </h2>
                        <div class="text-sm text-lightText-subtle shrink-0 mt-1 sm:mt-0">Passo 2 di ${onboardingState.totalSteps}</div>
                    </div>
                    <p class="text-lightText-subtle mb-5 text-base leading-relaxed">
                        ${choice === 'model' ? 
                        `Stai creando un <strong>Modello Avanzato</strong>! I modelli usano <code>[variabili]</code> (come <code>[argomento_blog]</code> o <code>[nome_cliente]</code>) per renderli super flessibili. <br>Scrivi il testo del tuo modello qui sotto. Se includi parole tra parentesi quadre, le riconosceremo come variabili!` :
                        `Stai creando un <strong>Prompt Semplice</strong>. Scrivi il testo che vuoi inviare alla tua AI. Ricorda: più sei specifico, migliori saranno i risultati!`
                        }
                    </p>
                    <div class="ph-card p-6 rounded-xl mb-6 border border-darkBg-uiElementHover">
                        <div class="mb-4">
                            <label for="onboardingItemName" class="block text-sm font-medium text-lightText-DEFAULT mb-1.5">Nome del tuo ${choice === 'model' ? 'Modello' : 'Prompt'} <span class="text-dangerRose-DEFAULT">*</span></label>
                            <input type="text" id="onboardingItemName" placeholder="${choice === 'model' ? 'Es. Modello Email Follow-up' : 'Es. Idea Post LinkedIn Veloce'}" class="ph-input w-full text-sm py-2.5 px-3.5 rounded-lg">
                        </div>
                        <div class="mb-4">
                            <label for="onboardingItemText" class="block text-sm font-medium text-lightText-DEFAULT mb-1.5">Testo del ${choice === 'model' ? 'Modello' : 'Prompt'}</label>
                            <textarea id="onboardingItemText" rows="4" class="ph-textarea w-full text-sm py-2.5 px-3.5 rounded-lg font-mono" placeholder="Es. Crea una descrizione prodotto per [nome_prodotto] focalizzata su [beneficio_chiave]..."></textarea>
                        </div>
                        
                        ${choice === 'model' ? `
                        <div id="onboardingVariablesDisplay" class="mb-4">
                             <p class="text-sm font-medium text-lightText-DEFAULT mb-2">Variabili Rilevate (Anteprima): <i class="fas fa-info-circle quick-help-tooltip ml-1 text-xs" data-help-id="placeholderUsage"></i></p>
                             <div id="onboardingDetectedVariables" class="flex flex-wrap gap-2 min-h-[28px] p-2 bg-darkBg-DEFAULT/70 rounded-md">
                                <!-- Variabili rilevate da [testo] verranno mostrate qui -->
                             </div>
                        </div>
                        ` : ''}
                        <div>
                            <label class="block text-sm font-medium text-lightText-DEFAULT mb-1.5">Anteprima (come apparirà all'AI):</label>
                            <div id="onboardingItemPreview" class="bg-darkBg-DEFAULT/70 p-3.5 rounded-lg text-sm text-lightText-DEFAULT font-mono leading-relaxed min-h-[60px] border border-darkBg-uiElement/50 whitespace-pre-wrap"></div>
                        </div>
                    </div>
                    <p class="text-lightText-subtle text-xs italic"><i class="fas fa-info-circle mr-1.5 text-brandPurple-light"></i> ${choice === 'model' ? 'Ricorda: le variabili rendono i modelli riutilizzabili per infinite situazioni!' : 'Per prompt più flessibili e riutilizzabili, prova a creare un Modello Avanzato la prossima volta.'}</p>
                    
                    <div class="mt-10 flex flex-col sm:flex-row justify-between items-center">
                        <div id="stepDotsContainer" class="flex space-x-2.5 mb-4 sm:mb-0"></div>
                        <div class="flex items-center space-x-3 w-full sm:w-auto">
                             <button id="onboardingBackButton" class="ph-button-secondary py-2.5 px-5 rounded-lg text-sm font-medium w-1/2 sm:w-auto">Indietro</button>
                            <button id="onboardingContinueButton" class="ph-button-primary py-2.5 px-6 rounded-lg flex items-center text-sm font-medium w-full sm:w-auto justify-center">
                                ${choice === 'model' ? 'Definisci Variabili' : 'Salva e Continua'} <i class="fas fa-arrow-right ml-2"></i>
                            </button>
                        </div>
                    </div>
                </div>`
        },
        { 
            step: 3, title: "Finalizzazione", icon: "fa-check-double",
            mainHtmlTemplate: (choice) => `
                <div>
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                        <h2 class="text-2xl font-semibold flex items-center text-lightText-display mb-2 sm:mb-0">
                           <span class="bg-gradient-to-br from-brandPurple-light to-brandPurple text-white w-10 h-10 rounded-xl flex items-center justify-center mr-3.5 text-xl shrink-0 shadow-lg shadow-brandPurple/30"><i class="fas ${choice === 'model' ? 'fa-sliders-h' : 'fa-save'}"></i></span>
                            ${choice === 'model' ? 'Definisci le Tue Variabili' : 'Ultimo Controllo'}
                        </h2>
                        <div class="text-sm text-lightText-subtle shrink-0 mt-1 sm:mt-0">Passo 3 di ${onboardingState.totalSteps}</div>
                    </div>
                    
                    ${choice === 'model' ? `
                    <p class="text-lightText-subtle mb-5 text-base leading-relaxed">
                        Ottimo! Ora puoi aggiungere dettagli per ciascuna variabile rilevata. Questo aiuterà te (e altri, se condividerai il modello) a capire come usarle al meglio.
                    </p>
                    <div id="onboardingModelVariableDefinitions" class="ph-card p-6 rounded-xl mb-6 border border-darkBg-uiElementHover space-y-4 max-h-80 overflow-y-auto">
                        <!-- Variable definition inputs will be injected here by JS -->
                    </div>
                    ` : `
                    <p class="text-lightText-subtle mb-5 text-base leading-relaxed">
                        Il tuo prompt semplice è quasi pronto! Dai un'ultima occhiata e poi salvalo per iniziare a usarlo.
                    </p>
                    <div class="ph-card p-6 rounded-xl mb-6 border border-darkBg-uiElementHover">
                        <h3 id="onboardingFinalItemNameDisplay" class="text-lg font-semibold text-lightText-display mb-2"></h3>
                        <p class="text-sm text-lightText-subtle mb-1">Testo del Prompt:</p>
                        <div id="onboardingFinalItemPreview" class="bg-darkBg-DEFAULT/70 p-3.5 rounded-lg text-sm text-lightText-DEFAULT font-mono leading-relaxed min-h-[60px] border border-darkBg-uiElement/50 whitespace-pre-wrap"></div>
                    </div>
                    `}
                    
                    <p class="text-lightText-DEFAULT text-base leading-relaxed mt-6">Complimenti! Salva questo esempio per accedere alla dashboard completa di Prompt Maestro.</p>
                    <div class="mt-10 flex flex-col sm:flex-row justify-between items-center">
                        <div id="stepDotsContainer" class="flex space-x-2.5 mb-4 sm:mb-0"></div>
                        <div class="flex items-center space-x-3 w-full sm:w-auto">
                             <button id="onboardingBackButton" class="ph-button-secondary py-2.5 px-5 rounded-lg text-sm font-medium w-1/2 sm:w-auto">Indietro</button>
                            <button id="onboardingCompleteButton" class="ph-button-primary py-2.5 px-6 rounded-lg flex items-center text-sm font-medium w-full sm:w-auto justify-center">
                                Salva e Vai alla Dashboard <i class="fas fa-rocket ml-2"></i>
                            </button>
                        </div>
                    </div>
                </div>`
        }
    ]; // Unchanged from v3.1
    const initialSampleTemplates = [ /* Unchanged from v3.1 */
      {
        "id": "sample-blog-generator", "title": "Generatore Idee Blog (Modello Campione)",
        "text_en": "Generate a list of 5 engaging and SEO-friendly blog post titles about [main_topic]. The target audience is [target_audience], the blog's main category is [blog_category], and the desired tone is [desired_tone]. Include a unique angle for at least two titles.",
        "text_it": "[IT Tradotto] Generate a list of 5 engaging and SEO-friendly blog post titles about [main_topic]. The target audience is [target_audience], the blog's main category is [blog_category], and the desired tone is [desired_tone]. Include a unique angle for at least two titles.", // Example of auto-translated
        "isModel": true,
        "variables": [
            { "name": "main_topic", "description": "Argomento centrale del post", "example": "AI nel Content Marketing" },
            { "name": "target_audience", "description": "A chi si rivolge il post", "example": "Marketers Digitali, Piccole Imprese" },
            { "name": "blog_category", "description": "Categoria principale del blog", "example": "Tecnologia e Innovazione" },
            { "name": "desired_tone", "description": "Tono di voce del post", "example": "Informativo ma Entusiasmante" }
        ],
        "type": "Modello Campione", "tags": ["blogging", "seo", "contenuti", "ispirazione", "marketing"],
        "aiModel": "GPT-4o / Claude 3", "category": "Creazione Contenuti", "icon": "fas fa-feather-pointed", "created_at": Date.now() - 100000, "popularity": 85 
      },
      {
        "id": "sample-email-followup", "title": "Email Follow-up Meeting (Modello Campione)",
        "text_en": "Draft a professional follow-up email to [contact_name] after our meeting on [date_of_meeting] regarding [meeting_topic]. Key discussion points were: [key_point_1], [key_point_2]. Next steps agreed: [action_item_1] (by [owner_action_1]) and [action_item_2] (by [owner_action_2]). Attach [attachment_name] if applicable.",
        "text_it": "[IT Tradotto] Draft a professional follow-up email to [contact_name] after our meeting on [date_of_meeting] regarding [meeting_topic]. Key discussion points were: [key_point_1], [key_point_2]. Next steps agreed: [action_item_1] (by [owner_action_1]) and [action_item_2] (by [owner_action_2]). Attach [attachment_name] if applicable.",
        "isModel": true,
        "variables": [
            { "name": "contact_name", "description": "Nome del contatto", "example": "Sig. Mario Rossi" },
            { "name": "date_of_meeting", "description": "Data del meeting", "example": "ieri / 15 Luglio" },
            { "name": "meeting_topic", "description": "Argomento del meeting", "example": "Proposta Progetto Phoenix" },
            { "name": "key_point_1", "description": "Punto chiave discusso 1", "example": "Approvazione budget iniziale" },
            { "name": "key_point_2", "description": "Punto chiave discusso 2", "example": "Definizione timeline preliminare" },
            { "name": "action_item_1", "description": "Prossima azione 1", "example": "Inviare report dettagliato" },
            { "name": "owner_action_1", "description": "Responsabile azione 1", "example": "il nostro team" },
            { "name": "action_item_2", "description": "Prossima azione 2", "example": "Pianificare demo tecnica" },
            { "name": "owner_action_2", "description": "Responsabile azione 2", "example": "Sig. Rossi" },
            { "name": "attachment_name", "description": "Nome dell'allegato (opzionale)", "example": "Presentazione_Progetto.pdf" }
        ],
        "type": "Modello Campione", "tags": ["email", "follow-up", "professionale", "meeting", "produttività"],
        "aiModel": "Qualsiasi Modello Testuale", "category": "Comunicazione", "icon": "fas fa-envelope-open-text", "created_at": Date.now() - 200000, "popularity": 70
      },
      {
        "id": "sample-simple-tweet", "title": "Idea Tweet Veloce (Prompt Campione)",
        "text_en": "Write a short, impactful tweet (under 280 chars) about the future of AI in education. Include a relevant hashtag.",
        "text_it": "[IT Tradotto] Write a short, impactful tweet (under 280 chars) about the future of AI in education. Include a relevant hashtag.",
        "isModel": false, "variables": [],
        "type": "Prompt Campione", "tags": ["social media", "tweet", "ai", "educazione", "ispirazione rapida"],
        "aiModel": "GPT-3.5 / Gemini", "category": "Social Media", "icon": "fab fa-twitter", "created_at": Date.now() - 50000, "popularity": 60
      }
    ];
	
	$.debounce = function(delay, callback) { /* Unchanged */
        var timeout = null;
        return function() {
            var args = arguments;
            var context = this;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                callback.apply(context, args);
            }, delay);
        };
    };

    // --- Spotlight Tooltip Management ---
    const spotlightConfig = {
        'translate-toggle': {
            element: '#globalItalianTranslationToggleBtn',
            text: '<strong>Lingua Globale!</strong><br>Clicca qui per cambiare la lingua di visualizzazione di tutti i prompt e modelli tra Inglese e Italiano (tradotto automaticamente).',
            position: 'bottom', // 'top', 'bottom', 'left', 'right'
            shownKey: 'spotlight_translate_shown_v3.2'
        },
        'create-model': {
            element: '#createNewModelSidebarBtn',
            text: '<strong>Crea Modelli Potenti!</strong><br>I Modelli usano <code>[variabili]</code> per diventare template riutilizzabili. Prova a crearne uno!',
            position: 'right',
            shownKey: 'spotlight_create_model_shown_v3.2'
        },
        'variables-area': { // This will be triggered conditionally when the modal for model creation is open
            element: '#itemActionModalModelVariableSection', // The section containing variable inputs
            text: '<strong>Qui la Magia!</strong><br>Definisci qui le tue <code>[variabili]</code>. Scrivile nel testo (es. <code>[cliente]</code>) e appariranno qui, o aggiungile manualmente.',
            position: 'bottom',
            shownKey: 'spotlight_variables_area_shown_v3.2',
            condition: () => $('#itemActionModal').is(':visible') && $('#itemActionModalMode').val() === 'createModel' // Only show if modal is open for createModel
        }
    };

    function showSpotlight(spotlightId) {
        const config = spotlightConfig[spotlightId];
        if (!config || localStorage.getItem(config.shownKey)) {
            return; // Already shown or no config
        }
        if (config.condition && !config.condition()) {
            return; // Condition not met
        }

        const $targetElement = $(config.element);
        if (!$targetElement.is(':visible')) { // Ensure target is visible
            // Try again in a bit if it might appear later (e.g. modal opening)
            setTimeout(() => { if ($targetElement.is(':visible')) showSpotlight(spotlightId); }, 500);
            return;
        }
        
        const $tooltip = $(`#spotlight-${spotlightId}`);
        if(!$tooltip.length) { console.warn("Spotlight tooltip HTML not found for ID:", spotlightId); return;}

        $tooltip.find('p').html(config.text); // Set text

        const targetOffset = $targetElement.offset();
        const targetWidth = $targetElement.outerWidth();
        const targetHeight = $targetElement.outerHeight();
        const tooltipWidth = $tooltip.outerWidth();
        const tooltipHeight = $tooltip.outerHeight();

        let top, left;
        $tooltip.removeClass('top bottom left right'); // Clear previous position classes

        switch (config.position) {
            case 'top':
                top = targetOffset.top - tooltipHeight - 15; // 10px arrow + 5px gap
                left = targetOffset.left + (targetWidth / 2) - (tooltipWidth / 2);
                $tooltip.addClass('top');
                break;
            case 'bottom':
                top = targetOffset.top + targetHeight + 15;
                left = targetOffset.left + (targetWidth / 2) - (tooltipWidth / 2);
                $tooltip.addClass('bottom');
                break;
            case 'left':
                top = targetOffset.top + (targetHeight / 2) - (tooltipHeight / 2);
                left = targetOffset.left - tooltipWidth - 15;
                $tooltip.addClass('left');
                break;
            case 'right':
                top = targetOffset.top + (targetHeight / 2) - (tooltipHeight / 2);
                left = targetOffset.left + targetWidth + 15;
                $tooltip.addClass('right');
                break;
            default: // bottom
                top = targetOffset.top + targetHeight + 10;
                left = targetOffset.left + (targetWidth / 2) - (tooltipWidth / 2);
                $tooltip.addClass('bottom');
        }
        // Boundary checks (simple version)
        if (left < 5) left = 5;
        if (left + tooltipWidth > $(window).width() - 5) left = $(window).width() - tooltipWidth - 5;
        if (top < 5) top = 5;
        if (top + tooltipHeight > $(window).height() - 5) top = $(window).height() - tooltipHeight - 5;


        $tooltip.css({ top: top, left: left }).removeClass('hidden').hide().fadeIn(300);

        $tooltip.find('button').off('click').on('click', function() {
            $tooltip.fadeOut(200, () => $tooltip.addClass('hidden'));
            localStorage.setItem(config.shownKey, 'true');
        });
    }

    function initSpotlights() {
        // Show initial spotlights that don't depend on modal state
        showSpotlight('translate-toggle');
        showSpotlight('create-model');
        // 'variables-area' spotlight will be checked when its modal section becomes relevant
    }
    // Call initSpotlights after a small delay to ensure layout is stable
    setTimeout(initSpotlights, 1000);


    // Toast Notification (Unchanged from v3.1)
    let toastTimeout;
    function showToast(message, duration = 3000, type = 'info') { 
        const $toast = $('#toastNotification');
        const $toastMessage = $('#toastMessage');
        const $toastIcon = $('#toastIcon');

        $toast.removeClass('border-brandPurple-light border-accentTeal-light border-dangerRose-DEFAULT border-amber-400 translate-y-10 opacity-0');
        $toastIcon.removeClass('fa-info-circle fa-check-circle fa-exclamation-triangle fa-exclamation-circle');

        let borderColor = 'border-brandPurple-light'; 
        let iconClass = 'fa-info-circle';

        if (type === 'success') {
            borderColor = 'border-accentTeal-light';
            iconClass = 'fa-check-circle text-accentTeal-light';
        } else if (type === 'error') {
            borderColor = 'border-dangerRose-DEFAULT';
            iconClass = 'fa-exclamation-circle text-dangerRose-DEFAULT';
        } else if (type === 'warning') {
            borderColor = 'border-amber-400';
            iconClass = 'fa-exclamation-triangle text-amber-400';
        } else { 
             iconClass += ' text-brandPurple-light';
        }
        
        $toast.addClass(borderColor);
        $toastIcon.attr('class', `fas ${iconClass} mr-3`); 
        $toastMessage.text(message);
        
        $toast.removeClass('hidden').addClass('translate-y-0 opacity-100');

        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            $toast.removeClass('translate-y-0 opacity-100').addClass('translate-y-10 opacity-0');
            setTimeout(() => $toast.addClass('hidden'), 300);
        }, duration);
    }
    function triggerConfetti() { /* Unchanged */
        const container = $('.confetti-container');
        if (!container.length) return;
        container.empty(); 

        const colors = ['#7C3AED', '#A78BFA', '#14B8A6', '#2DD4BF', '#F43F5E'];
        for (let i = 0; i < 100; i++) {
            const confettiEl = $('<div class="confetti"></div>');
            confettiEl.css({
                left: Math.random() * 100 + 'vw',
                backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                animationDelay: Math.random() * 0.5 + 's',
                transform: `scale(${Math.random() * 0.5 + 0.5})` 
            });
            container.append(confettiEl);
        }
        $('.confetti').each(function() {
            $(this).animate({
                top: '110vh',
                left: '+=' + ((Math.random() - 0.5) * 200) + 'px', 
                opacity: 0,
                transform: 'rotate(' + (Math.random() * 720) + 'deg)' 
            }, 3000 + Math.random() * 1000, 'linear', function() {
                $(this).remove();
            });
        });
    }
    function getDisplayText(item, cardSpecificLangOverride = null) { /* Unchanged */
        if (!item) return "";
        let langToUse = 'en'; 
        
        if (cardSpecificLangOverride) {
            langToUse = cardSpecificLangOverride;
        } else if (globalShowItalianTranslations) {
            langToUse = 'it';
        }

        if (langToUse === 'it' && item.text_it) return item.text_it;
        return item.text_en || item.text_it || ""; 
    }
    function extractVariablesFromText(text) { /* Unchanged */
        if (!text) return [];
        const variableRegex = /\[([a-zA-Z0-9_]+?)\]/g;
        let match;
        const variables = new Set();
        while ((match = variableRegex.exec(text)) !== null) {
            if (match[1].length > 0 && match[1].length < 50) { 
                 variables.add(match[1]);
            }
        }
        return Array.from(variables);
    }
    function updateOnboardingItemPreview() { /* Unchanged */
        let templateText = $('#onboardingItemText').val() || "";
        const detectedVars = extractVariablesFromText(templateText);
        onboardingItemCache.text = templateText; 
        
        if (onboardingState.userChoice === 'model') {
            const $varsDisplay = $('#onboardingDetectedVariables');
            $varsDisplay.empty();
            if (detectedVars.length > 0) {
                onboardingItemCache.variables = detectedVars.map(vName => ({ name: vName, description: '', example: '' })); 
                detectedVars.forEach(varName => {
                    $varsDisplay.append(`<span class="variable-chip text-sm">${varName}</span>`);
                });
            } else {
                onboardingItemCache.variables = [];
                $varsDisplay.html(`<span class="text-xs text-lightText-subtle italic">Nessuna variabile tipo <code>[nome_variabile]</code> rilevata.</span>`);
            }
        }
        let previewText = templateText;
        detectedVars.forEach(varName => {
            const placeholder = new RegExp(`\\[${varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'g');
            previewText = previewText.replace(placeholder, `<span class="text-brandPurple-light font-semibold">[${varName}]</span>`);
        });
        $('#onboardingItemPreview').html(previewText.replace(/\n/g, '<br>'));
    }
    window.renderOnboardingStep = function(stepNumber) { /* Unchanged */
        try {
            if (stepNumber < 1 || stepNumber > onboardingState.totalSteps) {
                console.error("Invalid step number:", stepNumber);
                $('#onboardingCardContainer').html('<p class="text-dangerRose-DEFAULT">Errore: Step non valido.</p>');
                return;
            }
            onboardingState.currentStep = stepNumber;
            const stepData = onboardingStepsData[stepNumber - 1];
            
            $('#onboardingHeaderTitle').text(stepData.title);
            $('#onboardingHeaderIcon').removeClass().addClass(`fas ${stepData.icon} text-white text-xl`);
            
            const htmlContent = (typeof stepData.mainHtmlTemplate === 'function') 
                                ? stepData.mainHtmlTemplate(onboardingState.userChoice) 
                                : stepData.mainHtml;
            $('#onboardingCardContainer').html(htmlContent).removeClass('onboarding-card-animation');
            void document.getElementById('onboardingCardContainer').offsetWidth; 
            $('#onboardingCardContainer').addClass('onboarding-card-animation');
            
            $('#onboardingProgressBarFill').css('width', `${(stepNumber / onboardingState.totalSteps) * 100}%`);
            $('#onboardingCardContainer').find('#stepDotsContainer').html(generateStepDots(stepNumber, onboardingState.totalSteps));

            const $continueBtn = $('#onboardingCardContainer').find('#onboardingContinueButton');
            const $completeBtn = $('#onboardingCardContainer').find('#onboardingCompleteButton');
            const $skipBtn = $('#onboardingCardContainer').find('#onboardingSkipButtonStep');
            const $backBtn = $('#onboardingCardContainer').find('#onboardingBackButton');

            if ($continueBtn.length) {
                $continueBtn.off('click').on('click', handleOnboardingContinue);
                 if (stepNumber === 1 && !onboardingState.userChoice) {
                    $continueBtn.addClass('opacity-50 cursor-not-allowed').prop('disabled', true);
                } else {
                    $continueBtn.removeClass('opacity-50 cursor-not-allowed').prop('disabled', false);
                }
            }
            if ($completeBtn.length) {
                 $completeBtn.off('click').on('click', handleOnboardingComplete);
            }

            if ($backBtn.length) {
                $backBtn.off('click').on('click', () => {
                    if (onboardingState.currentStep > 1) renderOnboardingStep(onboardingState.currentStep - 1);
                });
            }
            if ($skipBtn && $skipBtn.length) {
                $skipBtn.off('click').on('click', closeOnboarding);
            }
            
            // Step-specific logic
            if (stepNumber === 1) {
                $('.onboarding-choice-card').off('click.onboardingchoice').on('click.onboardingchoice', function() {
                    $('.onboarding-choice-card').removeClass('selected border-brandPurple bg-darkBg-uiElement/60').addClass('border-darkBg-uiElement');
                    $(this).removeClass('border-darkBg-uiElement').addClass('selected border-brandPurple bg-darkBg-uiElement/60');
                    onboardingState.userChoice = $(this).data('choice');
                    $continueBtn.removeClass('opacity-50 cursor-not-allowed').prop('disabled', false);
                });
                if (onboardingState.userChoice) { 
                    $(`.onboarding-choice-card[data-choice="${onboardingState.userChoice}"]`).click();
                }
            } else if (stepNumber === 2) {
                $('#onboardingItemName').val(onboardingItemCache.name); 
                $('#onboardingItemText').val(onboardingItemCache.text); 

                if (!onboardingItemCache.text) { 
                    if (onboardingState.userChoice === 'model') {
                        $('#onboardingItemText').val("Crea un post per [piattaforma_social] sull'argomento [argomento_chiave]. Target: [pubblico_target]. Tono: [tono_voce]. Includi hashtag: [hashtag_principale].");
                        $('#onboardingItemName').val("Modello Post Social (Onboarding)");
                    } else {
                         $('#onboardingItemText').val("Scrivi un tweet conciso sull'impatto dell'AI sulla produttività quotidiana.");
                         $('#onboardingItemName').val("Tweet Produttività AI (Onboarding)");
                    }
                }
                updateOnboardingItemPreview(); 
                $('#onboardingItemText').off('input.onboarding').on('input.onboarding', $.debounce(250, updateOnboardingItemPreview));
                $('#onboardingItemName').off('input.onboarding').on('input.onboarding', function() { onboardingItemCache.name = $(this).val(); });

            } else if (stepNumber === 3) {
                if (onboardingState.userChoice === 'model') {
                    renderOnboardingVariableDefinitions();
                } else { 
                    $('#onboardingFinalItemNameDisplay').text(onboardingItemCache.name || "Il Mio Prompt (Onboarding)");
                    $('#onboardingFinalItemPreview').html((onboardingItemCache.text || "Nessun testo inserito.").replace(/\n/g, '<br>'));
                }
            }
            initializeTooltips($('#onboardingCardContainer')); 

        } catch (error) {
            console.error("Error in renderOnboardingStep for step " + stepNumber + ":", error);
            $('#onboardingCardContainer').html(`<p class="text-dangerRose-DEFAULT">Si è verificato un errore. Controlla la console.</p><pre class="text-xs text-lightText-subtle">${error.stack}</pre>`);
        }
    }
    function renderOnboardingVariableDefinitions() { /* Unchanged */
        const $container = $('#onboardingModelVariableDefinitions');
        $container.empty();
        if (!onboardingItemCache.variables || onboardingItemCache.variables.length === 0) {
            $container.html('<p class="text-sm text-lightText-subtle italic">Nessuna variabile rilevata nel testo del modello. Puoi tornare indietro per aggiungerle, oppure salvare il modello così.</p>');
            return;
        }
        onboardingItemCache.variables.forEach((variable, index) => {
            $container.append(`
                <div class="p-3.5 bg-darkBg-DEFAULT rounded-lg border border-darkBg-uiElement/70 variable-definition-entry">
                    <p class="text-md font-semibold text-brandPurple-light mb-2">Variabile: <code>${variable.name}</code></p>
                    <div class="mb-2">
                        <label for="onboarding-var-desc-${index}" class="block text-xs font-medium text-lightText-subtle mb-1">Descrizione (aiuta a capire a cosa serve)</label>
                        <input type="text" id="onboarding-var-desc-${index}" data-index="${index}" class="ph-input w-full text-sm p-2 rounded-md onboarding-var-desc" placeholder="Es. La piattaforma social di destinazione" value="${variable.description || ''}">
                    </div>
                    <div>
                        <label for="onboarding-var-ex-${index}" class="block text-xs font-medium text-lightText-subtle mb-1">Esempio di Valore (per l'anteprima)</label>
                        <input type="text" id="onboarding-var-ex-${index}" data-index="${index}" class="ph-input w-full text-sm p-2 rounded-md onboarding-var-example" placeholder="Es. LinkedIn" value="${variable.example || ''}">
                    </div>
                </div>
            `);
        });

        $('.onboarding-var-desc').on('input', function() {
            const index = $(this).data('index');
            onboardingItemCache.variables[index].description = $(this).val();
        });
        $('.onboarding-var-example').on('input', function() {
            const index = $(this).data('index');
            onboardingItemCache.variables[index].example = $(this).val();
        });
    }
    function generateStepDots(current, total) { /* Unchanged */
        let dotsHtml = '';
        for (let i = 1; i <= total; i++) {
            dotsHtml += `<div class="h-2.5 rounded-full ${i === current ? 'w-7 bg-brandPurple shadow-md-purple' : 'w-2.5 bg-darkBg-uiElementHover'} transition-all duration-300"></div>`;
        }
        return dotsHtml;
    }
    function handleOnboardingContinue() { /* Unchanged */
        if (onboardingState.currentStep === 2) {
            const itemName = $('#onboardingItemName').val().trim();
            onboardingItemCache.name = itemName; 
            if (!itemName) {
                showToast("Il nome è obbligatorio per continuare.", 3000, 'warning');
                $('#onboardingItemName').focus().addClass('border-dangerRose-DEFAULT');
                return;
            }
            $('#onboardingItemName').removeClass('border-dangerRose-DEFAULT');
        }

        if (onboardingState.currentStep < onboardingState.totalSteps) {
            renderOnboardingStep(onboardingState.currentStep + 1);
        } else {
            console.warn("Continue called on last step, should be complete button.");
            handleOnboardingComplete();
        }
    }
    function handleOnboardingComplete() { /* Unchanged, auto-translation will happen in saveUserItem */
        const itemName = onboardingItemCache.name;
        if (!itemName || itemName.trim() === "") { 
            showToast("Il nome è obbligatorio.", 3000, 'error');
            if(onboardingState.currentStep === 3 && onboardingState.userChoice === 'prompt'){
                renderOnboardingStep(2); 
                $('#onboardingItemName').focus().addClass('border-dangerRose-DEFAULT');
            }
            return;
        }

        const itemText = onboardingItemCache.text;
        const isModel = onboardingState.userChoice === 'model';
        let itemVariables = isModel ? onboardingItemCache.variables : [];

        const newItem = {
            id: `user-onboarding-${Date.now()}`,
            title: itemName,
            text_en: itemText, 
            // text_it will be auto-populated by saveUserItem simulation
            isModel: isModel,
            variables: itemVariables, 
            type: isModel ? "Mio Modello" : "Mio Prompt",
            tags: ["onboarding", "personale"],
            aiModel: "Qualsiasi Modello", 
            category: "Onboarding Esempi",
            icon: isModel ? "fas fa-layer-group" : "fas fa-pencil-alt",
            created_at: Date.now(),
            popularity: 50 
        };
        saveUserItem(newItem); // This will now handle auto-translation simulation
        showToast(`${isModel ? 'Modello' : 'Prompt'} "${newItem.title}" creato con successo!`, 3500, 'success');
        triggerConfetti(); 
        onboardingState.completed = true;
        closeOnboarding();
    }
    function closeOnboarding() { /* Unchanged */
        $('#onboardingOverlay').fadeOut(400, function() { $(this).css('display', 'none'); });
        $('#mainDashboardContent').removeClass('hidden').addClass('flex').hide().fadeIn(600);
        if(onboardingState.completed) {
            localStorage.setItem('onboardingCompletedPM_v3.2', 'true');
        }
        updateGettingStartedSection();
        navigateToSection('dashboard'); 
        onboardingItemCache = { name: '', text: '', variables: [] }; 
        // After onboarding, check for any spotlights that might now be relevant
        setTimeout(initSpotlights, 500); 
    }
    function updateGettingStartedSection() { /* Unchanged */
        const $container = $('#gettingStartedStepsContainer');
        $container.empty();
        let completedStepsCount = 0;
        const steps = [
            { 
                id: "onboarding", title: "Completa il Tour Guidato", 
                desc: "Impara le basi di Prompt e Modelli con la nostra introduzione interattiva.", 
                icon: "fa-graduation-cap",
                isComplete: () => onboardingState.completed,
                action: () => { onboardingState.userChoice = null; onboardingItemCache = {name:'', text:'', variables:[]}; $('#onboardingOverlay').css('display', 'flex'); renderOnboardingStep(1); },
                buttonText: () => onboardingState.completed ? "Rivedi Tour" : "Inizia Tour",
                buttonClass: () => onboardingState.completed ? "ph-button-secondary" : "ph-button-primary"
            },
            { 
                id: "browseTemplates", title: "Esplora la Libreria Modelli", 
                desc: "Scopri decine di modelli pronti all'uso per varie esigenze e lasciati ispirare.", 
                icon: "fa-book-sparkles",
                isComplete: () => localStorage.getItem('viewedLibraryPM_v3.2') === 'true', 
                action: () => { navigateToSection('templates'); localStorage.setItem('viewedLibraryPM_v3.2', 'true'); updateGettingStartedSection();},
                buttonText: () => "Sfoglia Libreria",
                buttonClass: () => "ph-button-secondary"
            },
            { 
                id: "createFirstModel", title: "Crea il Tuo Primo Modello Avanzato", 
                desc: "Sfrutta la potenza delle variabili per prompt personalizzati e riutilizzabili.", 
                icon: "fa-layer-group",
                isComplete: () => userSavedItems.some(p => p.isModel && !p.tags.includes("onboarding")),
                action: () => $('#createNewModelSidebarBtn').click(),
                buttonText: () => "Crea Modello",
                buttonClass: () => userSavedItems.some(p => p.isModel && !p.tags.includes("onboarding")) ? "ph-button-secondary" : "ph-button-accent" 
            },
            { 
                id: "createFirstPrompt", title: "Crea il Tuo Primo Prompt Semplice", 
                desc: "Salva una tua idea o istruzione AI per un rapido accesso futuro.", 
                icon: "fa-feather-alt",
                isComplete: () => userSavedItems.some(p => !p.isModel && !p.tags.includes("onboarding")),
                action: () => $('#createNewPromptSidebarBtn').click(),
                buttonText: () => "Crea Prompt",
                buttonClass: () => "ph-button-secondary"
            }
        ];

        steps.forEach(step => {
            const complete = step.isComplete();
            if (complete) completedStepsCount++;
            $container.append(`
                <div class="flex items-center justify-between p-4 bg-darkBg-uiElement/40 rounded-lg border border-darkBg-uiElement/60 ${complete ? 'opacity-70' : 'hover:border-brandPurple/50 transition-colors'}">
                    <div class="flex items-center"> 
                        <span class="w-10 h-10 flex items-center justify-center rounded-md mr-4 text-lg shrink-0 ${complete ? 'bg-accentTeal-DEFAULT/20 text-accentTeal-light' : 'bg-brandPurple/20 text-brandPurple-light'}">
                            <i class="fas ${step.icon}"></i>
                        </span>
                        <div> 
                            <h3 class="font-semibold text-lightText-display">${step.title} ${complete ? '<i class="fas fa-check-circle text-accentTeal-light ml-1.5 text-xs"></i>' : ''}</h3> 
                            <p class="text-xs text-lightText-subtle">${step.desc}</p> 
                        </div> 
                    </div>
                    <button class="${step.buttonClass()} text-xs px-3.5 py-2 rounded-md getting-started-action-btn shrink-0" data-action-id="${step.id}">${step.buttonText()}</button>
                </div>`);
        });
        
        $('#gettingStartedProgressBar').css('width', `${steps.length > 0 ? (completedStepsCount / steps.length) * 100 : 0}%`);
        $('.getting-started-action-btn').on('click', function() {
            const actionId = $(this).data('action-id');
            const stepToDo = steps.find(s => s.id === actionId);
            if (stepToDo && stepToDo.action) stepToDo.action();
        });
        if (completedStepsCount === steps.length && localStorage.getItem('gettingStartedHiddenPM_v3.2') !== 'true') { // Check if not already hidden
             // Optional: auto-hide if all completed and not manually hidden
            // $('#hideGettingStartedBtn').click(); 
        }
    }
    function transformRawPromptToTemplate(rawPrompt) { /* Unchanged, auto-translation will happen in saveUserItem */
        let title = rawPrompt.source_file.split('/').pop().replace('.txt', '');
        title = title.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        if (title.length > 70) title = title.substring(0, 67) + "...";
        
        let text_en = rawPrompt.content;
        const variables = [];
        const variableRegex = /\{\{(.*?)\}\}/g; 
        let match;
        while ((match = variableRegex.exec(text_en)) !== null) {
             const varName = match[1].trim();
             if (varName) variables.push({ name: varName, description: `Placeholder for ${varName}`, example: `Sample ${varName}` });
        }
        text_en = text_en.replace(variableRegex, '[$1]');

        let category = "Sviluppo Software", icon = "fas fa-code-branch", tags = ["esterno", "sviluppo"];
        if (rawPrompt.source_file.toLowerCase().includes("marketing")) { category = "Marketing"; icon = "fas fa-bullhorn"; tags.push("marketing"); }
        else if (rawPrompt.source_file.toLowerCase().includes("writing")) { category = "Scrittura Creativa"; icon = "fas fa-pen-nib"; tags.push("scrittura"); }
        else if (rawPrompt.source_file.toLowerCase().includes("business")) { category = "Business"; icon = "fas fa-briefcase"; tags.push("business"); }
        
        return {
            id: `ext-${rawPrompt.id.replace(/[^a-zA-Z0-9-_]/g, '-')}`, title: title, 
            text_en: text_en, 
            // text_it will be auto-populated later if needed
            isModel: variables.length > 0, 
            variables: variables, type: "Modello Esterno", tags: [...new Set(tags)],
            aiModel: "N/A (Esterno)", category: category, icon: icon,
            created_at: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000), 
            popularity: Math.floor(Math.random() * 50) + 20 
        };
    }
    async function loadAndProcessExternalPrompts() { /* Unchanged */
        showSkeletonLoaders('templateLibraryGrid', 6, true); 
        showSkeletonLoaders('fullTemplateLibraryGrid', 12, true); 
        try {
            const response = await fetch('libreria.json'); 
            if (!response.ok) {
                console.warn("prompts_library.json not found or error loading. Using only initial samples.");
                allLoadedPrompts = [...initialSampleTemplates];
            } else {
                const rawPrompts = await response.json();
                const externalPrompts = rawPrompts.map(transformRawPromptToTemplate);
                allLoadedPrompts = [...initialSampleTemplates, ...externalPrompts];
            }
        } catch (error) {
            console.error("Error loading or processing external prompts:", error);
            allLoadedPrompts = [...initialSampleTemplates]; 
        } finally {
            // Simulate auto-translation for loaded library items if text_it is null
            allLoadedPrompts.forEach(item => {
                if (item.text_en && !item.text_it) {
                    item.text_it = `[IT Tradotto] ${item.text_en}`; // Mock translation
                }
            });
            allLoadedPrompts.sort((a,b) => (b.popularity || 0) - (a.popularity || 0)); 
            populateCategoriesFilter();
            filterAndPopulateLibraries(); 
            updateGettingStartedSection();
            updateGlobalItalianTranslationToggleButton();
            $('#sidebarTemplateCount').text(allLoadedPrompts.filter(p => p.type === "Modello Campione" || p.type === "Modello Esterno" || p.type === "Prompt Campione").length);
            showSkeletonLoaders('templateLibraryGrid', 6, false); // Hide
            showSkeletonLoaders('fullTemplateLibraryGrid', 12, false); // Hide
        }
    }
    window.toggleCardPromptLanguageDisplay = function(itemId, event) { /* Unchanged */
        event.stopPropagation(); 
        const cardElement = $(event.target).closest('.ph-card');
        let currentCardDisplayLang = cardElement.data('current-display-lang') || (globalShowItalianTranslations ? 'it' : 'en');
        let newCardDisplayLang = currentCardDisplayLang === 'it' ? 'en' : 'it';
        
        const item = allLoadedPrompts.find(p => p.id === itemId) || userSavedItems.find(p => p.id === itemId);
        if (!item) return;

        if (newCardDisplayLang === 'it' && !item.text_it) {
            showToast("Traduzione italiana non disponibile per questo elemento.", 2000, 'warning');
            return; 
        }

        const textElement = cardElement.find('.item-text-display');
        const buttonElement = cardElement.find('.translate-card-btn');
        
        const displayText = getDisplayText(item, newCardDisplayLang);
        textElement.html(highlightSearchTerm(displayText.substring(0,150) + (displayText.length > 150 ? "..." : "")));
        cardElement.data('current-display-lang', newCardDisplayLang);

        if (newCardDisplayLang === 'it') {
            buttonElement.find('i').removeClass('fa-language').addClass('fa-globe-europe');
            buttonElement.attr('title', 'Mostra in Inglese').removeClass('ph-button-secondary').addClass('ph-button-accent');
        } else { 
            buttonElement.find('i').removeClass('fa-globe-europe').addClass('fa-language');
            buttonElement.attr('title', 'Mostra in Italiano').removeClass('ph-button-accent').addClass('ph-button-secondary');
        }
    }
    function populateCategoriesFilter() { /* Unchanged */
        const $categoryFilters = $('#categoryFilter, #fullLibraryCategoryFilter'); 
        const categories = new Set();
        allLoadedPrompts.forEach(item => { if(item.category) categories.add(item.category); });
        userSavedItems.forEach(item => { if(item.category) categories.add(item.category); });
        
        $categoryFilters.each(function() {
            const $filter = $(this);
            const currentValue = $filter.val(); 
            $filter.find('option:not(:first-child)').remove(); 
            Array.from(categories).sort().forEach(category => {
                $filter.append(`<option value="${category}">${category}</option>`);
            });
            if(categories.has(currentValue)) $filter.val(currentValue); 
            else $filter.val(""); 
        });
    }
    function highlightSearchTerm(text, term = $('#searchDashboardInput').val()) { /* Unchanged */
         if (!term || term.trim() === "" || !text) return text;
        const searchTerm = term.trim();
        try {
            const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
            const regex = new RegExp(`(${escapedTerm})`, 'gi');
            return text.replace(regex, '<mark class="bg-brandPurple-light text-darkBg-DEFAULT px-0.5 rounded-sm">$1</mark>');
        } catch (e) { console.warn("Regex error in highlight:", e); return text; } 
    }
    function getSortFunction(sortValue) { /* Unchanged */
        switch (sortValue) {
            case 'newest': return (a, b) => (b.created_at || 0) - (a.created_at || 0);
            case 'oldest': return (a, b) => (a.created_at || 0) - (b.created_at || 0);
            case 'az': return (a, b) => (a.title || "").localeCompare(b.title || "");
            case 'za': return (a, b) => (b.title || "").localeCompare(a.title || "");
            case 'category': return (a,b) => (a.category || "zz").localeCompare(b.category || "zz") || (a.title || "").localeCompare(b.title || "");
            case 'popularity': return (a, b) => (b.popularity || 0) - (a.popularity || 0); 
            default: return (a, b) => (b.popularity || 0) - (a.popularity || 0); 
        }
    }

    function populateItemGrid(itemsToDisplay, gridId, context) { // Minor updates to card structure if needed
        // ... (largely unchanged from v3.1, ensure card HTML matches dashboard2.html)
        const $grid = $(`#${gridId}`);
        if (!$grid.length) { console.warn(`Grid with ID ${gridId} not found.`); return; }
        
        // If grid is currently in loading state (from a previous filter op),
        // we don't want to clear it immediately, let skeleton loaders manage.
        // The showSkeletonLoaders(gridId, 0, false) will remove the loading class.
        if (!$grid.hasClass('grid-loading')) {
            $grid.empty();
        }


        const displayLimit = gridId === 'templateLibraryGrid' ? 6 : itemsToDisplay.length; 

        if (itemsToDisplay.length === 0 && !$grid.hasClass('grid-loading')) { // Only show empty if not loading
            let emptyMessage = 'Nessun elemento trovato. Prova a modificare i filtri o la ricerca.';
            if (context === 'myPrompts') emptyMessage = `Non hai ancora salvato prompt. <a href="#" class="text-brandPurple-light hover:underline create-first-prompt-link">Creane uno ora!</a>`;
            if (context === 'myModels') emptyMessage = `Non hai ancora salvato modelli. <a href="#" class="text-brandPurple-light hover:underline create-first-model-link">Creane uno ora!</a>`;
            $grid.html(`<div class="col-span-full text-center py-12"><i class="fas fa-box-open text-4xl text-lightText-subtle/50 mb-4"></i><p class="text-lightText-subtle">${emptyMessage}</p></div>`);
        } else {
             itemsToDisplay.slice(0, displayLimit).forEach(item => {
                const tagsHtml = item.tags.slice(0, 3).map(tag => `<span class="tag bg-darkBg-uiElement text-lightText-subtle px-2 py-1">${highlightSearchTerm(tag)}</span>`).join('') +
                               (item.tags.length > 3 ? `<span class="text-xs text-lightText-subtle/70 ml-1 self-center">+${item.tags.length - 3} altro</span>` : '');
                
                let cardDisplayLang = globalShowItalianTranslations && item.text_it ? 'it' : 'en';
                if ($(`[data-item-id="${item.id}"]`).data('current-display-lang')) { 
                    cardDisplayLang = $(`[data-item-id="${item.id}"]`).data('current-display-lang');
                }

                let textForDisplay = getDisplayText(item, cardDisplayLang); 
                textForDisplay = highlightSearchTerm(textForDisplay);
                const displayTitle = highlightSearchTerm(item.title);

                let langButtonHtml = '';
                if (item.text_it && item.text_en && item.text_it !== item.text_en && item.text_it !== `[IT Tradotto] ${item.text_en}`) { // Check if a meaningful translation exists
                    const isShowingItalian = cardDisplayLang === 'it';
                    const iconClass = isShowingItalian ? 'fa-globe-europe text-accentTeal-light' : 'fa-language';
                    const titleText = isShowingItalian ? 'Mostra in Inglese' : 'Mostra in Italiano';
                    const buttonColorClass = isShowingItalian ? 'ph-button-accent' : 'ph-button-secondary';
                    langButtonHtml = `<button class="translate-card-btn ${buttonColorClass} text-xs p-1.5 rounded-md ml-auto shrink-0 tooltip" onclick="toggleCardPromptLanguageDisplay('${item.id}', event)" title="${titleText}"><i class="fas ${iconClass}"></i><span class="tooltiptext">${titleText}</span></button>`;
                }
                
                const itemTypeIcon = item.icon || (item.isModel ? 'fas fa-layer-group' : 'fas fa-align-left');
                const itemTypeIconColor = item.isModel ? 'text-brandPurple-light' : 'text-accentTeal-light';
                const itemTypeTag = item.isModel ? `<span class="tag tag-model text-xs px-2.5 py-1 rounded-full mr-2">Modello</span>` : `<span class="tag tag-prompt text-xs px-2.5 py-1 rounded-full mr-2">Prompt</span>`;
                
                const popularityHtml = item.popularity ? `<span class="text-xs text-amber-400 tooltip" title="Popolarità"><i class="fas fa-fire mr-1"></i>${item.popularity}<span class="tooltiptext">Punteggio Popolarità</span></span>` : '';

                const cardHtml = `
                    <div class="ph-card p-5 rounded-xl flex flex-col justify-between ph-card-hover h-full" data-item-id="${item.id}" data-item-type="${item.isModel ? 'model' : 'prompt'}" data-current-display-lang="${cardDisplayLang}">
                        <div class="flex-grow">
                            <div class="flex items-start justify-between mb-3">
                                <div class="flex items-start min-w-0">
                                    <div class="bg-darkBg-uiElement/50 ${itemTypeIconColor} w-10 h-10 flex items-center justify-center rounded-lg mr-3.5 shrink-0 shadow-inner">
                                        <i class="${itemTypeIcon} text-xl"></i>
                                    </div>
                                    <div class="min-w-0">
                                       <h3 class="item-title-display font-semibold text-md text-lightText-display truncate pr-2" title="${item.title}">${displayTitle}</h3>
                                       <div class="flex items-center gap-2">${itemTypeTag} ${popularityHtml}</div>
                                    </div>
                                </div>
                                ${langButtonHtml}
                            </div>
                            <p class="item-text-display text-lightText-subtle text-sm leading-relaxed line-clamp-hover-expand mb-3.5 h-16">${textForDisplay.substring(0,150)}${textForDisplay.length > 150 ? "..." : ""}</p>
                            <div class="mb-3.5 text-xs text-lightText-subtle/80 space-x-3">
                                <span><i class="fas fa-cogs mr-1 opacity-70"></i> ${item.aiModel || 'N/D'}</span>
                                <span><i class="fas fa-folder-open mr-1 opacity-70"></i> ${item.category || 'Generale'}</span>
                                ${item.created_at ? `<span><i class="fas fa-calendar-alt mr-1 opacity-70"></i> ${new Date(item.created_at).toLocaleDateString('it-IT', {day:'2-digit', month:'short', year:'2-digit'})}</span>` : ''}
                            </div>
                            <div class="flex flex-wrap gap-1.5 mb-1">${tagsHtml}</div>
                        </div>
                        <div class="mt-auto pt-4 flex space-x-2 shrink-0 border-t border-darkBg-uiElement/50">
                            <button class="ph-button-primary text-xs py-2 px-3 rounded-md flex-1 use-item-btn"><i class="fas fa-bolt mr-1.5"></i> Usa Ora</button>
                            <button class="ph-button-secondary text-xs py-2 px-3 rounded-md quick-view-btn tooltip" title="Anteprima Rapida"><i class="fas fa-eye"></i><span class="tooltiptext">Anteprima</span></button>
                            ${(item.type.startsWith("Mio") || item.type === "Prompt Utente") && !item.id.startsWith("sample-") ? `
                                <button class="ph-button-secondary text-xs py-2 px-3 rounded-md edit-item-btn tooltip" title="Modifica Elemento"><i class="fas fa-edit"></i><span class="tooltiptext">Modifica</span></button>
                                <button class="ph-button-danger text-xs py-2 px-3 rounded-md delete-item-btn tooltip" title="Elimina Elemento"><i class="fas fa-trash"></i><span class="tooltiptext">Elimina</span></button>` : 
                               (item.type === "Modello Campione" || item.type === "Modello Esterno" || item.type === "Prompt Campione") ? `<button class="ph-button-secondary text-xs py-2 px-3 rounded-md add-to-my-items-btn tooltip" title="Aggiungi ai Miei Elementi"><i class="fas fa-plus-circle"></i><span class="tooltiptext">Salva nei Miei</span></button>` : ''
                               }
                        </div>
                    </div>
                `;
                $grid.append(cardHtml);
            });
        }
        initializeTooltips($grid); 
        $('.create-first-prompt-link').on('click', (e) => { e.preventDefault(); openItemActionModal(null, 'createPrompt'); });
        $('.create-first-model-link').on('click', (e) => { e.preventDefault(); openItemActionModal(null, 'createModel'); });
    }
    
    // Updated showSkeletonLoaders to handle loading class
    function showSkeletonLoaders(gridId, count = 3, show = true) {
        const $grid = $(`#${gridId}`);
        if (!$grid.length) return;

        if (show) {
            $grid.addClass('grid-loading').empty(); // Add loading class and clear previous content
            for (let i = 0; i < count; i++) {
                $grid.append(`
                    <div class="ph-card p-5 rounded-xl skeleton-loader min-h-[260px]">
                        <div class="flex items-start mb-4"> <div class="w-10 h-10 rounded-lg mr-3.5 shrink-0"></div> <div class="flex-grow"><div class="h-5 w-3/4 mb-1.5 rounded"></div><div class="h-3 w-1/2 rounded"></div></div> </div>
                        <div class="h-3 w-full mb-2 rounded"></div><div class="h-3 w-full mb-2 rounded"></div><div class="h-3 w-5/6 mb-4 rounded"></div>
                        <div class="h-3 w-3/4 mb-3 rounded"></div>
                        <div class="flex flex-wrap gap-2 mb-4"><div class="h-5 w-16 rounded-full"></div><div class="h-5 w-20 rounded-full"></div></div>
                        <div class="h-8 w-full rounded-md mt-auto"></div>
                    </div>`);
            }
        } else {
            $grid.removeClass('grid-loading'); 
            // Content will be populated by populateItemGrid, so no need to empty here if not already empty
            if ($grid.find('.ph-card').length === 0 && $grid.find('.col-span-full').length === 0) { // If it's truly empty after loading
                 $grid.html('<div class="col-span-full text-center py-12"><i class="fas fa-box-open text-4xl text-lightText-subtle/50 mb-4"></i><p class="text-lightText-subtle">Nessun elemento da mostrare.</p></div>');
            }
        }
    }
    
    function filterAndPopulateLibraries() {
        const searchTerm = $('#searchDashboardInput').val().toLowerCase().trim();
        let allItemsForFiltering = [...allLoadedPrompts, ...userSavedItems];
        let isFiltering = true; // Flag to indicate a filtering operation

        // Determine which grids are visible to apply loaders only to them
        const visibleGridIds = $('.main-content-section:not(.hidden) .grid[id]').map(function() { return this.id; }).get();
        visibleGridIds.forEach(gridId => showSkeletonLoaders(gridId, $(`#${gridId}`).children().length || 3, true)); // Show loader

        // Use a timeout to simulate async data fetching & allow loader to render
        setTimeout(() => {
            let filteredItems = allItemsForFiltering;
            if (searchTerm) {
                filteredItems = allItemsForFiltering.filter(p => 
                    (p.title && p.title.toLowerCase().includes(searchTerm)) ||
                    (p.text_en && p.text_en.toLowerCase().includes(searchTerm)) ||
                    (p.text_it && p.text_it.toLowerCase().includes(searchTerm)) || // Include text_it in search
                    (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
                    (p.category && p.category.toLowerCase().includes(searchTerm)) ||
                    (p.aiModel && p.aiModel.toLowerCase().includes(searchTerm))
                );
            }

            // Dashboard Library
            if ($('#dashboardSection').is(':visible')) {
                const category = $('#categoryFilter').val();
                const sortValue = $('#sortTemplatesFilter').val() || 'popularity';
                let dashboardItems = filteredItems.filter(p => p.type === "Modello Campione" || p.type === "Modello Esterno" || p.type === "Prompt Campione"); 
                if (category) dashboardItems = dashboardItems.filter(p => p.category === category);
                dashboardItems.sort(getSortFunction(sortValue));
                showSkeletonLoaders('templateLibraryGrid', 0, false); // Hide loader before populating
                populateItemGrid(dashboardItems, 'templateLibraryGrid', 'library');
            }
            // Full Library
            if ($('#templatesSection').is(':visible')) {
                const category = $('#fullLibraryCategoryFilter').val();
                const sortValue = $('#sortFullLibraryFilter').val() || 'popularity';
                let fullLibraryItems = filteredItems.filter(p => p.type === "Modello Campione" || p.type === "Modello Esterno" || p.type === "Prompt Campione");
                if (category) fullLibraryItems = fullLibraryItems.filter(p => p.category === category);
                fullLibraryItems.sort(getSortFunction(sortValue));
                showSkeletonLoaders('fullTemplateLibraryGrid', 0, false);
                populateItemGrid(fullLibraryItems, 'fullTemplateLibraryGrid', 'library');
            }
            // My Prompts
            if ($('#myPromptsSection').is(':visible')) {
                const sortValueUser = $('#sortMyPromptsFilter').val() || 'newest';
                let myPromptsView = filteredItems.filter(p => (p.type.startsWith("Mio") || p.type === "Prompt Utente") && !p.isModel && !p.id.startsWith("sample-"));
                myPromptsView.sort(getSortFunction(sortValueUser));
                showSkeletonLoaders('myPromptsGrid', 0, false);
                populateItemGrid(myPromptsView, 'myPromptsGrid', 'myPrompts');
            }
            // My Models
            if ($('#myModelsSection').is(':visible')) {
                const sortValueUser = $('#sortMyModelsFilter').val() || 'newest';
                let myModelsView = filteredItems.filter(p => (p.type.startsWith("Mio") || p.type === "Prompt Utente") && p.isModel && !p.id.startsWith("sample-"));
                myModelsView.sort(getSortFunction(sortValueUser));
                showSkeletonLoaders('myModelsGrid', 0, false);
                populateItemGrid(myModelsView, 'myModelsGrid', 'myModels');
            }
            // If no grids were visible or handled, ensure all potential loaders are hidden
            ['templateLibraryGrid', 'fullTemplateLibraryGrid', 'myPromptsGrid', 'myModelsGrid'].forEach(id => {
                 if (!visibleGridIds.includes(id) && $(`#${id}`).hasClass('grid-loading')) { // If it was hidden but still loading
                    showSkeletonLoaders(id, 0, false);
                 }
            });

            updateAnalyticsAndCounts();
        }, 250); // Simulate network delay, adjust as needed
    }
    
    function displayUserItems() { 
        userSavedItems = loadUserItems();
        filterAndPopulateLibraries(); 
    }
    function loadUserItems() { // Unchanged
        const items = localStorage.getItem('userSavedItemsPM_v3.2'); // Updated version key
        return items ? JSON.parse(items) : [];
    }

    // Updated saveUserItem to include simulated auto-translation
    function saveUserItem(itemData, isUpdate = false) {
        userSavedItems = loadUserItems();

        // Simulate auto-translation if text_en exists and text_it is not already meaningfully set
        if (itemData.text_en && (!itemData.text_it || itemData.text_it.startsWith("[IT Tradotto]"))) {
            itemData.text_it = `[IT Tradotto] ${itemData.text_en}`; // Simple mock translation
        }


        if (isUpdate) {
            const index = userSavedItems.findIndex(p => p.id === itemData.id);
            if (index > -1) {
                userSavedItems[index] = { ...userSavedItems[index], ...itemData, updated_at: Date.now() };
            } else { 
                itemData.created_at = Date.now();
                userSavedItems.unshift(itemData); 
            }
        } else {
            itemData.created_at = Date.now();
            if (userSavedItems.length >= MAX_ITEMS_FREE_PLAN) {
                showToast("Limite massimo di elementi raggiunto per il piano gratuito.", 4000, "warning");
            }
            userSavedItems.unshift(itemData); 
        }
        userSavedItems.forEach(item => { if (item.popularity === undefined) item.popularity = 0;});

        localStorage.setItem('userSavedItemsPM_v3.2', JSON.stringify(userSavedItems)); // Updated version key
        
        displayUserItems(); 
        updateGettingStartedSection(); 
        populateCategoriesFilter(); 
    }

    function deleteUserItem(itemId) { /* Unchanged */
        userSavedItems = loadUserItems();
        userSavedItems = userSavedItems.filter(p => p.id !== itemId);
        localStorage.setItem('userSavedItemsPM_v3.2', JSON.stringify(userSavedItems));
        displayUserItems();
        showToast("Elemento eliminato con successo.", 2500, 'success');
    }
    function initializeTooltips(container = $('body')) { /* Unchanged */
        container.find('.tooltip').each(function() {});
        container.find('.quick-help-tooltip').off('click.qht').on('click.qht', function(e) {
            e.stopPropagation();
            const helpId = $(this).data('help-id');
            const content = helpTooltipsContent[helpId];
            if (content) {
                let title = $(this).closest('label, h3, h4, button').clone().children().remove().end().text().trim() || 'Suggerimento Utile';
                 if($(this).attr('title')) title = $(this).attr('title'); 
                $('#persistentHelpTitle').html(`<i class="fas ${$(this).hasClass('fa-info-circle') ? 'fa-info-circle' : 'fa-lightbulb'} mr-2"></i>${title}`);
                $('#persistentHelpContent').html(content); 
                $('#persistentHelpTooltip').fadeIn(200);
            }
        });
    }
    $('#closePersistentHelp').on('click', () => $('#persistentHelpTooltip').fadeOut(200));

    // Enhanced Tag Input Logic
    function setupTagInput() {
        const $container = $('#tagInputContainerActual');
        const $input = $('#itemActionModalTagsActualInput');
        const $storage = $('#itemActionModalTagsStorage');

        function renderTags() {
            $container.find('.tag-pill').remove(); // Clear existing pills
            const tags = $storage.val().split(',').filter(tag => tag.trim() !== '');
            tags.forEach(tag => {
                $container.prepend(`<span class="tag-pill">${tag}<button class="remove-tag-btn" data-tag="${tag}">&times;</button></span>`);
            });
        }

        $input.on('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const newTag = $input.val().trim();
                if (newTag) {
                    const currentTags = $storage.val() ? $storage.val().split(',') : [];
                    if (!currentTags.includes(newTag)) {
                        currentTags.push(newTag);
                        $storage.val(currentTags.join(','));
                        renderTags();
                    }
                    $input.val('');
                }
            }
        });

        $container.on('click', '.remove-tag-btn', function() {
            const tagToRemove = $(this).data('tag');
            const currentTags = $storage.val().split(',');
            const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
            $storage.val(updatedTags.join(','));
            renderTags();
        });
        // Initial render if modal is pre-filled (e.g., edit mode)
        if($storage.val()) renderTags(); 
        // Also expose renderTags for external calls if needed
        window.renderModalTags = renderTags;
    }
    
    $('#triggerAutoTranslateBtn').on('click', function() {
        const textEN = $('#itemActionModalTextEN').val();
        if(textEN) {
            // Simulate API call for translation
            showToast("Simulazione traduzione automatica...", 1500, "info");
            setTimeout(() => {
                const translatedText = `[IT Tradotto Automaticamente] ${textEN}`;
                // Here, you would typically update a hidden field or a state variable for text_it
                // For this demo, we'll just show a toast. The actual saving will handle it.
                showToast("Testo tradotto (simulato). Verrà salvato con il prompt/modello.", 2500, "success");
                // If you had a display area for IT text in the modal, you'd update it here.
            }, 1000);
        } else {
            showToast("Inserisci prima il testo in Inglese per la traduzione.", 2000, "warning");
        }
    });


    function openItemActionModal(itemId, mode) { 
        // ... (rest of the function largely unchanged from v3.1, with minor UI tweaks)
        const $modal = $('#itemActionModal');
        const $modalTitle = $('#itemActionModalTitle');
        const $modalIcon = $('#itemActionModalIcon');
        $('#itemActionModalItemId').val(itemId);
        $('#itemActionModalMode').val(mode);

        $('#itemActionModalModelVariableSection, #itemActionModalUseModelVariablesSection, #itemActionModalPreviewSection, #itemActionModalQuickViewInfo, #itemActionModalTextFields, #itemActionModalCommonFields, #itemActionModalMetadataFields, #itemActionModalDetectedVariablesPreviewEN').hide();
        $('#triggerAutoTranslateBtn').addClass('hidden'); // Hide auto-translate button initially
        $('#saveItemModalButton, #copyItemModalButton, #copyAndCloseItemModalButton, #saveAsMyPromptFromModalButton, #useThisTemplateFromQuickViewButton, #closeItemActionModalSecondary').show();

        let itemToProcess = null;
        if (itemId) {
            itemToProcess = allLoadedPrompts.find(p => p.id === itemId) || userSavedItems.find(p => p.id === itemId);
            if (!itemToProcess) {
                showToast("Errore: Elemento non trovato.", 3000, 'error');
                $modal.hide(); return;
            }
        }
        
        const isCreating = mode.startsWith('create');
        const isEditing = mode.startsWith('edit');
        const isUsing = mode.startsWith('use');
        const isModelMode = mode.includes('Model') || (itemToProcess && itemToProcess.isModel);
        const isSavingCopy = mode === 'saveCopy';

        let modalIconClass = 'fa-pencil-alt';
        let modalTitleText = 'Nuovo Elemento';

        if (mode === 'quickView') { // Quick View logic remains same
            modalIconClass = 'fa-eye'; modalTitleText = "Anteprima: " + itemToProcess.title;
            $('#itemActionModalQuickViewInfo').show();
            if (itemToProcess.isModel || itemToProcess.type.includes("Modello")) $('#useThisTemplateFromQuickViewButton').show(); else $('#useThisTemplateFromQuickViewButton').hide();
            
            $('#quickViewItemTitle').text(itemToProcess.title);
            $('#quickViewItemType').html(itemToProcess.isModel ? `<span class="tag tag-model">Modello Avanzato</span>` : `<span class="tag tag-prompt">Prompt Semplice</span>`);
            $('#quickViewItemCategory').text(itemToProcess.category || 'N/D');
            $('#quickViewItemAIModel').text(itemToProcess.aiModel || 'N/D');
            $('#quickViewItemTags').html(itemToProcess.tags.map(t => `<span class="tag bg-darkBg-uiElement text-lightText-subtle">${t}</span>`).join(' '));
            
            $('#quickViewItemTextEN').html( (itemToProcess.text_en || "Testo Inglese non disponibile.").replace(/\n/g, "<br>") );
            // Display IT text if available and different from the auto-translate placeholder if it's meaningful
            if(itemToProcess.text_it && itemToProcess.text_it !== `[IT Tradotto] ${itemToProcess.text_en}` && itemToProcess.text_it !== `[IT Tradotto Automaticamente] ${itemToProcess.text_en}`){
                $('#quickViewItemTextITContainer').show().find('strong').text('Testo (IT):');
                $('#quickViewItemTextIT').html( itemToProcess.text_it.replace(/\n/g, "<br>") );
            } else if (itemToProcess.text_it && (itemToProcess.text_it.startsWith("[IT Tradotto]") || itemToProcess.text_it.startsWith("[IT Tradotto Automaticamente]"))) {
                 $('#quickViewItemTextITContainer').show().find('strong').text('Testo Tradotto (IT - Sim):');
                 $('#quickViewItemTextIT').html( itemToProcess.text_it.replace(/\n/g, "<br>") );
            } else {
                $('#quickViewItemTextITContainer').hide();
            }

            if (itemToProcess.isModel && itemToProcess.variables && itemToProcess.variables.length > 0) {
                $('#quickViewItemVariablesInfo').show();
                $('#quickViewItemVariables').html(itemToProcess.variables.map(v => `<span class="variable-chip">${v.name}</span>`).join(''));
            } else {
                $('#quickViewItemVariablesInfo').hide();
            }
            $('#saveItemModalButton').hide(); 

        } else { 
            $('#itemActionModalCommonFields, #itemActionModalTextFields, #itemActionModalMetadataFields').show();
            $('#saveItemModalButton').show();
            $('#triggerAutoTranslateBtn').removeClass('hidden'); // Show translate button for create/edit
            
            if (isCreating || isSavingCopy) {
                modalIconClass = isModelMode ? 'fa-layer-group' : 'fa-plus-circle';
                modalTitleText = isSavingCopy ? "Salva Copia Come Tuo Elemento" : (isModelMode ? "Crea Nuovo Modello Avanzato" : "Crea Nuovo Prompt Semplice");
                
                $('#itemActionModalTitleInput').val(isSavingCopy ? `Copia di: ${itemToProcess.title}` : '');
                $('#itemActionModalTextEN').val(isSavingCopy ? (itemToProcess.text_en || '') : '');
                // No itemActionModalTextIT input field anymore
                $('#itemActionModalTagsStorage').val(isSavingCopy ? itemToProcess.tags.filter(t => !["esempio", "esterno", "onboarding"].includes(t)).join(',') : '');
                $('#itemActionModalCategory').val(isSavingCopy ? (itemToProcess.category || '') : '');
                $('#itemActionModalAiModel').val(isSavingCopy ? (itemToProcess.aiModel || '') : '');
                
                if (isModelMode) {
                    $('#itemActionModalModelVariableSection').show();
                    renderItemVariablesInModal(isSavingCopy ? (itemToProcess.variables || []) : []);
                    // For new models, also check for spotlight
                     if (isCreating) setTimeout(() => showSpotlight('variables-area'), 200); // Delay for modal animation
                }
                if(isSavingCopy) $('#itemActionModalMode').val(isModelMode ? 'createModelFromCopy' : 'createPromptFromCopy');

            } else if (isEditing) {
                modalIconClass = 'fa-edit';
                modalTitleText = (isModelMode ? "Modifica Modello: " : "Modifica Prompt: ") + itemToProcess.title;
                $('#itemActionModalTitleInput').val(itemToProcess.title);
                $('#itemActionModalTextEN').val(itemToProcess.text_en || '');
                // No itemActionModalTextIT input
                $('#itemActionModalTagsStorage').val(itemToProcess.tags.filter(t => !["personale", "onboarding", "esempio", "esterno"].includes(t)).join(','));
                $('#itemActionModalCategory').val(itemToProcess.category || '');
                $('#itemActionModalAiModel').val(itemToProcess.aiModel || '');
                if (isModelMode) {
                    $('#itemActionModalModelVariableSection').show();
                    renderItemVariablesInModal(itemToProcess.variables || []);
                }
            }
            if(typeof window.renderModalTags === 'function') window.renderModalTags(); // Render tags for edit/copy

            if (isUsing) { // Use mode logic largely same
                modalIconClass = 'fa-bolt';
                modalTitleText = "Usa " + (isModelMode ? "Modello: " : "Prompt: ") + itemToProcess.title;
                $('#itemActionModalCommonFields, #itemActionModalTextFields, #itemActionModalMetadataFields, #itemActionModalModelVariableSection, #saveItemModalButton, #triggerAutoTranslateBtn').hide(); 
                $('#itemActionModalPreviewSection, #copyItemModalButton, #copyAndCloseItemModalButton').show();
                
                const baseTextForUse = getDisplayText(itemToProcess); 
                if (isModelMode && itemToProcess.variables && itemToProcess.variables.length > 0) {
                    $('#itemActionModalUseModelVariablesSection').show();
                    renderUseModelVariableInputs(itemToProcess.variables, baseTextForUse); 
                } else {
                    $('#itemActionModalUseModelVariablesSection').hide();
                    $('#itemActionModalCompletedText').val(baseTextForUse); 
                }
                if (itemToProcess.type.includes("Campione") || itemToProcess.type.includes("Esterno")) { 
                    $('#saveAsMyPromptFromModalButton').show().text(itemToProcess.isModel ? "Salva Copia come Mio Modello" : "Salva Copia come Mio Prompt");
                } else {
                    $('#saveAsMyPromptFromModalButton').hide();
                }
            }
        }
        $modalTitle.html(`<i class="fas ${modalIconClass} mr-3 text-brandPurple-light"></i>${modalTitleText}`);
        $modal.css('display', 'flex').hide().fadeIn(250);
        initializeTooltips($modal);
        setupTagInput(); // Initialize tag input behavior

        $('#itemActionModalTextEN').off('input.autodetect').on('input.autodetect', $.debounce(500, function() {
            if(isModelMode && (isCreating || isEditing || isSavingCopy)) { 
                autoDetectAndUpdateVariablesInModal();
            }
        }));
        if (isModelMode && (isCreating || isEditing || isSavingCopy)) autoDetectAndUpdateVariablesInModal(); 
    }

    function autoDetectAndUpdateVariablesInModal() { // Unchanged from v3.1, only textEN is primary source now
        const textEN = $('#itemActionModalTextEN').val();
        let detectedEN = extractVariablesFromText(textEN);
        
        const $varPreviewEN = $('#itemActionModalDetectedVariablesPreviewEN');
        if(detectedEN.length > 0) $varPreviewEN.show().find('span').text(detectedEN.join(', ')); else $varPreviewEN.hide();

        let currentVarsInUI = [];
        $('#itemVariablesContainer .variable-entry-modal').each(function() {
            const name = $(this).find('.variable-name-input').val();
            const desc = $(this).find('.variable-desc-input').val();
            const example = $(this).find('.variable-example-input').val();
            if (name) currentVarsInUI.push({ name, description: desc, example });
        });

        let newVarsToAdd = [];
        detectedEN.forEach(varName => { // Only from EN now
            if (!currentVarsInUI.find(v => v.name === varName)) {
                newVarsToAdd.push({ name: varName, description: '', example: '' });
            }
        });

        if (newVarsToAdd.length > 0) {
             if ($('#itemVariablesContainer .initial-variable-message').length) {
                $('#itemVariablesContainer .initial-variable-message').remove();
            }
            newVarsToAdd.forEach(v => addVariableToModalUI(v.name, v.description, v.example));
            showToast(`${newVarsToAdd.length} nuova(e) variabile(i) rilevata(e) e aggiunta(e)!`, 2000, 'info');
        }
    }
    function addVariableToModalUI(name = "", description = "", example = "") { /* Unchanged */
        const $container = $('#itemVariablesContainer');
        $container.find('.initial-variable-message').remove();

        const uniqueId = `var-modal-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const newIndex = $container.find('.variable-entry-modal').length;

        const variableHtml = `
            <div class="p-4 bg-darkBg-uiElement/50 rounded-lg border border-darkBg-uiElementHover variable-entry-modal" id="${uniqueId}">
                <div class="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                    <div>
                        <label for="var-name-${newIndex}" class="block text-xs font-medium text-lightText-subtle mb-1">Nome Variabile (es. <code>cliente</code>)</label>
                        <input type="text" id="var-name-${newIndex}" value="${name}" data-index="${newIndex}" class="variable-name-input ph-input text-sm p-2 rounded-md w-full font-mono" placeholder="nome_variabile">
                    </div>
                    <div>
                        <label for="var-desc-${newIndex}" class="block text-xs font-medium text-lightText-subtle mb-1">Descrizione (opzionale)</label>
                        <input type="text" id="var-desc-${newIndex}" value="${description}" data-index="${newIndex}" class="variable-desc-input ph-input text-xs p-2 rounded-md w-full" placeholder="A cosa serve questa variabile">
                    </div>
                    <button class="remove-variable-btn ph-button-danger text-xs py-2 px-2.5 rounded-md self-end md:mb-[1px]" data-target-id="${uniqueId}"><i class="fas fa-trash"></i><span class="sr-only">Rimuovi</span></button>
                </div>
                <div class="mt-2">
                    <label for="var-ex-${newIndex}" class="block text-xs font-medium text-lightText-subtle mb-1">Valore di Esempio (opzionale)</label>
                    <input type="text" id="var-ex-${newIndex}" value="${example}" data-index="${newIndex}" class="variable-example-input ph-input text-xs p-2 rounded-md w-full" placeholder="Es. Mario Rossi, Report Q3">
                </div>
            </div>`;
        $container.append(variableHtml);
        $(`#${uniqueId} .remove-variable-btn`).on('click', function() {
            $(`#${$(this).data('target-id')}`).remove();
            if ($('#itemVariablesContainer .variable-entry-modal').length === 0) {
                $('#itemVariablesContainer').html('<p class="text-xs text-lightText-subtle italic text-center py-2 initial-variable-message">Nessuna variabile definita. Clicca "Aggiungi Variabile" o digitala come <code>[nome_variabile]</code> nel testo.</p>');
            }
        });
    }
    function renderItemVariablesInModal(variables) { /* Unchanged */
        const $container = $('#itemVariablesContainer');
        $container.empty();
        if (!variables || variables.length === 0) {
            $container.html('<p class="text-xs text-lightText-subtle italic text-center py-2 initial-variable-message">Nessuna variabile definita per questo modello. Clicca "Aggiungi Variabile" o digitala come <code>[nome_variabile]</code> nel testo.</p>');
            return;
        }
        variables.forEach((variable, index) => {
            addVariableToModalUI(variable.name, variable.description, variable.example);
        });
    }
    $('#itemAddVariableButton').on('click', function() { /* Unchanged */
        addVariableToModalUI(); 
    });
    $('#itemVariablesContainer').on('click', '.remove-variable-btn', function() { /* Unchanged */
        $(this).closest('.variable-entry-modal').remove();
        if ($('#itemVariablesContainer .variable-entry-modal').length === 0) {
            $('#itemVariablesContainer').html('<p class="text-xs text-lightText-subtle italic text-center py-2 initial-variable-message">Nessuna variabile definita. Clicca "Aggiungi Variabile" o digitala come <code>[nome_variabile]</code> nel testo.</p>');
        }
    });
    function getPlaceholderExampleForVariable(varName, variablesArray = []) { /* Unchanged */
        const variableDefinition = variablesArray.find(v => v.name === varName);
        if (variableDefinition && variableDefinition.example) return variableDefinition.example;

        const varLower = varName.toLowerCase(); 
        if (varLower.includes('argomento') || varLower.includes('topic')) return "Es. Intelligenza Artificiale";
        if (varLower.includes('tono') || varLower.includes('tone')) return "Es. Professionale, Amichevole";
        if (varLower.includes('nome') || varLower.includes('name')) return "Es. Mario Rossi";
        if (varLower.includes('piattaforma') || varLower.includes('platform')) return "Es. LinkedIn, Blog";
        return `Valore per "${varName}"`;
    }
    function renderUseModelVariableInputs(variables, baseText) { /* Unchanged */
        const $inputsContainer = $('#itemActionModalUseModelVariableInputs');
        $inputsContainer.empty();
        if (!variables || variables.length === 0) {
             $('#itemActionModalCompletedText').val(baseText); 
            return;
        }
        variables.forEach(variable => {
            const label = variable.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const description = variable.description ? `<p class="text-xs text-lightText-subtle/80 mt-0.5">${variable.description}</p>` : '';
            $inputsContainer.append(`
                <div class="mb-2.5">
                    <label for="use-var-${variable.name}" class="block text-sm font-medium text-lightText-DEFAULT mb-1">${label}</label>
                    <input type="text" id="use-var-${variable.name}" data-varname="${variable.name}" class="ph-input w-full text-sm p-2.5 rounded-lg use-model-var-input" placeholder="${getPlaceholderExampleForVariable(variable.name, variables)}">
                    ${description}
                </div>`);
        });
        $('.use-model-var-input').off('input.usemodel').on('input.usemodel', $.debounce(150, function() {
            updateFilledItemPreviewInModal(baseText, variables.map(v => v.name));
        }));
        updateFilledItemPreviewInModal(baseText, variables.map(v => v.name)); 
    }
    function updateFilledItemPreviewInModal(baseText, variableNames) { /* Unchanged */
        const variableValues = {};
        variableNames.forEach(varName => {
            variableValues[varName] = $(`#use-var-${varName}`).val();
        });
        $('#itemActionModalCompletedText').val(fillPromptVariables(baseText, variableValues));
    }
    function fillPromptVariables(baseText, variableValues) { /* Unchanged */
        let completedText = baseText;
        for (const varName in variableValues) {
            const regex = new RegExp(`\\[${varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'g');
            const replacement = variableValues[varName] !== "" ? variableValues[varName] : `[${varName}]`;
            completedText = completedText.replace(regex, replacement);
        }
        return completedText;
    }

    // Updated saveItemModalButton handler
    $('#saveItemModalButton').on('click', function() {
        const itemId = $('#itemActionModalItemId').val();
        const mode = $('#itemActionModalMode').val();
        
        const title = $('#itemActionModalTitleInput').val().trim();
        const textEN = $('#itemActionModalTextEN').val();
        // Tags are now read from the hidden storage input
        const tags = ($('#itemActionModalTagsStorage').val() || "").split(',').map(tag => tag.trim()).filter(tag => tag);
        const category = $('#itemActionModalCategory').val().trim();
        const aiModel = $('#itemActionModalAiModel').val().trim();

        if (!title) {
            showToast("Il titolo è obbligatorio.", 3000, 'error');
            $('#itemActionModalTitleInput').focus().addClass('border-dangerRose-DEFAULT'); return;
        }
        $('#itemActionModalTitleInput').removeClass('border-dangerRose-DEFAULT');
        if (!textEN) { // Only check textEN as IT is auto-generated
            showToast("Il testo (EN) del prompt/modello è obbligatorio.", 3500, 'error');
            $('#itemActionModalTextEN').focus().addClass('border-dangerRose-DEFAULT'); return;
        }
        $('#itemActionModalTextEN').removeClass('border-dangerRose-DEFAULT');

        // ... (variable validation logic unchanged) ...
        const isModel = mode.includes('Model'); 
        let itemVariables = [];
        if (isModel) {
            $('#itemVariablesContainer .variable-entry-modal').each(function() {
                const name = $(this).find('.variable-name-input').val().trim();
                const desc = $(this).find('.variable-desc-input').val().trim();
                const example = $(this).find('.variable-example-input').val().trim();
                if (name && /^[a-zA-Z0-9_]+$/.test(name)) { 
                    itemVariables.push({ name: name, description: desc, example: example });
                } else if (name) {
                    showToast(`Nome variabile non valido: "${name}". Usa solo lettere, numeri e underscore.`, 4000, 'error');
                    $(this).find('.variable-name-input').focus().addClass('border-dangerRose-DEFAULT');
                    itemVariables = null; 
                    return false; 
                }
            });
            if (itemVariables === null) return; 

            const varNames = itemVariables.map(v => v.name);
            if (new Set(varNames).size !== varNames.length) {
                showToast("Nomi delle variabili duplicati rilevati. Ogni nome deve essere unico.", 3000, 'error'); return;
            }
        }

        let itemData;
        const isUpdate = mode.startsWith('edit');
        const isFromCopy = mode.includes('FromCopy');

        // text_it will be handled by saveUserItem's auto-translate simulation
        if (isUpdate && !isFromCopy) {
            const originalItem = userSavedItems.find(p => p.id === itemId);
            if (!originalItem) { showToast("Errore: Elemento originale non trovato.", 3000, 'error'); return; }
            itemData = { ...originalItem, title, text_en: textEN, /* text_it removed here */ tags: ["personale", ...new Set(tags)], category, aiModel, updated_at: Date.now() };
            if (isModel) itemData.variables = itemVariables;
        } else {
            itemData = {
                id: `user-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                title, text_en: textEN, /* text_it removed */ isModel: isModel,
                variables: itemVariables,
                type: isModel ? "Mio Modello" : "Mio Prompt",
                tags: ["personale", ...new Set(tags)], category, aiModel,
                icon: isModel ? "fas fa-layer-group" : "fas fa-pencil-alt", // Default icons
                created_at: Date.now(),
                popularity: 0
            };
            if (isFromCopy && itemId) { /* Icon and popularity inheritance from v3.1 unchanged */
                const originalItemForCopy = allLoadedPrompts.find(p => p.id === itemId) || userSavedItems.find(p => p.id === itemId);
                if (originalItemForCopy) {
                    itemData.icon = originalItemForCopy.icon || itemData.icon;
                    itemData.popularity = Math.floor((originalItemForCopy.popularity || 0) * 0.5); 
                }
            }
        }
        saveUserItem(itemData, isUpdate && !isFromCopy);
        $('#itemActionModal').fadeOut(200);
        showToast(`${isModel ? 'Modello' : 'Prompt'} "${itemData.title}" ${isUpdate && !isFromCopy ? 'aggiornato' : 'salvato'}!`, 3000, 'success');
        if(!isUpdate || isFromCopy) triggerConfetti();
    });

    // ... (copy buttons, saveAsMyPrompt, useThisTemplate, close modal handlers unchanged from v3.1) ...
    $('#copyItemModalButton, #copyAndCloseItemModalButton').on('click', function() {
        const textToCopy = $('#itemActionModalCompletedText').val();
        if (!textToCopy) {
            showToast("Nessun testo da copiare.", 2000, 'warning');
            return;
        }
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalHtml = $(this).html();
            const originalClasses = $(this).attr('class');
            $(this).html('<i class="fas fa-check-circle mr-2"></i> Copiato!').removeClass('ph-button-primary ph-button-accent').addClass('bg-accentTeal-DEFAULT text-white');
            
            showToast("Testo copiato negli appunti!", 2000, 'success');
            setTimeout(() => {
                $(this).html(originalHtml).attr('class', originalClasses); 
            }, 2000);
            if ($(this).attr('id') === 'copyAndCloseItemModalButton') {
                 setTimeout(() => $('#itemActionModal').fadeOut(200), 200); 
            }
        }).catch(err => showToast("Errore nel copiare il testo. Riprova.", 3000, 'error'));
    });
    $('#saveAsMyPromptFromModalButton').on('click', function() { 
        const originalItemId = $('#itemActionModalItemId').val();
        const originalItem = allLoadedPrompts.find(p => p.id === originalItemId) || userSavedItems.find(p => p.id === originalItemId);
        if (!originalItem) { showToast("Errore: elemento originale non trovato.", 3000, 'error'); return; }
        
        $('#itemActionModal').fadeOut(200, () => {
            openItemActionModal(originalItemId, 'saveCopy'); 
        });
    });
    $('#useThisTemplateFromQuickViewButton').on('click', function() {
        const itemId = $('#itemActionModalItemId').val();
        $('#itemActionModal').fadeOut(200); 
        const item = allLoadedPrompts.find(p => p.id === itemId) || userSavedItems.find(p => p.id === itemId);
        if (item) {
            openItemActionModal(itemId, item.isModel ? 'useModel' : 'usePrompt');
        }
    });
    $('#closeItemActionModal, #closeItemActionModalSecondary').on('click', () => $('#itemActionModal').fadeOut(200));
    $(document).on('keydown', function(event) { 
        if (event.key === "Escape") {
            if ($('#itemActionModal').is(':visible')) $('#itemActionModal').fadeOut(200);
            if ($('#onboardingOverlay').is(':visible')) { /* No Esc for onboarding */ }
            if ($('#persistentHelpTooltip').is(':visible')) $('#persistentHelpTooltip').fadeOut(200);
            $('.spotlight-tooltip:visible').fadeOut(200); // Close any visible spotlight tooltips
        }
    });

    // Navigation, User Profile, Feedback, Global Translation Toggle (Unchanged from v3.1)
    function navigateToSection(sectionId) { /* Unchanged */
        $('.main-content-section').addClass('hidden');
        $(`#${sectionId}Section`).removeClass('hidden'); 
        $('.sidebar-link').removeClass('active');
        $(`.sidebar-link[data-section="${sectionId}"]`).addClass('active');
        
        $('#searchDashboardInput').attr('placeholder', `Cerca in ${sectionId === 'dashboard' ? 'tutto...' : sectionId + '...'}`);

        filterAndPopulateLibraries(); 
        if (sectionId === 'analytics') updateAnalyticsAndCounts(); 
        if (sectionId === 'templates' && localStorage.getItem('viewedLibraryPM_v3.2') !== 'true') {
             localStorage.setItem('viewedLibraryPM_v3.2', 'true');
             updateGettingStartedSection();
        }
    }
    $('#userProfileButton').on('click', function(e) { e.stopPropagation(); $('#userProfileDropdown').toggleClass('hidden'); });
    $(document).on('click', function(e) { 
        if (!$('#userProfileButton').is(e.target) && $('#userProfileButton').has(e.target).length === 0 &&
            !$('#userProfileDropdown').is(e.target) && $('#userProfileDropdown').has(e.target).length === 0) {
            $('#userProfileDropdown').addClass('hidden');
        }
        if (!$('#persistentHelpTooltip').is(e.target) && $('#persistentHelpTooltip').has(e.target).length === 0 &&
            !$(e.target).hasClass('quick-help-tooltip') && $(e.target).closest('.quick-help-tooltip').length === 0 ) {
            $('#persistentHelpTooltip').fadeOut(200);
        }
    });
    $('#logoutButton').on('click', function() { showToast("Logout simulato...", 2000); $('#userProfileDropdown').addClass('hidden'); });
    $('#feedbackForm').on('submit', function(e) { e.preventDefault(); console.log("Feedback Inviato:", {type: $('#feedbackType').val(), message: $('#feedbackMessage').val()}); showToast("Grazie per il tuo feedback!", 3000, 'success'); $('#feedbackMessage').val(''); $(this)[0].reset(); navigateToSection('dashboard'); });
    $('#globalItalianTranslationToggleBtn').on('click', function() { /* Unchanged */
        globalShowItalianTranslations = !globalShowItalianTranslations;
        localStorage.setItem('globalShowItalianTranslationsPM_v3.2', globalShowItalianTranslations);
        showToast(`Visualizzazione testi: ${globalShowItalianTranslations ? "Italiano (se disponibile)" : "Originale (EN)"}`, 2500);
        updateGlobalItalianTranslationToggleButton();
        $('.ph-card[data-item-id]').data('current-display-lang', globalShowItalianTranslations ? 'it' : 'en');
        filterAndPopulateLibraries(); 
    });
    function updateGlobalItalianTranslationToggleButton() { /* Unchanged */
        const $btn = $('#globalItalianTranslationToggleBtn');
        const $tooltipText = $btn.parent('.tooltip').find('.tooltiptext'); 
        if (globalShowItalianTranslations) {
            $btn.addClass('active'); 
            if($tooltipText.length) $tooltipText.text('Mostra Testi Originali (Inglese)');
            $btn.attr('title', 'Mostra Testi Originali (Inglese)');
        } else {
            $btn.removeClass('active');
            if($tooltipText.length) $tooltipText.text('Mostra Traduzioni Italiane');
            $btn.attr('title', 'Mostra Traduzioni Italiane');
        }
    }

    // Event Listeners & Initial Setup (largely unchanged, ensure correct localStorage keys)
    userSavedItems = loadUserItems();
    if (onboardingState.completed) {
        $('#onboardingOverlay').hide();
        $('#mainDashboardContent').removeClass('hidden').addClass('flex');
        navigateToSection('dashboard'); 
    } else {
        $('#onboardingOverlay').css('display', 'flex'); 
        renderOnboardingStep(1);
    }
    updateGettingStartedSection(); 
    $('#onboardingGlobalCloseButton').on('click', closeOnboarding);
    $('#createNewPromptSidebarBtn, #openCreateNewPromptBtnMyPrompts').on('click', (e) => { e.preventDefault(); openItemActionModal(null, 'createPrompt'); });
    $('#createNewModelSidebarBtn, #openCreateNewModelBtnMyModels').on('click', (e) => { e.preventDefault(); openItemActionModal(null, 'createModel'); });
    $('#hideGettingStartedBtn').on('click', function() { $('#gettingStartedSection').slideUp(300, () => localStorage.setItem('gettingStartedHiddenPM_v3.2', 'true')); });
    if(localStorage.getItem('gettingStartedHiddenPM_v3.2') === 'true') $('#gettingStartedSection').hide();
    $('#categoryFilter, #fullLibraryCategoryFilter, #sortTemplatesFilter, #sortFullLibraryFilter, #sortMyPromptsFilter, #sortMyModelsFilter').on('change', filterAndPopulateLibraries);
    $('#searchDashboardInput').on('input', $.debounce(350, filterAndPopulateLibraries));
    $('body').on('click', '.use-item-btn', function() { /* Unchanged */
        const itemId = $(this).closest('.ph-card').data('item-id');
        const item = allLoadedPrompts.find(p=>p.id===itemId) || userSavedItems.find(p=>p.id===itemId);
        if (item) openItemActionModal(itemId, item.isModel ? 'useModel' : 'usePrompt');
    });
    $('body').on('click', '.quick-view-btn', function() { /* Unchanged */
        const itemId = $(this).closest('.ph-card').data('item-id');
        openItemActionModal(itemId, 'quickView');
    });
    $('body').on('click', '.edit-item-btn', function() { /* Unchanged */
        const itemId = $(this).closest('.ph-card').data('item-id');
        const item = userSavedItems.find(p=>p.id===itemId); 
        if (item) openItemActionModal(itemId, item.isModel ? 'editModel' : 'editPrompt');
    });
    $('body').on('click', '.delete-item-btn', function() { /* Unchanged */
        const itemId = $(this).closest('.ph-card').data('item-id');
        const itemToDelete = userSavedItems.find(p => p.id === itemId);
        if (itemToDelete && confirm(`Sei sicuro di voler eliminare "${itemToDelete.title}"? L'azione è irreversibile.`)) {
            deleteUserItem(itemId);
        }
    });
    $('body').on('click', '.add-to-my-items-btn', function() { /* Unchanged */
        const itemId = $(this).closest('.ph-card').data('item-id');
        const itemToCopy = allLoadedPrompts.find(p=>p.id===itemId);
        if (itemToCopy) {
            openItemActionModal(itemId, 'saveCopy');
        } else {
            showToast("Impossibile trovare l'elemento da copiare.", 3000, 'error');
        }
    });
    $('.sidebar-link').on('click', function(e) { e.preventDefault(); const section = $(this).data('section'); if (section) { navigateToSection(section); $('#userProfileDropdown').addClass('hidden'); } });
    $('button[data-section-link]').on('click', function() { const sectionId = $(this).data('section-link'); navigateToSection(sectionId); });
    $('#viewAllTemplatesLink').on('click', function(e) { e.preventDefault(); navigateToSection('templates'); });
    
    function updateAnalyticsAndCounts() { /* Unchanged */
        const totalUserItems = userSavedItems.length;
        const userPromptsCount = userSavedItems.filter(item => !item.isModel).length;
        const userModelsCount = userSavedItems.filter(item => item.isModel).length;

        $('#sidebarPromptCount').text(userPromptsCount);
        $('#sidebarModelCount').text(userModelsCount);

        $('#statCardTotalPrompts').text(userPromptsCount);
        $('#statCardTotalModels').text(userModelsCount);
        $('#statsTotalItems').text(totalUserItems);
        $('#statsTotalSimplePrompts').text(userPromptsCount);
        $('#statsTotalModelsDetail').text(userModelsCount);

        const usagePercentage = Math.min(100, (totalUserItems / MAX_ITEMS_FREE_PLAN) * 100);
        $('#usageProgressBar').css('width', `${usagePercentage}%`);
        $('#usagePercentageText').text(`${Math.round(usagePercentage)}%`);
        $('#usageCountText').text(`${totalUserItems}/${MAX_ITEMS_FREE_PLAN} elementi`);
        
        const tagCounts = {};
        userSavedItems.forEach(item => {
            item.tags.filter(t => !["personale", "onboarding", "esterno", "esempio"].includes(t)).forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        const sortedTags = Object.entries(tagCounts).sort(([,a],[,b]) => b-a).slice(0, 5);
        $('#statsTopTags').html(sortedTags.length > 0 ? sortedTags.map(([tag, count]) => `<span class="tag bg-darkBg-uiElement text-lightText-subtle">${tag} (${count})</span>`).join('') : "<p class='text-sm text-lightText-subtle italic'>Nessun tag di rilievo ancora.</p>");

        const recentItems = [...userSavedItems].sort((a,b) => (b.updated_at || b.created_at || 0) - (a.updated_at || a.created_at || 0)).slice(0,5);
        $('#statsRecentItems').html(recentItems.length > 0 ? recentItems.map(p => `
            <div class="p-3 border-b border-darkBg-uiElement/50 hover:bg-darkBg-uiElement/30 rounded-md transition-colors duration-150 flex justify-between items-center">
                <div>
                    <a href="#" class="font-medium text-brandPurple-light hover:underline use-item-btn" data-item-id="${p.id}">${p.title}</a>
                    <span class="block text-xs text-lightText-subtle">${p.isModel ? 'Modello' : 'Prompt'} - ${new Date(p.updated_at || p.created_at).toLocaleDateString('it-IT', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'})}</span>
                </div>
                <button class="ph-button-secondary text-xs py-1 px-2.5 rounded-md quick-view-btn" data-item-id="${p.id}"><i class="fas fa-eye"></i></button>
            </div>`).join('') : "<p class='text-sm text-lightText-subtle italic'>Nessun contenuto modificato o creato di recente.</p>");
        initializeTooltips($('#statsRecentItems')); 
    }
   
    loadAndProcessExternalPrompts(); 
    updateGlobalItalianTranslationToggleButton(); 
    initializeTooltips(); 
    console.log("Prompt Maestro v3.2 Initialized.");
});