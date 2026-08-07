/* ==========================================================================
   KAIROSAI INVESTOR PITCH DECK ENGINE (1920x1080 Interactive Presenter)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    let currentSlide = 1;
    const totalSlides = 10;

    const presentation = document.getElementById('presentation');
    const currentSlideNumEl = document.getElementById('current-slide-num');
    const progressFillEl = document.getElementById('progress-fill');
    const thumbnailStripEl = document.getElementById('thumbnail-strip');
    const speakerNotesModal = document.getElementById('speaker-notes-modal');
    const notesContentEl = document.getElementById('notes-content');
    const notesSlideNumEl = document.getElementById('notes-slide-num');
    const overviewOverlay = document.getElementById('overview-overlay');
    const overviewGridEl = document.getElementById('overview-grid');

    // Slide Titles and Speaker Notes Database
    const slideData = [
        {
            title: "Title & Cover Vision",
            notes: `<strong>Elevator Pitch (60s):</strong> "KairosAI is an intelligent network threat detection and analysis tool tailored for small organizations and educational institutions. By combining traditional packet monitoring with machine learning and large language models, it detects anomalies in real time and explains them in plain English."<br><br><strong>Key Talking Points:</strong><br>• Introduce team roles: Meet Shah (Backend Lead), Pranav Mishra (Frontend Lead), Jainam Dave (AI/ML Specialist), Bhaavya Mehta (QA & Security).<br>• Emphasize the core value: Democratizing enterprise security for underserved SMBs.`
        },
        {
            title: "Urgent SMB Crisis",
            notes: `<strong>Key Talking Points:</strong><br>• 43% of cyberattacks hit SMBs, yet 80% of ransomware focuses on companies <1,000 employees.<br>• Attack breakout time inside networks is down to 48 minutes.<br>• 79% of intrusions are malware-free (credential theft/living-off-the-land) that static firewalls miss.<br><br><strong>Investor Q&A Cue:</strong> <em>"Why focus on SMBs?"</em> SMBs are disproportionately targeted and cannot afford $150k+ SOC teams.`
        },
        {
            title: "The KairosAI Solution",
            notes: `<strong>Key Talking Points:</strong><br>• Walk through the 4 pillars: Sniffing → Dual ML → LLM XAI → React Dashboard.<br>• Random Forest handles tabular flow features with 99%+ accuracy.<br>• Isolation Forest catches zero-day novel anomalies without signatures.<br>• Llama 3 via Ollama translates tech alerts into plain-English mitigation advice.`
        },
        {
            title: "Market Opportunity",
            notes: `<strong>Key Talking Points:</strong><br>• TAM: $50.2B Global SMB Cybersecurity Market.<br>• SAM: $12.4B SMB Network Intrusion & Threat Detection.<br>• SOM: $450M Target initial focus in Higher-Ed labs, MSP partners, and high-risk SMBs.<br>• Highlight channel scalability with MSP partners managing multiple SMB clients.`
        },
        {
            title: "System Architecture",
            notes: `<strong>Key Talking Points:</strong><br>• Walk step-by-step through packet capture to dashboard.<br>• Fast metadata extraction avoids PII privacy risks.<br>• Async FastAPI backend ensures real-time low-latency flow scoring.`
        },
        {
            title: "Investor Demo Applications",
            notes: `<strong>Key Talking Points:</strong><br>• Walk investors through the 5 target applications being developed for live demonstration.<br>• <strong>1. Customer App:</strong> Real e-commerce target illustrating how KairosAI monitors production web traffic without compromising PII.<br>• <strong>2. Security Dashboard:</strong> Core SOC product showing live packet sniffer feeds, anomaly scoring, and Llama 3 XAI natural language alerts.<br>• <strong>3. Attack Simulator:</strong> Adversary test bench to trigger on-demand SYN floods, port scans, and SQLi for instant validation.<br>• <strong>4. Developer Portal:</strong> Webhook triggers, API key administration, and REST integration docs.<br>• <strong>5. Mobile App:</strong> Pocket SOC companion for push notifications and emergency host isolation.`
        },
        {
            title: "Product Capabilities",
            notes: `<strong>Key Talking Points:</strong><br>• Demo the Live Threat Monitor UI snippet.<br>• Highlight <1ms ML inference latency.<br>• Explainability prevents alarm fatigue: non-experts understand *why* an alert fired and *what* action to take.`
        },
        {
            title: "Competitive Landscape",
            notes: `<strong>Key Talking Points:</strong><br>• Compare KairosAI with Zeek/Snort, Splunk/CrowdStrike, and Darktrace.<br>• Key differentiators: Built-in natural language XAI, <15 minute plug-and-play setup, <$3,600/yr TCO.`
        },
        {
            title: "Team Execution & Ownership",
            notes: `<strong>Key Talking Points:</strong><br>• <strong>Meet Shah (Backend Lead):</strong> Scapy sniffer (4k+ pkts/sec), FastAPI server, SQLite persistence, REST & Webhook APIs.<br>• <strong>Pranav Mishra (Frontend Lead):</strong> React SOC dashboard, React Flow topology, Tailwind CSS tokens & 5 Investor Demo Apps.<br>• <strong>Jainam Dave (AI/ML Specialist):</strong> Dual ML models (Random Forest + Isolation Forest), local Llama 3 XAI prompt design & CIC-IDS tuning.<br>• <strong>Bhaavya Mehta (QA & Security Lead):</strong> Adversary Attack Simulator (DDoS/SQLi/Port scan), GDPR privacy testing, PDF report generation.`
        },
        {
            title: "Conclusion & Final Vision",
            notes: `<strong>Key Talking Points:</strong><br>• Summarize KairosAI's mission: Bringing enterprise-grade autonomous threat detection & XAI to every SMB.<br>• Highlight the 3 core pillars: Real-time ML anomaly detection (<1ms), Plain-English Llama 3 XAI explanations, and zero-friction plug-and-play setup.<br>• Conclude with team readiness and next steps for deployment & partnership opportunities.`
        }
    ];

    /* ----------------------------------------------------------------------
       1. Viewport Scaling Engine (Fits 1920x1080 to any window size)
       ---------------------------------------------------------------------- */
    function scalePresentation() {
        const wrapper = document.querySelector('.viewport-wrapper');
        if (!wrapper || !presentation) return;

        const windowWidth = wrapper.clientWidth - 40; // padding adjustment
        const windowHeight = wrapper.clientHeight - 40;

        const scaleX = windowWidth / 1920;
        const scaleY = windowHeight / 1080;

        const scale = Math.min(scaleX, scaleY, 1); // cap at 1.0 scale

        presentation.style.transform = `scale(${scale})`;
    }

    window.addEventListener('resize', scalePresentation);
    scalePresentation();

    /* ----------------------------------------------------------------------
       2. Slide 6 Demo Application Showcase Switcher & Tab Cycling
       ---------------------------------------------------------------------- */
    const appCards = document.querySelectorAll('.app-item-card');
    const demoPanels = document.querySelectorAll('.demo-panel');
    const demoUrlText = document.getElementById('demo-url-text');
    let activeAppIndex = 0;

    const demoUrls = {
        'customer-app': 'https://demo.kairosstore.io/checkout',
        'security-dashboard': 'https://soc.kairosai.io/dashboard',
        'attack-simulator': 'https://sim.kairosai.io/adversary-console',
        'developer-portal': 'https://developer.kairosai.io/docs/v1',
        'mobile-app': 'https://app.kairosai.io/mobile-preview'
    };

    function selectAppTab(index) {
        if (!appCards.length) return;
        if (index < 0) index = 0;
        if (index >= appCards.length) index = appCards.length - 1;

        activeAppIndex = index;
        const card = appCards[activeAppIndex];
        if (!card) return;

        const target = card.getAttribute('data-app-target');

        // Remove active from all cards
        appCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        // Show target panel
        demoPanels.forEach(panel => {
            if (panel.id === `panel-${target}`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });

        // Update URL bar text
        if (demoUrlText && demoUrls[target]) {
            demoUrlText.textContent = demoUrls[target];
        }

        // Refresh icons if lucide exists
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    appCards.forEach((card, idx) => {
        card.addEventListener('click', () => {
            selectAppTab(idx);
        });
    });

    /* ----------------------------------------------------------------------
       3. Slide Navigation Logic
       ---------------------------------------------------------------------- */
    function goToSlide(n) {
        const prevSlideNum = currentSlide;
        if (n < 1) n = 1;
        if (n > totalSlides) n = totalSlides;

        // Hide all slides
        document.querySelectorAll('.slide').forEach(slide => {
            slide.classList.remove('active');
        });

        // Show target slide
        const targetSlide = document.getElementById(`slide-${n}`);
        if (targetSlide) {
            targetSlide.classList.add('active');
        }

        currentSlide = n;

        // If entering Slide 6 from previous slide (Slide 5), select first tab
        // If entering Slide 6 from next slide (Slide 7), select last tab
        if (currentSlide === 6) {
            if (prevSlideNum < 6) {
                selectAppTab(0);
            } else if (prevSlideNum > 6) {
                selectAppTab(appCards.length - 1);
            }
        }

        // Update UI counters
        if (currentSlideNumEl) currentSlideNumEl.textContent = currentSlide;
        if (progressFillEl) progressFillEl.style.width = `${(currentSlide / totalSlides) * 100}%`;

        // Update Thumbnail active state
        document.querySelectorAll('.thumb-item').forEach((thumb, idx) => {
            if (idx + 1 === currentSlide) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });

        // Update Speaker Notes content
        if (notesContentEl && notesSlideNumEl) {
            notesSlideNumEl.textContent = currentSlide;
            notesContentEl.innerHTML = slideData[currentSlide - 1].notes;
        }

        // Trigger chart animation if present
        if (currentSlide === 2 && !window.chartProblemInitialized) {
            initChartProblem();
        }
    }

    function navigateNext() {
        if (currentSlide === 6) {
            if (activeAppIndex < appCards.length - 1) {
                selectAppTab(activeAppIndex + 1);
                return;
            }
        }
        goToSlide(currentSlide + 1);
    }

    function navigatePrev() {
        if (currentSlide === 6) {
            if (activeAppIndex > 0) {
                selectAppTab(activeAppIndex - 1);
                return;
            }
        }
        goToSlide(currentSlide - 1);
    }

    // Controls Event Listeners
    document.getElementById('btn-prev')?.addEventListener('click', navigatePrev);
    document.getElementById('btn-next')?.addEventListener('click', navigateNext);
    document.getElementById('btn-first')?.addEventListener('click', () => goToSlide(1));
    document.getElementById('btn-last')?.addEventListener('click', () => goToSlide(totalSlides));

    /* ----------------------------------------------------------------------
       4. Keyboard Controls
       ---------------------------------------------------------------------- */
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ':
            case 'PageDown':
                e.preventDefault();
                navigateNext();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                navigatePrev();
                break;
            case 'Home':
                e.preventDefault();
                goToSlide(1);
                break;
            case 'End':
                e.preventDefault();
                goToSlide(totalSlides);
                break;
            case 'f':
            case 'F':
                toggleFullscreen();
                break;
            case 'n':
            case 'N':
                toggleSpeakerNotes();
                break;
            case 'm':
            case 'M':
                toggleOverview();
                break;
            case 'p':
            case 'P':
                window.print();
                break;
        }
    });

    /* ----------------------------------------------------------------------
       5. Speaker Notes & Overview Modals
       ---------------------------------------------------------------------- */
    function toggleSpeakerNotes() {
        if (speakerNotesModal) {
            speakerNotesModal.classList.toggle('active');
        }
    }

    function toggleOverview() {
        if (overviewOverlay) {
            overviewOverlay.classList.toggle('active');
        }
    }

    document.getElementById('btn-notes')?.addEventListener('click', toggleSpeakerNotes);
    document.getElementById('close-notes-btn')?.addEventListener('click', toggleSpeakerNotes);

    document.getElementById('btn-overview')?.addEventListener('click', toggleOverview);
    document.getElementById('close-overview-btn')?.addEventListener('click', toggleOverview);

    document.getElementById('btn-fullscreen')?.addEventListener('click', toggleFullscreen);
    document.getElementById('btn-print')?.addEventListener('click', () => window.print());

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.log(err));
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    /* ----------------------------------------------------------------------
       6. Render Thumbnail Strip & Overview Grid
       ---------------------------------------------------------------------- */
    function renderThumbnailsAndOverview() {
        if (thumbnailStripEl) {
            thumbnailStripEl.innerHTML = '';
            for (let i = 1; i <= totalSlides; i++) {
                const thumb = document.createElement('div');
                thumb.className = `thumb-item ${i === 1 ? 'active' : ''}`;
                thumb.textContent = i;
                thumb.title = slideData[i - 1].title;
                thumb.addEventListener('click', () => goToSlide(i));
                thumbnailStripEl.appendChild(thumb);
            }
        }

        if (overviewGridEl) {
            overviewGridEl.innerHTML = '';
            for (let i = 1; i <= totalSlides; i++) {
                const card = document.createElement('div');
                card.className = 'overview-card';
                card.innerHTML = `
                    <span class="overview-num">SLIDE ${i}</span>
                    <h4 class="overview-title">${slideData[i - 1].title}</h4>
                `;
                card.addEventListener('click', () => {
                    goToSlide(i);
                    toggleOverview();
                });
                overviewGridEl.appendChild(card);
            }
        }
    }

    renderThumbnailsAndOverview();

    /* ----------------------------------------------------------------------
       7. Chart.js Data Visualizations
       ---------------------------------------------------------------------- */
    function initChartProblem() {
        const ctx = document.getElementById('chart-problem')?.getContext('2d');
        if (!ctx) return;

        window.chartProblemInitialized = true;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Targeted Attacks (SMBs)', 'Ransomware (<1k Empl)', 'Malware-Free Intrusions', 'AI Phishing Click-Rate'],
                datasets: [{
                    label: 'Impact Percentage (%)',
                    data: [43, 80, 79, 54],
                    backgroundColor: [
                        '#e11d48',
                        '#d97706',
                        '#0284c7',
                        '#4f46e5'
                    ],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: value => value + '%'
                        }
                    }
                }
            }
        });
    }

    // Initialize first slide
    goToSlide(1);
});
